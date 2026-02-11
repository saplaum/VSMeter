# VSMeter 🎯

Ein minimalistischer Mentimeter-Klon für anonyme Live-Abstimmungen via WebRTC Peer-to-Peer.

![VSMeter](https://img.shields.io/badge/Vue.js-3-4FC08D?logo=vue.js)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)
![PeerJS](https://img.shields.io/badge/WebRTC-PeerJS-orange)

## Features

✅ **Peer-to-Peer** - Keine Server oder Backend notwendig  
✅ **Anonyme Abstimmungen** - Keine Datenerfassung oder Tracking  
✅ **Live-Synchronisation** - Echtzeitübertragung der Votes via WebRTC  
✅ **Einfache Konfiguration** - Votings per Markdown definieren  
✅ **GitHub Pages kompatibel** - Statisches Hosting ohne Kosten  
✅ **Timer-basiert** - Ergebnisse werden nach konfigurierbarer Zeit angezeigt  
✅ **Reset-Funktion** - Votings mehrfach durchführbar  

## Demo

**Live Demo:** `https://USERNAME.github.io/vsmeter/`

## Quick Start

### 1. Repository forken oder klonen

```bash
git clone https://github.com/USERNAME/vsmeter.git
cd vsmeter
npm install
```

### 2. Lokal entwickeln

```bash
npm run dev
```

Öffne http://localhost:5173

### 3. Auf GitHub Pages deployen

1. Push zu GitHub
2. Gehe zu **Settings** → **Pages**
3. Source: **GitHub Actions**
4. Der Workflow deployed automatisch bei jedem Push auf `main`

**Wichtig:** In `vite.config.js` die `base` URL anpassen:

```javascript
export default defineConfig({
  base: '/DEIN-REPO-NAME/',  // z.B. '/vsmeter/'
  // ...
})
```

## Neues Voting erstellen

Erstelle eine neue Markdown-Datei in `public/votings/`:

```markdown
---
id: voting3
title: "Deine Frage?"
description: "Kurze Beschreibung"
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

Dann in `src/composables/useVotingConfig.js` die ID hinzufügen:

```javascript
const votingIds = ['voting1', 'voting2', 'voting3'];
```

## Verwendung

### Als Host

1. Öffne die Landing Page
2. Klicke auf "Als Host starten" bei einem Voting
3. Teile den generierten Link mit Teilnehmern
4. Der Timer startet automatisch bei der ersten Stimme
5. Nach Ablauf des Timers werden Ergebnisse angezeigt
6. Optional: Voting mit "Reset" neu starten

### Als Teilnehmer

1. Öffne den vom Host geteilten Link
2. Wähle deine Option
3. Du kannst deine Wahl ändern bis der Timer abläuft
4. Nach dem Timer werden die Ergebnisse angezeigt

## Technische Details

### Architektur

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

- **Host** = Koordinator, aggregiert Votes, verwaltet Timer
- **Participants** = Verbinden sich direkt mit Host via WebRTC
- **Keine zentrale Datenbank** = Alles läuft im Browser

### Tech Stack

- **Frontend**: Vue 3 (Composition API)
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3 (Custom Mentimeter Dark Theme)
- **WebRTC**: PeerJS 1.5
- **Routing**: Vue Router 4
- **Markdown**: gray-matter

### Ordnerstruktur

```
vsmeter/
├── public/votings/        # Voting-Konfigurationen (Markdown)
├── src/
│   ├── components/
│   │   ├── host/         # Host-spezifische Components
│   │   ├── vote/         # Participant Components
│   │   ├── shared/       # Gemeinsame Components
│   │   └── landing/      # Landing Page Components
│   ├── composables/      # Vue Composables (WebRTC, Timer, Config)
│   ├── utils/            # Utilities (roomId Generator, Constants)
│   ├── views/            # Route Views (Landing, Host, Vote)
│   └── router/           # Vue Router
└── .github/workflows/    # GitHub Actions Deployment
```

## Limitierungen

⚠️ **Host-Browser muss online bleiben** während des Votings  
⚠️ **Empfohlene Teilnehmerzahl**: ~20-30 (WebRTC P2P Limit)  
⚠️ **Keine Persistenz**: Bei Host-Disconnect ist Voting verloren  
⚠️ **Firewalls**: WebRTC kann in manchen Netzwerken blockiert sein  

## Konfiguration

### Timer anpassen

In der Voting-Markdown-Datei:

```yaml
delaySeconds: 45  # Sekunden bis Ergebnisse sichtbar werden
```

### Design anpassen

Farben in `tailwind.config.js`:

```javascript
colors: {
  'vs-dark': '#000000',      // Hintergrund
  'vs-bar-base': '#3B82A0',  // Balken Dunkelblau
  'vs-bar-mid': '#5DADE2',   // Balken Mittelblau
  'vs-bar-top': '#A8E6FF',   // Balken Hellblau
}
```

## Development

### Commands

```bash
npm run dev      # Dev Server starten
npm run build    # Production Build
npm run preview  # Build Preview
```

### Debugging

WebRTC Debug-Logs sind aktiviert. In der Browser-Console:

```javascript
// Host
console.log('Room ID:', roomId.value)
console.log('Votes:', votes.value)

// Participant
console.log('My Vote:', myVote.value)
console.log('Results:', results.value)
```

## Troubleshooting

### Teilnehmer können sich nicht verbinden

1. Prüfe, ob Host online ist
2. Prüfe Room-ID im Link
3. Prüfe Browser-Console auf Fehler
4. Versuche anderen Browser (Chrome/Firefox empfohlen)

### Ergebnisse werden nicht angezeigt

1. Warte bis Timer abgelaufen ist (Host-Ansicht zeigt Countdown)
2. Prüfe ob Host noch verbunden ist
3. Refresh der Seite

### Votings werden nicht geladen

1. Prüfe, ob Markdown-Dateien in `public/votings/` liegen
2. Prüfe YAML Frontmatter Syntax
3. Prüfe `useVotingConfig.js` ob IDs eingetragen sind

## Contributing

Contributions willkommen! Bitte:

1. Fork das Repo
2. Erstelle einen Feature Branch
3. Committe deine Changes
4. Push und erstelle einen Pull Request

## Roadmap

### Version 1.1
- [ ] Multiple-Select Votings
- [ ] Freie Text-Eingaben
- [ ] Export als PNG/CSV

### Version 1.2
- [ ] QR-Code für Vote-Link
- [ ] Voting pausieren/fortsetzen
- [ ] Dark/Light Theme Toggle

### Version 2.0
- [ ] Optional: Firebase Backend für Persistenz
- [ ] Voting-Historie
- [ ] Multi-Host Support

## Lizenz

MIT License

## Credits

Inspiriert von [Mentimeter](https://www.mentimeter.com/)

Gebaut mit Vue.js, Tailwind CSS, und PeerJS

---

**Made with ❤️ for anonymous voting**
