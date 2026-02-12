#!/bin/bash

# VSMeter GitHub.com Public Deployment Script
# This script builds and deploys the app to public GitHub Pages

set -e  # Exit on error

echo "🚀 Starting VSMeter public deployment to GitHub.com..."

# Set environment variable for public build
export VITE_PUBLIC_BUILD=true

# Build the project
echo "📦 Building project for public GitHub..."
npm run build

# Navigate to dist folder
cd dist

# Replace __BASE_PATH__ placeholder in 404.html with public base path
echo "🔧 Configuring 404.html for public deployment..."
sed -i.bak 's|__BASE_PATH__|/VSMeter/|g' 404.html
rm 404.html.bak

# Initialize git if needed
if [ ! -d .git ]; then
  echo "🔧 Initializing git in dist folder..."
  git init
  git branch -M gh-pages
  git remote add origin git@github.com:saplaum/VSMeter.git
else
  # Update remote if it exists (in case it was used for internal before)
  git remote set-url origin git@github.com:saplaum/VSMeter.git 2>/dev/null || git remote add origin git@github.com:saplaum/VSMeter.git
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
echo "🌐 Pushing to GitHub.com gh-pages..."
git push -f origin gh-pages

# Go back to project root
cd ..

echo ""
echo "✅ Public deployment complete!"
echo ""
echo "📍 Your app will be available at:"
echo "   https://saplaum.github.io/VSMeter/"
echo ""
echo "⏱️  GitHub Pages may take 1-2 minutes to update."
echo ""
echo "⚠️  Note: You need to create the repository on GitHub.com first:"
echo "   https://github.com/saplaum/VSMeter"
echo "   Then enable GitHub Pages in Settings > Pages > Source: gh-pages branch"
