# VSMeter - Deployment Guide for AI Agents

This document provides instructions for AI agents (like OpenCode, Cursor, GitHub Copilot, etc.) to understand and execute the deployment process for VSMeter.

## Project Overview

**VSMeter** is a Mentimeter clone for anonymous live voting using WebRTC P2P technology. It's a Vue 3 + Vite application deployed to GitHub Pages.

### Deployment Target

**Public (GitHub.com)**
- **Repository**: `git@github.com:saplaum/VSMeter.git`
- **Live URL**: `https://saplaum.github.io/VSMeter/`
- **Base Path**: `/VSMeter/`

## Deployment Architecture

### Automated Deployment (GitHub Actions)

Deployment is automated via GitHub Actions and triggers on every push to `main`:

1. Source code pushed to `main` branch
2. GitHub Actions workflow triggers automatically
3. Builds with `VITE_PUBLIC_BUILD=true`
4. Deploys to GitHub Pages

### GitHub Pages Settings

Ensure GitHub Pages is configured to serve from `gh-pages` branch:

1. Navigate to: `https://github.com/saplaum/VSMeter/settings/pages`
2. **Source**: `gh-pages` branch
3. **Folder**: `/ (root)`

## Deployment Workflow

### Automatic (GitHub Actions)

On push to `main`, the workflow (`.github/workflows/deploy.yml`) automatically:
1. Checks out the code
2. Sets up Node.js 20
3. Installs dependencies with `npm ci`
4. Builds with `VITE_PUBLIC_BUILD=true`
5. Deploys to GitHub Pages

### Manual (Fallback)

If GitHub Actions is unavailable, you can deploy manually:

```bash
# 1. Build the project
export VITE_PUBLIC_BUILD=true
npm run build

# 2. Navigate to dist folder
cd dist

# 3. Initialize git (first time only)
git init
git branch -M gh-pages
git remote add origin git@github.com:saplaum/VSMeter.git

# 4. Stage and commit
git add -A
git commit -m "deploy"

# 5. Push to gh-pages
git push -f origin gh-pages

# 6. Return to root
cd ..
```

## When to Deploy

Deploy when:
- New features are added
- Bugs are fixed
- UI/UX changes are made
- Configuration is updated
- Votings are added/modified

**Important**: Always commit source changes to `main` branch before deploying!

## Deployment Workflow for AI Agents

**CRITICAL RULE**: 🚨 **NEVER deploy automatically without explicit user approval!** 🚨

### Testing First (Always Required)

Before deploying, **ALWAYS test locally first**:

```bash
# 1. Build the project
npm run build

# 2. Test the build locally (optional but recommended)
npm run preview

# 3. If issues found, fix them and rebuild
# DO NOT deploy until user confirms everything works!
```

### Deployment (Only When User Explicitly Requests)

When a user **explicitly asks** to deploy or update the live site:

```bash
# 1. Ensure all changes are committed to main
git add .
git commit -m "Your descriptive commit message"
git push origin main

# 2. GitHub Actions will automatically deploy
# Wait 1-2 minutes for deployment to complete

# 3. Verify deployment at:
# https://saplaum.github.io/VSMeter/
```

### When NOT to Deploy

**Do NOT deploy in these situations**:
- ❌ After every single commit
- ❌ After fixing a bug (test first!)
- ❌ When user says "test this"
- ❌ When user says "let me check"
- ❌ When build succeeds (user must approve!)
- ❌ Automatically without asking

**Only deploy when user explicitly says**:
- ✅ "Deploy this"
- ✅ "Push to production"
- ✅ "Update the live site"
- ✅ "Publish this"

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

4. **Commit changes**:
   ```bash
   git add .
   git commit -m "Add voting3"
   git push origin main
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
export VITE_PUBLIC_BUILD=true
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
├── .github/workflows/      # GitHub Actions deployment
├── vite.config.js         # Vite configuration
├── package.json           # Dependencies and scripts
├── README.md              # User documentation
└── AGENTS.md             # AI agent deployment guide
```

## Important Notes for AI Agents

1. **🚨 NEVER deploy without user approval** - Always test locally first and ask before deploying
2. **Never commit `dist/` to `main` branch** - It's gitignored for a reason
3. **Base path** - Public builds use `/VSMeter/`
4. **GitHub Actions deploys automatically** - On push to `main`
5. **Wait 1-2 minutes after deployment** - GitHub Pages needs time to propagate
6. **Test locally first** - Run `npm run build` and verify before deploying
7. **Environment variable matters** - Public builds require `VITE_PUBLIC_BUILD=true`

## Quick Reference Commands

```bash
# Development
npm run dev              # Start dev server

# Building
VITE_PUBLIC_BUILD=true npm run build  # Create public build
npm run preview                    # Preview production build locally

# Git operations
git add .
git commit -m "message"
git push origin main     # Push source - GitHub Actions auto-deploys
```

---

**Last Updated**: 2026-02-22  
**Maintainer**: SAPLAUM  
**Deployment Method**: GitHub Actions (automatic on push to main)
