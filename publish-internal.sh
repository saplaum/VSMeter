#!/bin/bash

# VSMeter Internal GitHub Pages Deployment Script
# This script builds and deploys the app to internal gh-pages branch

set -e  # Exit on error

echo "🚀 Starting VSMeter internal deployment..."

# Build the project
echo "📦 Building project..."
npm run build

# Navigate to dist folder
cd dist

# Replace __BASE_PATH__ placeholder in 404.html with internal base path
echo "🔧 Configuring 404.html for internal deployment..."
sed -i.bak 's|__BASE_PATH__|/SAPLAUM/VSMeter/|g' 404.html
rm 404.html.bak

# Initialize git if needed
if [ ! -d .git ]; then
  echo "🔧 Initializing git in dist folder..."
  git init
  git branch -M gh-pages
  git remote add origin git@git.i.mercedes-benz.com:SAPLAUM/VSMeter.git
fi

# Add .nojekyll to bypass Jekyll processing
echo "🔧 Adding .nojekyll file..."
touch .nojekyll

# Stage all files
echo "📝 Staging files..."
git add -A

# Commit with timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
echo "💾 Creating commit..."
git commit -m "deploy: $TIMESTAMP"

# Push to gh-pages branch
echo "🌐 Pushing to gh-pages..."
git push -f origin gh-pages

# Go back to project root
cd ..

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📍 Your app will be available at:"
echo "   https://git.i.mercedes-benz.com/pages/SAPLAUM/VSMeter/"
echo ""
echo "⏱️  GitHub Pages may take 1-2 minutes to update."
