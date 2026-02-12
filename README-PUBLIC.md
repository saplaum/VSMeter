# VSMeter 🎯

A minimalist Mentimeter clone for anonymous live voting using WebRTC Peer-to-Peer technology.

![VSMeter](https://img.shields.io/badge/Vue.js-3-4FC08D?logo=vue.js)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)
![PeerJS](https://img.shields.io/badge/WebRTC-PeerJS-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🚀 Live Demo

**Try it now:** [https://saplaum.github.io/VSMeter/](https://saplaum.github.io/VSMeter/)

## ✨ Features

✅ **Peer-to-Peer** - No server or backend required  
✅ **Anonymous Voting** - No data collection or tracking  
✅ **Live Synchronization** - Real-time vote transmission via WebRTC  
✅ **Simple Configuration** - Define votings via Markdown  
✅ **GitHub Pages Compatible** - Static hosting at no cost  
✅ **Timer-based** - Results displayed after configurable countdown  
✅ **Manual Start** - Host controls when voting begins  
✅ **Reset Function** - Run votings multiple times  
✅ **Automatic Reconnection** - Participants auto-retry connection if host joins late

## 📖 How It Works

VSMeter creates a peer-to-peer network where:
- **Host** acts as coordinator and aggregates votes
- **Participants** connect directly to the host via WebRTC
- **No backend** - everything runs in the browser
- **No data storage** - completely anonymous and ephemeral

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

## 🎯 Quick Start

### For Users (No Installation)

1. **As Host:**
   - Visit [https://saplaum.github.io/VSMeter/](https://saplaum.github.io/VSMeter/)
   - Click "Start as Host" for a voting
   - Share the generated link with participants
   - Click "Start Voting" to begin

2. **As Participant:**
   - Open the link shared by the host
   - Select your option
   - Watch results after timer expires

### For Developers

```bash
# Clone the repository
git clone https://github.com/saplaum/VSMeter.git
cd VSMeter

# Install dependencies
npm install

# Run development server
npm run dev
```

Open http://localhost:5173

## 🛠️ Tech Stack

- **Frontend**: Vue 3 (Composition API)
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3 (Custom dark theme inspired by Mentimeter)
- **WebRTC**: PeerJS 1.5
- **Routing**: Vue Router 4
- **Icons**: Lucide Vue Next
- **Config Parser**: js-yaml (YAML frontmatter parser)

## 📝 Creating Custom Votings

### 1. Create a Markdown file in `public/votings/`

Example: `public/votings/voting3.md`

```markdown
---
id: voting3
title: "What's your favorite programming language?"
description: "Vote for your top choice"
delaySeconds: 30
options:
  - label: "JavaScript"
    emoji: "🟨"
  - label: "Python"
    emoji: "🐍"
  - label: "Rust"
    emoji: "🦀"
  - label: "Go"
    emoji: "🐹"
---
```

### 2. Register the voting ID

Edit `src/composables/useVotingConfig.js`:

```javascript
const votingIds = ['voting1', 'voting2', 'voting3'];
```

### 3. Test locally

```bash
npm run dev
```

## 🚀 Deployment

### Deploy to GitHub Pages

VSMeter is designed to work seamlessly with GitHub Pages.

#### Option 1: Using the Deployment Script

```bash
# Build and deploy in one command
./publish-public.sh
```

#### Option 2: Manual Deployment

```bash
# 1. Build the project
npm run build

# 2. Navigate to dist folder
cd dist

# 3. Initialize git and push to gh-pages branch
git init
git add -A
git commit -m 'deploy'
git branch -M gh-pages
git remote add origin git@github.com:YOUR-USERNAME/VSMeter.git
git push -f origin gh-pages

cd ..
```

#### Option 3: GitHub Actions (Automated)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Important: Configure Base Path

In `vite.config.js`, set the correct base path:

```javascript
export default defineConfig({
  base: '/VSMeter/',  // Must match your repository name
  // ...
})
```

### Enable GitHub Pages

1. Go to your repository settings
2. Navigate to **Pages**
3. Set source to `gh-pages` branch
4. Set folder to `/ (root)`
5. Wait 1-2 minutes for deployment

## ⚙️ Configuration

### Customize Timer Duration

In your voting Markdown file:

```yaml
delaySeconds: 45  # Seconds until results are shown
```

### Customize Theme Colors

Edit `tailwind.config.js`:

```javascript
colors: {
  'vs-dark': '#000000',      // Background
  'vs-bar-base': '#3B82A0',  // Bar dark blue
  'vs-bar-mid': '#5DADE2',   // Bar medium blue
  'vs-bar-top': '#A8E6FF',   // Bar light blue
}
```

## 🐛 Troubleshooting

### Participants can't connect

- **Check:** Is the host online and on the voting page?
- **Check:** Is the room ID in the URL correct?
- **Try:** Different browser (Chrome/Firefox recommended)
- **Note:** VSMeter automatically retries connection up to 20 times

### Results not showing

- Wait until the timer expires (host can see countdown)
- Ensure host is still connected
- Try refreshing the page

### Votings not loading

- Verify Markdown files exist in `public/votings/`
- Check YAML frontmatter syntax
- Ensure voting IDs are registered in `useVotingConfig.js`

### Assets return 404 after deployment

- Verify `base` path in `vite.config.js` matches your repo name **exactly** (case-sensitive)
- Example: repo `VSMeter` → base: `/VSMeter/`
- Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)

## ⚠️ Limitations

- **Host must stay online** during the entire voting session
- **Recommended participant count**: ~20-30 (WebRTC P2P limitation)
- **No persistence**: If host disconnects, voting data is lost
- **Firewall restrictions**: WebRTC may be blocked in some corporate networks

## 📦 Message Protocol

WebRTC messages between host and participants:

| Message | Direction | Purpose |
|---------|-----------|---------|
| `VOTE` / `VOTE_UPDATE` | Participant → Host | Submit/update vote |
| `STATE_UPDATE` | Host → Participants | Vote count, participant count |
| `TIMER_UPDATE` | Host → Participants | Countdown updates |
| `TIMER_START` | Host → Participants | Voting started signal |
| `RESULTS` | Host → Participants | Final aggregated results |
| `RESET` | Host → Participants | Clear session and restart |

## 🗂️ Project Structure

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
│   └── router/            # Vue Router configuration
├── vite.config.js         # Vite build configuration
├── tailwind.config.js     # Tailwind CSS theme
└── publish-public.sh      # GitHub Pages deployment script
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🗺️ Roadmap

### Version 1.1
- [ ] Multiple-select votings
- [ ] Free text input fields
- [ ] Export results as PNG/CSV

### Version 1.2
- [ ] QR code generation for vote links
- [ ] Pause/resume voting
- [ ] Dark/Light theme toggle

### Version 2.0
- [ ] Optional Firebase backend for persistence
- [ ] Voting history
- [ ] Multi-host support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💡 Inspiration

Inspired by [Mentimeter](https://www.mentimeter.com/)

## 🙏 Credits

Built with:
- [Vue.js](https://vuejs.org/) - Progressive JavaScript Framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS Framework
- [PeerJS](https://peerjs.com/) - Simple peer-to-peer with WebRTC
- [Lucide](https://lucide.dev/) - Beautiful icon library

---

**Made with ❤️ for anonymous, real-time voting**

Star ⭐ this repository if you find it useful!
