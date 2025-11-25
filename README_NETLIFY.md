Netlify Deployment (Single-site, terminal at root)

This repository is set up to deploy a single Netlify site that serves your terminal UI at the root URL and the resume files under `/` as static assets.

Files added:
- `netlify.toml` — Netlify build config.
- `netlify-build.sh` — Build script that builds the terminal app and assembles `public/`.

How it works
1. Netlify runs `./netlify-build.sh` in the repo root.
2. The script builds the `terminal` app (runs `npm ci` / `npm run build` in `terminal`), copies root static files (index.html, styles.css, script.js, Images/) into `public/`, copies `terminal/dist` into `public/terminal`, and writes `public/_redirects` to route `/` to `/terminal/index.html`.
3. Netlify publishes the `public/` directory as the site. You will see the terminal UI at the site root.

Local testing
- To test locally before pushing:
```powershell
# from repo root
# (1) Ensure the terminal build works
cd terminal
npm install
npm run build
cd ..

# (2) Run the build script locally to assemble public/
# On Windows PowerShell:
./netlify-build.sh

# (3) Serve public/ locally
cd public
python -m http.server 8000
# open http://localhost:8000
```

Deploy to Netlify
1. Commit & push to GitHub.
2. In Netlify dashboard, click "New site" → "Import from Git" → choose your repo and branch.
3. Netlify will detect `netlify.toml` and run `./netlify-build.sh`. The publish directory is `public`.
4. Add any environment variables needed (Site settings → Build & deploy → Environment).

Notes
- If your terminal app requires API keys, do NOT embed them into client-side JS; use Netlify Functions or a server-side proxy.
- If you prefer the resume at `/` and terminal at `/terminal`, remove the `_redirects` creation step in `netlify-build.sh`.

If you want, I can commit these files for you and push, or I can create a second Netlify site for the terminal only instead. Tell me which you prefer.

Troubleshooting: Netlify "Permission denied" / exit code 126

If Netlify logs show `Permission denied` when running `./netlify-build.sh` (exit code 126), the script exists in the repo but isn't executable. Two ways to fix:

1) Preferred — make the script executable and commit it:

	- On macOS / Linux / WSL / Git Bash:
		```bash
		chmod +x netlify-build.sh
		git add netlify-build.sh
		git commit -m "Make netlify-build.sh executable"
		git push
		```

	- On Windows (PowerShell / cmd with Git):
		```powershell
		git update-index --add --chmod=+x netlify-build.sh
		git commit -m "Make netlify-build.sh executable"
		git push
		```

2) Quick alternative — run the script through `bash` so the exec bit isn't required. This repo already uses `bash ./netlify-build.sh` in `netlify.toml`, which avoids the permission problem.

After applying either fix, trigger a redeploy in Netlify (Deploys → Trigger deploy → Clear cache and deploy site).
