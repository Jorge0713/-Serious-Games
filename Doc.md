# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # Primary dev command: runs Vite + Electron concurrently
npm run dev      # Vite dev server only (browser, port 5173)
npm run build    # TypeScript check then Vite production build
npm run lint     # ESLint on entire codebase
npm run preview  # Preview production build
```

There are no tests configured in this project.

## Architecture Overview

This is an educational nutrition game built as a **React + Phaser 4 + Electron** hybrid app called "Alimentación App".

### React / Phaser Integration

The app mounts a React tree at `main.tsx` → `App.tsx`. The `HomePage` component creates a single Phaser game instance via `createGame()` (`src/game/PhaserGame.ts`) inside a `useEffect`, storing it at `window.__phaserGame`. All seven game scenes are registered upfront in `PhaserGame.ts`.

**Phaser → React communication** uses global window functions:
- `window.showTutorial(categories)` — Phaser tells React to display a tutorial overlay
- `window.goToNivel2()` — Phaser tells React to transition the page

**React → Phaser communication** is done by setting those `window` callbacks inside React components (App.tsx), which Phaser scenes invoke.

### Scene Architecture

All scenes live in `src/game/scenes/` and follow the standard Phaser lifecycle (`preload` → `create` → `update`). Registered scenes:

| Scene | Purpose |
|---|---|
| `MainMenu` | Navigation hub with background music |
| `TutorialScene` | Interactive plate guide with DialogueSystem |
| `Nivel1Scene` | Drag-and-drop food into plate sections |
| `Nivel2Scene` | Drag-and-drop variant |
| `Nivel3Scene` | Scrollable food container with scoring |
| `CrucigramaScene` | Crossword puzzle |
| `Crucigrama3Scene` | Crossword variant |

**Music management rule**: Before calling `this.scene.start(...)`, always call `this.music.stop()` first. Phaser's Sound Manager is global — sounds keep playing after a scene shuts down and will layer on top when the scene restarts.

### React UI Layer

`App.tsx` routes between pages using a `currentPage` state string (`'home' | 'tutorial' | 'cereal' | 'legume' | 'animal'`). Tutorial flow follows a `tutorialOrder` array with `getNextPage()` progression logic.

Key React components:
- `src/ui/components/tutorial/TutorialPage.tsx` — manages tutorial routing and food category filtering
- `src/ui/components/tutorial/FoodGrid.tsx` — grid of food items
- `src/ui/components/tutorial/FoodDetail.tsx` — nutritional detail view

Nutritional data lives in `src/data/nutritionalInfo.ts`; category metadata (emoji, labels) in `src/config/categoryConfig.ts`.

### Asset Conventions

All assets are served from `public/` and loaded with a leading `/`:
- `/assets/Backgrounds/` — background images
- `/assets/Buttons/` — button sprites (`.webp`, `.png`)
- `/assets/` — character sprites (`platon.png` spritesheet, `plato.png`)
- `/verduras/`, `/frutas/`, `/cereales/`, `/origenAnimal/`, `/comidaExtra/` — food sprites
- `/Sound/` — MP3 audio files
- `/Partes_plato.png` — spritesheet for the plate sections (6 frames, 512×512 each)

### Shared Utilities

- **`src/componentes/HoverScale.ts`** — `hoverScale(scene, target, opts)` adds hover scale tween + optional sound to any interactive object. Use this on all buttons.
- **`src/game/systems/dialog/DialogueSystem.ts`** — typewriter dialogue box used in TutorialScene and CrucigramaScene.

### Phaser Game Config

- Resolution: **1920×1080**, scale mode `ENVELOP`, `CENTER_BOTH`
- Pixel art mode enabled (no antialiasing)
- Renderer: AUTO (WebGL preferred)
