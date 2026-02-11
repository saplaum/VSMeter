# VSMeter - Deployment Guide for AI Agents

This document provides instructions for AI agents (like OpenCode, Cursor, GitHub Copilot, etc.) to understand and execute the deployment process for VSMeter.

## Project Overview

**VSMeter** is a Mentimeter clone for anonymous live voting using WebRTC P2P technology. It's a Vue 3 + Vite application deployed to GitHub Pages without GitHub Actions runners.

- **Repository**: `git@git.i.mercedes-benz.com:SAPLAUM/VSMeter.git`
- **Live URL**: `https://git.i.mercedes-benz.com/pages/SAPLAUM/VSMeter/`
- **Base Path**: `/VSMeter/` (case-sensitive!)

## Deployment Architecture

### Manual Deployment (No GitHub Actions)

Since GitHub Actions runners are not available in this environment, deployment uses a **manual script-based approach**:

1. Source code lives on `main` branch
2. Built assets are pushed to `gh-pages` branch
3. GitHub Pages serves from `gh-pages` branch root

### Why This Approach?

- No GitHub Actions runners available
- Simple and reliable
- Full control over deployment timing
- No CI/CD configuration needed

## Deployment Process

### Automated Deployment Script

The project includes `publish.sh` which automates the entire deployment process.

**Script Location**: `/publish.sh` (project root)

**What it does**:
1. Runs `npm run build` to create production bundle
2. Navigates to `dist/` folder
3. Initializes git repository in dist (if first time)
4. Stages all built files
5. Creates commit with timestamp
6. Force-pushes to `gh-pages` branch
7. Returns to project root

**Usage**:
```bash
./publish.sh
```

### Manual Deployment (Without Script)

If you need to deploy manually without the script:

```bash
# 1. Build the project
npm run build

# 2. Navigate to dist folder
cd dist

# 3. Initialize git (first time only)
git init
git branch -M gh-pages
git remote add origin git@git.i.mercedes-benz.com:SAPLAUM/VSMeter.git

# 4. Stage and commit
git add -A
git commit -m "deploy"

# 5. Push to gh-pages
git push -f origin gh-pages

# 6. Return to root
cd ..
```

## Critical Configuration

### vite.config.js

The `base` path **must match the repository name** (case-sensitive):

```javascript
export default defineConfig({
  base: '/VSMeter/',  // Must be uppercase 'VSMeter'
  // ...
})
```

**Common Issue**: GitHub Pages paths are case-sensitive. If the base path doesn't match the repo name exactly, assets will 404.

### GitHub Pages Settings

Ensure GitHub Pages is configured to serve from `gh-pages` branch:

1. Navigate to: `https://git.i.mercedes-benz.com/SAPLAUM/VSMeter/settings/pages`
2. **Source**: `gh-pages` branch
3. **Folder**: `/ (root)`

## When to Deploy

Deploy when:
- New features are added
- Bugs are fixed
- UI/UX changes are made
- Configuration is updated
- Votings are added/modified

**Important**: Always commit source changes to `main` branch before deploying!

## Deployment Workflow for AI Agents

When a user asks to deploy or update the live site:

```bash
# 1. Ensure all changes are committed to main
git add .
git commit -m "Your descriptive commit message"
git push origin main

# 2. Run the deployment script
./publish.sh

# 3. Verify deployment
# Wait 1-2 minutes, then check:
# https://git.i.mercedes-benz.com/pages/SAPLAUM/VSMeter/
```

## Troubleshooting Deployment Issues

### Assets Return 404

**Symptom**: Page loads but CSS/JS files return 404  
**Cause**: Base path mismatch in `vite.config.js`  
**Fix**: Ensure `base: '/VSMeter/'` matches repo name exactly (case-sensitive)

### Old Version Still Showing

**Symptom**: Changes not visible after deployment  
**Cause**: Browser cache or GitHub Pages propagation delay  
**Fix**: 
- Wait 1-2 minutes for GitHub Pages to update
- Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
- Check network tab to verify new asset hashes

### Push Rejected

**Symptom**: `git push` fails with "rejected" error  
**Cause**: Remote history diverged  
**Fix**: Use force push (`git push -f origin gh-pages`)  
Note: This is safe because gh-pages only contains build artifacts

### Build Fails

**Symptom**: `npm run build` returns errors  
**Cause**: Syntax errors, missing dependencies, or configuration issues  
**Fix**:
1. Check error message for specific issue
2. Run `npm install` to ensure dependencies are up to date
3. Fix code errors before deploying
4. Test locally with `npm run dev` first

## Adding New Votings

When adding new votings, follow these steps:

1. **Create Markdown file** in `public/votings/voting3.md`:
   ```markdown
   ---
   id: voting3
   title: "Your question?"
   description: "Description"
   delaySeconds: 30
   options:
     - label: "Option 1"
       emoji: "👍"
     - label: "Option 2"
       emoji: "👎"
   ---
   ```

2. **Register in config** - Edit `src/composables/useVotingConfig.js`:
   ```javascript
   const votingIds = ['voting1', 'voting2', 'voting3'];
   ```

3. **Test locally**:
   ```bash
   npm run dev
   ```

4. **Commit and deploy**:
   ```bash
   git add .
   git commit -m "Add voting3"
   git push origin main
   ./publish.sh
   ```

## Development vs Production

### Local Development
```bash
npm run dev
# Runs on http://localhost:5173
# Base path is '/' (no /VSMeter/)
# Hot reload enabled
```

### Production Build
```bash
npm run build
# Generates dist/ folder
# Base path is '/VSMeter/'
# Minified and optimized
```

### Preview Build Locally
```bash
npm run preview
# Serves production build locally
# Useful to verify build before deployment
```

## File Structure

```
VSMeter/
├── public/votings/        # Voting configurations (Markdown)
├── src/                   # Source code
├── dist/                  # Build output (gitignored, deployed separately)
├── publish.sh             # Deployment script
├── vite.config.js         # Vite configuration (contains base path)
├── package.json           # Dependencies and scripts
└── README.md              # User documentation
```

## Important Notes for AI Agents

1. **Never commit `dist/` to `main` branch** - It's gitignored for a reason
2. **Always check `vite.config.js` base path** - Must be `/VSMeter/` exactly
3. **Use `publish.sh` for deployment** - It's tested and reliable
4. **Force push to `gh-pages` is safe** - It only contains build artifacts
5. **Wait 1-2 minutes after deployment** - GitHub Pages needs time to propagate
6. **Test locally first** - Run `npm run dev` before deploying

## Quick Reference Commands

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build            # Create production build
npm run preview          # Preview production build locally

# Deployment
./publish.sh             # Build and deploy to GitHub Pages

# Git operations
git add .
git commit -m "message"
git push origin main     # Push source to main branch
```

## Contact & Support

For issues with the deployment process or questions about this guide, refer to the main README.md or check the git commit history for context on changes.

---

**Last Updated**: 2026-02-11  
**Maintainer**: SAPLAUM  
**Deployment Method**: Manual script-based (publish.sh)
