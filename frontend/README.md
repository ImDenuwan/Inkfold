# Inkfold frontend

The Next.js app: landing page, workspace, sign-in and privacy pages.

## 🚀 Setup

```bash
cd frontend
npm install
```

Copy `.env.local.example` to `.env.local`.

| Variable | Required | What it does |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | yes | Where the backend runs (default `http://localhost:8000`) |
| `NEXT_PUBLIC_SUPABASE_URL` | no | Turns on sign-in |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | no | The public `anon` key, which is safe in the browser |

Without the Supabase values, the Sign in button is hidden and everyone is a guest.

## ▶️ Run

```bash
npm run dev
```

Open http://localhost:3000. For production:

```bash
npm run build
npm start
```

`NEXT_PUBLIC_` values are built into the app, so rebuild after changing them.

## 🧭 Pages

| Route | Page |
|---|---|
| `/` | Landing page with upload and recent papers, then the workspace |
| `/login` | Sign in with Google or an email link |
| `/privacy` | Privacy and terms |

## 🧩 Main components

| Component | What it does |
|---|---|
| `Upload` | Upload box, reading screen, paper check and recent papers |
| `LandingSections` | Live demo, three steps, feature cards |
| `Workspace` | Sidebar, PDF viewer and the Summary, Chat, Quiz me and Cite tabs |
| `PdfViewer` | Draws pages with pdf.js and highlights cited sentences |
| `Chat` | Questions, answers and clickable page citations |
| `Summary` | The five-part summary and the citation (`Cite`) |
| `Quiz` | Multiple-choice quiz with explanations |
| `Account` | Sign-in button and account card |

Helpers live in `lib/`: `api.js` (backend calls), `history.js` (saved papers), `supabase.js` and `useUser.js` (sign-in), `cite.js`, `export.js` and `copy.js`.
