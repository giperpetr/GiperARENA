#!/bin/bash
set -e

SERVICE="frontend"
TAG=$(git rev-parse --short HEAD)

echo "🚀 Starting full deployment for $SERVICE with tag $TAG"

# 1. Build AMD64 image
echo "📦 Step 1: Building AMD64 image..."
./scripts/build-amd64.sh

# 2. Push image to Docker Hub
echo "⬆️ Step 2: Pushing image to Docker Hub..."
docker push giperpetr/giperarena-frontend:$TAG
echo "✅ Image giperpetr/giperarena-frontend:$TAG pushed to Docker Hub."

# 3. Update docker-compose.prod.yml on server
echo "📝 Step 3: Updating docker-compose.prod.yml on server..."
./scripts/update-compose.sh $TAG

# 4. Deploy to server
echo "🚀 Step 4: Deploying to server..."
./scripts/deploy-to-server.sh

echo "🎉 Full deployment completed successfully!"
echo "🌐 Check the site: https://giperarena.space"
