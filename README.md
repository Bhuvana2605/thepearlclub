# The Pearl Club - Digital Sanctuary

"When your mind feels messy, you may not need another tool. You may need somewhere to be."

**The Pearl Club** is a calming digital wellbeing space featuring a living ocean environment, private chronicle journaling, visual mood canvas, ambient audio soundscapes, Rule of 3 task prioritization, deep focus sessions, simple offline games, personal aquarium collectibles, and a public community feed.

---

## 1. Project Architecture

The repository is structured into a 3-pillar organization:

```
the-pearl-club/
│
├── stitch/
│   ├── original Stitch design screens
│   ├── fragment shaders & HTML mocks
│   └── design assets & references
│
├── frontend/
│   ├── src/
│   │   ├── components/       # UI & Brand components (PearlClubLogo)
│   │   ├── pages/            # Home, Journal, Focus, Games, Music, Aquarium, Feed, Bottle, Auth
│   │   ├── lib/              # Supabase client, storage, audio player
│   │   ├── data/             # Quotes, rewards, collectibles, curated audio
│   │   └── context/          # SanctuaryContext state & accessibility
│   │
│   ├── public/assets/
│   │   ├── brand/            # Pearl Club SVG logo & mark assets
│   │   ├── fish/             # Kenney 2D fish vector assets (clownfish, bluetang, turtle, etc.)
│   │   └── collectibles/     # Vector SVG artwork (pearls, shells, coral, starfish)
│   │
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── .env.example
│   └── README.md
│
├── backend/
│   ├── supabase/
│   │   ├── migrations/       # SQL schemas (01_schema.sql, 02_rls.sql)
│   │   ├── seed/             # Seed data (seed.sql)
│   │   └── functions/        # Edge Functions
│   ├── docs/                 # Database architecture & RLS docs (database.md)
│   └── README.md
│
├── README.md
└── .gitignore
```

---

## 2. Privacy & Data Boundaries

- **PRIVATE (Local Browser Storage)**: Chronicle journal entries, Mood Canvas drawings, Tasks, Focus session history, Aquarium inventory, Found & Achieved rewards, Personal audio & theme preferences.
- **PUBLIC (Supabase DB)**: Auth profiles, public Feed posts, comments, likes, shares, safety reports.

---

## 3. Running Locally

### Install Dependencies:
```bash
npm install
```

### Start Development Server:
```bash
npm run dev
```

### Production Build:
```bash
npm run build
```

---

## 5. Live Production Deployment

- **Live Application URL**: [https://thepearlclub.vercel.app](https://thepearlclub.vercel.app)
- **Deployment Platform**: Vercel
- **Database / Auth Provider**: Supabase (`https://bqfeekkbxcincwlvabdq.supabase.co`)

### Supabase Auth URL Configuration:
For production authentication email confirmations to redirect to the live Vercel deployment:
- **Site URL**: `https://thepearlclub.vercel.app`
- **Redirect URLs**:
  - `http://localhost:3000/**`
  - `https://thepearlclub.vercel.app/**`

