# Lookit

A collaborative brand lockup builder for designers and clients. Upload logo SVGs, configure typography and colors, fine-tune proportions, then share a live preview link. Clients browse the options and save their preferred lockup with optional feedback -- no account required.

## Features

- **Multi-variant logomarks** -- upload and name multiple SVG options (A, B, C, etc.)
- **Wordmark and tagline** -- optional SVG slots with independent scaling
- **40+ curated Google Fonts** -- organized by category with per-font weight maps
- **Live SVG recoloring** -- primary and accent color replacement in uploaded SVGs
- **Layout modes** -- horizontal, stacked, or mark-only compositions
- **Proportions editor** -- scale, gap, offset, and letter-spacing controls with real-time preview
- **Shareable preview links** -- unique 12-character URLs for client review
- **Client selections** -- visitors pick a lockup, leave a name and optional message
- **Selection feed** -- designers see all client picks with mini previews
- **Zero external services** -- self-contained SQLite database, no third-party auth

## Tech Stack

- [Nuxt 4](https://nuxt.com) with Nitro server
- [Nuxt UI v4](https://ui.nuxt.com) and Tailwind CSS 4
- [Bun](https://bun.sh) runtime and package manager
- SQLite via `bun:sqlite` (WAL mode, zero config)
- TypeScript throughout

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.0 or later

### Install and Run

```bash
git clone https://github.com/shaunberkley/lookit.git
cd lookit
bun install
bun run dev
```

The dev server starts at `http://localhost:3000`. The SQLite database is created automatically on first request in the `data/` directory.

## Scripts

| Command              | Description                        |
| -------------------- | ---------------------------------- |
| `bun run dev`        | Start development server           |
| `bun run build`      | Build for production                |
| `bun run preview`    | Run production build locally        |
| `bun run lint`       | Lint and auto-fix with ESLint       |
| `bun run type-check` | Type-check with vue-tsc             |

## Deployment

### Docker

```bash
docker build -t lookit .
docker run -p 3000:3000 -v lookit-data:/app/data lookit
```

Mount `/app/data` as a volume to persist the SQLite database across container restarts.

### Manual

```bash
bun install
bun run build
bun run preview
```

The production server listens on port 3000. Ensure the `data/` directory is writable.

## Project Structure

```
app/
  components/      Vue components (BrandPreview, ShareLink, ColorPalette, ...)
  composables/     Composition functions
  pages/           File-based routing (editor at /, preview at /p/[id])
  types/           TypeScript definitions
  utils/           Fonts config, SVG recolor utility
server/
  api/previews/    REST endpoints for previews and selections
  utils/           SQLite database initialization
```

## License

[MIT](LICENSE)
