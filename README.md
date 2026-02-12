# VSMeter 🎯

A minimalist Mentimeter clone for anonymous live voting via WebRTC Peer-to-Peer.

![VSMeter](https://img.shields.io/badge/Vue.js-3-4FC08D?logo=vue.js)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)
![PeerJS](https://img.shields.io/badge/WebRTC-PeerJS-orange)

## Features

✅ **Peer-to-Peer** - No server or backend required  
✅ **Anonymous Voting** - No data collection or tracking  
✅ **Live Synchronization** - Real-time vote transmission via WebRTC  
✅ **Simple Configuration** - Define votings via Markdown  
✅ **GitHub Pages Compatible** - Static hosting at no cost  
✅ **Timer-based** - Results displayed after configurable countdown  
✅ **Manual Start** - Host controls when voting begins  
✅ **Reset Function** - Run votings multiple times  

## Demo

**Live Demo:** `https://saplaum.github.io/VSMeter/`

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/saplaum/VSMeter.git
cd VSMeter
npm install
```

### 2. Local development

```bash
npm run dev
```

Open http://localhost:5173

### 3. Deploy to GitHub Pages (Manual)

Since GitHub Actions runners are not available, deploy manually:

```bash
# Build the project
npm run build

# The dist folder is generated
# Push dist folder to gh-pages branch (see deployment section below)
```

**Important:** Adjust the `base` URL in `vite.config.js`:

```javascript
export default defineConfig({
  base: '/YOUR-REPO-NAME/',  // e.g. '/VSMeter/'
  // ...
})
```

## Deployment Without GitHub Actions

### Option 1: Using Deployment Script

```bash
# Deploy to public GitHub Pages
./publish-public.sh
```

### Option 2: Manual gh-pages Push

```bash
# Build the project
npm run build

# Navigate to dist folder
cd dist

# Initialize git and push to gh-pages branch
git init
git add -A
git commit -m 'deploy'
git branch -M gh-pages
git remote add origin https://github.com/YOUR-USERNAME/VSMeter.git
git push -f origin gh-pages

cd ..
```

### Option 2: Keep dist in Repository

Remove `dist` from `.gitignore`, commit it, and configure GitHub Pages to serve from `/dist` folder on `main` branch.

## Create New Voting

Create a new Markdown file in `public/votings/`:

```markdown
---
id: voting3
title: "Your question?"
description: "Short description"
delaySeconds: 30
options:
  - label: "Option 1"
    emoji: "👍"
  - label: "Option 2"
    emoji: "👎"
  - label: "Option 3"
    emoji: "🤷"
---
```

Then add the ID in `src/composables/useVotingConfig.js`:

```javascript
const votingIds = ['voting1', 'voting2', 'voting3'];
```

## Usage

### As Host

1. Open the landing page
2. Click "Start as Host" for a voting
3. Share the generated link with participants
4. Click "Start Voting" button to begin the countdown
5. Results are displayed after the timer expires
6. Optional: Reset voting to start a new round

### As Participant

1. Open the link shared by the host
2. Select your option
3. You can change your vote until the timer expires
4. Results are shown after the timer completes

## Technical Details

### Architecture

```
┌─────────────┐
│    Host     │  ←─── PeerJS WebRTC
│  (Browser)  │
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
┌──▼──┐ ┌──▼──┐
│ P1  │ │ P2  │  Participants
└─────┘ └─────┘
```

- **Host** = Coordinator, aggregates votes, manages timer
- **Participants** = Connect directly to host via WebRTC
- **No central database** = Everything runs in the browser

### Tech Stack

- **Frontend**: Vue 3 (Composition API)
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3 (Custom Mentimeter Dark Theme)
- **WebRTC**: PeerJS 1.5
- **Routing**: Vue Router 4
- **Markdown**: js-yaml (YAML frontmatter parser)

### Folder Structure

```
VSMeter/
├── public/votings/        # Voting configurations (Markdown)
├── src/
│   ├── components/
│   │   ├── landing/       # Landing page components
│   │   ├── vote/          # Participant components
│   │   └── shared/        # Shared components
│   ├── composables/       # Vue Composables (WebRTC, Timer, Config)
│   ├── utils/             # Utilities (roomId Generator, Constants)
│   ├── views/             # Route Views (Landing, Host, Vote)
│   └── router/            # Vue Router
└── .github/workflows/     # GitHub Actions (optional)
```

## Limitations

⚠️ **Host browser must stay online** during voting  
⚠️ **Recommended participant count**: ~20-30 (WebRTC P2P limit)  
⚠️ **No persistence**: If host disconnects, voting is lost  
⚠️ **Firewalls**: WebRTC can be blocked in some networks  

## Configuration

### Adjust Timer

In the voting Markdown file:

```yaml
delaySeconds: 45  # Seconds until results are visible
```

### Customize Design

Colors in `tailwind.config.js`:

```javascript
colors: {
  'vs-dark': '#000000',      // Background
  'vs-bar-base': '#3B82A0',  // Bar dark blue
  'vs-bar-mid': '#5DADE2',   // Bar medium blue
  'vs-bar-top': '#A8E6FF',   // Bar light blue
}
```

## Development

### Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview build
```

### Debugging

WebRTC debug logs are enabled. In browser console:

```javascript
// Host
console.log('Room ID:', roomId.value)
console.log('Votes:', votes.value)

// Participant
console.log('My Vote:', myVote.value)
console.log('Results:', results.value)
```

## Troubleshooting

### Participants cannot connect

1. Check if host is online
2. Check room ID in link
3. Check browser console for errors
4. Try different browser (Chrome/Firefox recommended)

### Results not displayed

1. Wait until timer expires (host view shows countdown)
2. Check if host is still connected
3. Refresh the page

### Votings not loading

1. Check if Markdown files are in `public/votings/`
2. Check YAML frontmatter syntax
3. Check `useVotingConfig.js` if IDs are registered

## Message Protocol

WebRTC messages exchanged between host and participants:

- `VOTE` / `VOTE_UPDATE` - Participant → Host
- `STATE_UPDATE` - Host → Participants (vote count, participant count)
- `TIMER_UPDATE` - Host → Participants (seconds remaining, isActive)
- `TIMER_START` - Host → Participants (manual start signal)
- `RESULTS` - Host → Participants (final results object)
- `RESET` - Host → Participants (clear session)

## Current Votings

Two PI Planning votings are configured:

1. **Voting 1**: Overall PI success rating (5-point scale with face emojis)
2. **Voting 2**: PI experience satisfaction (5-point scale with face emojis)

## Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Push and create a pull request

## Roadmap

### Version 1.1
- [ ] Multiple-select votings
- [ ] Free text inputs
- [ ] Export as PNG/CSV

### Version 1.2
- [ ] QR code for vote link
- [ ] Pause/resume voting
- [ ] Dark/Light theme toggle

### Version 2.0
- [ ] Optional: Firebase backend for persistence
- [ ] Voting history
- [ ] Multi-host support

## License

MIT License

## Credits

Inspired by [Mentimeter](https://www.mentimeter.com/)

Built with Vue.js, Tailwind CSS, and PeerJS

---

**Made with ❤️ for anonymous voting**
