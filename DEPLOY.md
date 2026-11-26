# Deploying Waypoint to Vercel

The atlas is a pure static site. There is no build step, no server and no environment variables.

## One command

```bash
cd /home/brown/Isolate/adventures-atlas
npx vercel
```

Answer the prompts:

- Set up and deploy: yes
- Which scope: your account
- Link to existing project: no
- Project name: waypoint-atlas
- Directory: `./`
- Override settings: no

`npx vercel --prod` promotes it to the public URL.

## Git route

```bash
cd /home/brown/Isolate/adventures-atlas
git remote add origin <your repo>
git push -u origin main
```

Then import the repo at vercel.com. Choose **Other** as the framework, leave the build command empty and the output directory as `.`. Every push redeploys.

## After deploying

- `vercel.json` keeps `.html` URLs working and sets a short cache on assets. If you later switch to clean URLs, change it and rebuild the links in `build.py`.
- Fonts load from Google Fonts. Offline the site falls back to Georgia and system sans, so nothing breaks.
- Analytics are not installed. Add Vercel Web Analytics from the dashboard if you want visitor counts.

## Before you publish

Run `python3 build.py` so every page matches the current `data/adventures.json`, then check the site at a phone width and a laptop width.
