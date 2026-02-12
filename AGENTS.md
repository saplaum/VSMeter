# VSMeter - Deployment Guide for AI Agents

This document provides instructions for AI agents (like OpenCode, Cursor, GitHub Copilot, etc.) to understand and execute the deployment process for VSMeter.

## Project Overview

**VSMeter** is a Mentimeter clone for anonymous live voting using WebRTC P2P technology. It's a Vue 3 + Vite application deployed to GitHub Pages (both internal and public).

### Deployment Targets

**Internal (Mercedes-Benz GitHub Enterprise)**
- **Repository**: `git@git.i.mercedes-benz.com:SAPLAUM/VSMeter.git`
- **Live URL**: `https://git.i.mercedes-benz.com/pages/SAPLAUM/VSMeter/`
- **Base Path**: `/SAPLAUM/VSMeter/`
- **Script**: `publish-internal.sh`

**Public (GitHub.com)**
- **Repository**: `git@github.com:saplaum/VSMeter.git`
- **Live URL**: `https://saplaum.github.io/VSMeter/`
- **Base Path**: `/VSMeter/`
- **Script**: `publish-public.sh`

## Deployment Architecture

### Manual Deployment (No GitHub Actions)

Since GitHub Actions runners are not available in the internal environment, deployment uses a **manual script-based approach**:

1. Source code lives on `main` branch
2. Built assets are pushed to `gh-pages` branch
3. GitHub Pages serves from `gh-pages` branch root
4. Two separate remotes and scripts for dual deployment

### Why This Approach?

- No GitHub Actions runners available (internal)
- Simple and reliable
- Full control over deployment timing
- Support for both internal and public hosting
- No CI/CD configuration needed

## Deployment Process

### Automated Deployment Scripts

The project includes two deployment scripts for different targets:

**1. Internal Deployment** (`publish-internal.sh`)
- Deploys to Mercedes-Benz GitHub Enterprise
- Base path: `/SAPLAUM/VSMeter/`
- URL: https://git.i.mercedes-benz.com/pages/SAPLAUM/VSMeter/

**2. Public Deployment** (`publish-public.sh`)
- Deploys to public GitHub.com
- Base path: `/VSMeter/`
- URL: https://saplaum.github.io/VSMeter/
- Sets `VITE_PUBLIC_BUILD=true` environment variable

**What both scripts do**:
1. Run `npm run build` to create production bundle (with correct base path)
2. Navigate to `dist/` folder
3. Initialize git repository in dist (if first time)
4. Stage all built files
5. Create commit with timestamp
6. Force-push to `gh-pages` branch of respective remote
7. Return to project root

**Usage**:
```bash
# Internal deployment
./publish-internal.sh

# Public deployment  
./publish-public.sh
```

### Manual Deployment (Without Script)

If you need to deploy manually without the script:

**Internal:**
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

**Public:**
```bash
# 1. Build the project for public
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

## Critical Configuration

### vite.config.js

The `base` path is **automatically determined** based on the `VITE_PUBLIC_BUILD` environment variable:

```javascript
// Internal build (default):
base: '/SAPLAUM/VSMeter/'  // MB GitHub Enterprise

// Public build (VITE_PUBLIC_BUILD=true):
base: '/VSMeter/'  // GitHub.com
```

**The deployment scripts handle this automatically!**

**Common Issue**: GitHub Pages paths are case-sensitive. If the base path doesn't match the repo name exactly, assets will 404.

### GitHub Pages Settings

Ensure GitHub Pages is configured to serve from `gh-pages` branch:

**Internal (Mercedes-Benz):**
1. Navigate to: `https://git.i.mercedes-benz.com/SAPLAUM/VSMeter/settings/pages`
2. **Source**: `gh-pages` branch
3. **Folder**: `/ (root)`

**Public (GitHub.com):**
1. Create repository first: `https://github.com/saplaum/VSMeter`
2. Navigate to Settings > Pages
3. **Source**: `gh-pages` branch
4. **Folder**: `/ (root)`

## When to Deploy

Deploy when:
- New features are added
- Bugs are fixed
- UI/UX changes are made
- Configuration is updated
- Votings are added/modified

**Important**: Always commit source changes to `main` branch before deploying!

**Deployment Target**: Choose which deployment target based on user needs:
- Internal: Use `publish-internal.sh` for Mercedes-Benz access only
- Public: Use `publish-public.sh` for public internet access
- Both: Run both scripts to deploy to both targets

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

# 2. ASK USER: "Ready to deploy to production?"
# ASK USER: "Deploy to internal, public, or both?"
# WAIT for confirmation!

# 3. Only after user confirms, run the deployment script
./publish-internal.sh   # For internal MB GitHub
./publish-public.sh     # For public GitHub.com
# Or both if requested

# 4. Verify deployment
# Wait 1-2 minutes, then check:
# Internal: https://git.i.mercedes-benz.com/pages/SAPLAUM/VSMeter/
# Public: https://saplaum.github.io/VSMeter/
```

### Deployment Decision Tree

```
User makes code changes
  ↓
Commit changes to main
  ↓
Build locally (npm run build)
  ↓
Test build succeeds?
  ├─ NO → Fix issues, rebuild
  └─ YES → Ask user: "Ready to deploy?"
            ↓
            Ask user: "Deploy to internal, public, or both?"
            ↓
            User says YES?
              ├─ NO → Stop, wait for user
              └─ YES → Run ./publish-internal.sh and/or ./publish-public.sh
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
**Fix**: 
- For public: Ensure `base: '/VSMeter/'` matches repo name exactly (case-sensitive)
- For internal: Ensure `base: '/SAPLAUM/VSMeter/'` matches repo structure
- Verify correct `VITE_PUBLIC_BUILD` environment variable was set during build

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

4. **Commit changes**:
   ```bash
   git add .
   git commit -m "Add voting3"
   git push origin main
   ```
   
5. **Deploy (only if user explicitly requests)**:
   ```bash
   # Ask user first: "Ready to deploy to production?"
   # Ask user: "Deploy to internal, public, or both?"
   ./publish-internal.sh    # For internal
   ./publish-public.sh      # For public
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
# Internal build (default)
npm run build
# Generates dist/ folder
# Base path is '/SAPLAUM/VSMeter/'
# Minified and optimized

# Public build
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
├── publish-internal.sh    # Internal deployment script (MB GitHub)
├── publish-public.sh      # Public deployment script (GitHub.com)
├── vite.config.js         # Vite configuration (dual base path support)
├── package.json           # Dependencies and scripts
├── README.md              # User documentation (internal)
├── README-PUBLIC.md       # Public-facing documentation
└── AGENTS.md              # AI agent deployment guide
```

## Important Notes for AI Agents

1. **🚨 NEVER deploy without user approval** - Always test locally first and ask before deploying
2. **Always ask which target** - "Deploy to internal, public, or both?"
3. **Never commit `dist/` to `main` branch** - It's gitignored for a reason
4. **Base path varies by target** - Internal: `/SAPLAUM/VSMeter/`, Public: `/VSMeter/`
5. **Use correct deployment script** - `publish-internal.sh` or `publish-public.sh`
6. **Force push to `gh-pages` is safe** - It only contains build artifacts
7. **Wait 1-2 minutes after deployment** - GitHub Pages needs time to propagate
8. **Test locally first** - Run `npm run build` and verify before deploying
9. **Environment variable matters** - Public builds require `VITE_PUBLIC_BUILD=true`

## Quick Reference Commands

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build                      # Create internal build (default)
VITE_PUBLIC_BUILD=true npm run build  # Create public build
npm run preview                    # Preview production build locally

# Deployment
./publish-internal.sh    # Build and deploy to internal MB GitHub
./publish-public.sh      # Build and deploy to public GitHub.com

# Git operations
git add .
git commit -m "message"
git push origin main     # Push source to internal repo
git push public main     # Push source to public repo (optional)
```

## Contact & Support

For issues with the deployment process or questions about this guide, refer to the main README.md or check the git commit history for context on changes.

---

**Last Updated**: 2026-02-12  
**Maintainer**: SAPLAUM  
**Deployment Method**: Manual script-based (dual-deployment)  
**Deployment Scripts**: `publish-internal.sh`, `publish-public.sh`  
**Deployment Policy**: Test locally first, deploy only with explicit user approval
