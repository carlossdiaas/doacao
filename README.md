Doacao App

Backend: Node.js + Express + SQLite
Frontend: Static HTML + Tailwind + JS (to host on GitHub Pages)

Setup local (backend):
1. Copy `.env.example` to `.env` and set JWT_SECRET
2. npm install
3. npm run dev

Deploy:
- Frontend: push `public/` to GitHub Pages branch (main or gh-pages)
- Backend: deploy this repository (or `server/`) to Render or Railway. Ensure environment variables set (JWT_SECRET, PORT).

API endpoints:
- POST /register
- POST /login
- GET /profile (auth)
- PUT /profile (auth)
- GET /donations
- POST /donations (auth)
- POST /claim (auth)

See code for details.
