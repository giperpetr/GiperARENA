#!/usr/bin/env node
/**
 * Seed Media Files Script
 *
 * This script:
 * 1. Generates placeholder images (SVG) for arenas, users, devices
 * 2. Uploads them to MinIO via Supabase Storage API
 * 3. Creates media_files records in database
 * 4. Updates entities with correct media URLs
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://api.gipergiraffe.com';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'giperarena';

if (!SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

// Database configuration
const DB_CONFIG = {
  host: process.env.PGHOST || 'api.gipergiraffe.com',
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || 'postgres',
  user: process.env.PGUSER || 'postgres.giper_prod',
  password: process.env.PGPASSWORD,
};

if (!DB_CONFIG.password) {
  console.error('❌ PGPASSWORD environment variable is required');
  process.exit(1);
}

// Placeholder SVG generators
function generateAvatarSVG(username, color) {
  const initial = username.charAt(0).toUpperCase();
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="${color}"/>
  <text x="100" y="130" font-family="Arial, sans-serif" font-size="100" font-weight="bold" fill="white" text-anchor="middle">${initial}</text>
</svg>`;
}

function generateArenaBannerSVG(arenaName, type) {
  const colors = {
    combat: '#dc2626',
    racing: '#2563eb',
    crawler: '#059669',
    multipurpose: '#7c3aed',
    testing: '#6b7280'
  };
  const bgColor = colors[type] || '#6b7280';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#000;stop-opacity:0.8" />
    </linearGradient>
  </defs>
  <rect width="1200" height="400" fill="url(#grad)"/>
  <text x="600" y="220" font-family="Arial, sans-serif" font-size="60" font-weight="bold" fill="white" text-anchor="middle">${arenaName}</text>
  <text x="600" y="280" font-family="Arial, sans-serif" font-size="30" fill="#e5e5e5" text-anchor="middle">${type.toUpperCase()} ARENA</text>
</svg>`;
}

function generateDeviceImageSVG(deviceName, category) {
  const icons = {
    robot: '🤖',
    drone: '🚁',
    crawler: '🦾',
    vehicle: '🚗',
    other: '⚙️'
  };
  const icon = icons[category] || '⚙️';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#1f2937"/>
  <text x="400" y="280" font-family="Arial, sans-serif" font-size="120" text-anchor="middle">${icon}</text>
  <text x="400" y="380" font-family="Arial, sans-serif" font-size="40" font-weight="bold" fill="white" text-anchor="middle">${deviceName}</text>
</svg>`;
}

// Upload file to Supabase Storage
async function uploadToStorage(filePath, fileBuffer, mimeType) {
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${filePath}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': mimeType,
      'Content-Length': fileBuffer.length.toString(),
    },
    body: fileBuffer,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Upload failed: ${response.status} ${error}`);
  }

  return await response.json();
}

// Create media_files record in database
async function createMediaFileRecord(pg, data) {
  const query = `
    INSERT INTO giperarena.media_files
    (id, file_type, entity_type, entity_id, bucket, path, filename, mime_type, size_bytes, width, height, uploaded_by, metadata)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING id, path
  `;

  const result = await pg.query(query, [
    data.id,
    data.file_type,
    data.entity_type,
    data.entity_id,
    data.bucket,
    data.path,
    data.filename,
    data.mime_type,
    data.size_bytes,
    data.width,
    data.height,
    data.uploaded_by,
    data.metadata
  ]);

  return result.rows[0];
}

// Main execution
async function main() {
  const { Client } = require('pg');
  const pg = new Client(DB_CONFIG);

  try {
    await pg.connect();
    console.log('✅ Connected to database');

    // Get admin user ID
    const adminResult = await pg.query("SELECT id FROM giperarena.users WHERE username = 'admin' LIMIT 1");
    if (adminResult.rows.length === 0) {
      throw new Error('Admin user not found');
    }
    const adminId = adminResult.rows[0].id;
    console.log(`✅ Found admin user: ${adminId}`);

    let uploadCount = 0;

    // ========================================
    // 1. USER AVATARS
    // ========================================
    console.log('\n📸 Generating user avatars...');
    const users = await pg.query('SELECT id, username FROM giperarena.users');
    const avatarColors = [
      '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
      '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
    ];

    for (let i = 0; i < users.rows.length; i++) {
      const user = users.rows[i];
      const color = avatarColors[i % avatarColors.length];
      const svg = generateAvatarSVG(user.username, color);
      const buffer = Buffer.from(svg, 'utf-8');
      const filename = `avatar-${user.username}.svg`;
      const filePath = `avatars/${user.id}/${filename}`;

      try {
        await uploadToStorage(filePath, buffer, 'image/svg+xml');

        const mediaId = crypto.randomUUID();
        await createMediaFileRecord(pg, {
          id: mediaId,
          file_type: 'avatar',
          entity_type: 'user',
          entity_id: user.id,
          bucket: BUCKET_NAME,
          path: filePath,
          filename: filename,
          mime_type: 'image/svg+xml',
          size_bytes: buffer.length,
          width: 200,
          height: 200,
          uploaded_by: adminId,
          metadata: JSON.stringify({ color, generated: true })
        });

        // Update user avatar_url
        await pg.query(
          'UPDATE giperarena.users SET avatar_url = $1 WHERE id = $2',
          [`${BUCKET_NAME}/${filePath}`, user.id]
        );

        uploadCount++;
        console.log(`  ✓ ${user.username}: ${filePath}`);
      } catch (error) {
        console.error(`  ✗ Failed to upload avatar for ${user.username}:`, error.message);
      }
    }

    // ========================================
    // 2. ARENA BANNERS
    // ========================================
    console.log('\n🏟️  Generating arena banners...');
    const arenas = await pg.query('SELECT id, name, arena_type FROM giperarena.arenas');

    for (const arena of arenas.rows) {
      const svg = generateArenaBannerSVG(arena.name, arena.arena_type);
      const buffer = Buffer.from(svg, 'utf-8');
      const filename = `banner-${arena.name.toLowerCase().replace(/\s+/g, '-')}.svg`;
      const filePath = `arenas/${arena.id}/banner/${filename}`;

      try {
        await uploadToStorage(filePath, buffer, 'image/svg+xml');

        const mediaId = crypto.randomUUID();
        await createMediaFileRecord(pg, {
          id: mediaId,
          file_type: 'banner',
          entity_type: 'arena',
          entity_id: arena.id,
          bucket: BUCKET_NAME,
          path: filePath,
          filename: filename,
          mime_type: 'image/svg+xml',
          size_bytes: buffer.length,
          width: 1200,
          height: 400,
          uploaded_by: adminId,
          metadata: JSON.stringify({ arena_type: arena.arena_type, generated: true })
        });

        // Update arena media_urls
        const mediaUrls = { images: [`${BUCKET_NAME}/${filePath}`], videos: [] };
        await pg.query(
          'UPDATE giperarena.arenas SET media_urls = $1 WHERE id = $2',
          [JSON.stringify(mediaUrls), arena.id]
        );

        uploadCount++;
        console.log(`  ✓ ${arena.name}: ${filePath}`);
      } catch (error) {
        console.error(`  ✗ Failed to upload banner for ${arena.name}:`, error.message);
      }
    }

    // ========================================
    // 3. DEVICE IMAGES
    // ========================================
    console.log('\n🤖 Generating device images...');
    const devices = await pg.query(`
      SELECT d.id, d.name, dt.category
      FROM giperarena.devices d
      JOIN giperarena.device_types dt ON d.device_type_id = dt.id
      LIMIT 10
    `);

    for (const device of devices.rows) {
      const svg = generateDeviceImageSVG(device.name, device.category);
      const buffer = Buffer.from(svg, 'utf-8');
      const filename = `device-${device.name.toLowerCase().replace(/\s+/g, '-')}.svg`;
      const filePath = `devices/${device.id}/${filename}`;

      try {
        await uploadToStorage(filePath, buffer, 'image/svg+xml');

        const mediaId = crypto.randomUUID();
        await createMediaFileRecord(pg, {
          id: mediaId,
          file_type: 'image',
          entity_type: 'device',
          entity_id: device.id,
          bucket: BUCKET_NAME,
          path: filePath,
          filename: filename,
          mime_type: 'image/svg+xml',
          size_bytes: buffer.length,
          width: 800,
          height: 600,
          uploaded_by: adminId,
          metadata: JSON.stringify({ category: device.category, generated: true })
        });

        // Update device metadata with image path
        await pg.query(
          `UPDATE giperarena.devices
           SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{image_url}', $1)
           WHERE id = $2`,
          [JSON.stringify(`${BUCKET_NAME}/${filePath}`), device.id]
        );

        uploadCount++;
        console.log(`  ✓ ${device.name}: ${filePath}`);
      } catch (error) {
        console.error(`  ✗ Failed to upload image for ${device.name}:`, error.message);
      }
    }

    console.log(`\n✅ Upload complete! ${uploadCount} files uploaded to MinIO`);

    // Verify media_files count
    const mediaCount = await pg.query('SELECT COUNT(*) FROM giperarena.media_files');
    console.log(`📊 Total media_files records: ${mediaCount.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await pg.end();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
