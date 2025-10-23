#!/bin/bash
# Restore claude-code-collective backup from 2025-10-22T17:44:35.134Z

echo "🔄 Restoring claude-code-collective backup..."

# Copy backed up files back to project
cp -r "/Users/giperpetr/Documents/Programming/ArenaHUB/.claude-backups/1761155050991/"* "/Users/giperpetr/Documents/Programming/ArenaHUB/"

echo "✅ Restored successfully!"
echo "💡 You may need to restart Claude Code to reload configurations."
echo ""
echo "Backup location: /Users/giperpetr/Documents/Programming/ArenaHUB/.claude-backups/1761155050991"
