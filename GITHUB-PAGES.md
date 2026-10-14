# Deploy GTA Save Studio on GitHub Pages

This repository includes **automatic GitHub Pages deployment**. The browser runs the editor locally; no database, server process, or paid hosting is necessary.

## One-time setup (GitHub website + Git)

1. Create a **public** repository at https://github.com/new, e.g. `gta-save-studio`. You can alternatively name it `YOUR_USERNAME.github.io` to publish at the site root.
2. Upload **the contents of this project folder**, not the `.zip` file and not a nested project folder. The root of the repository should contain `index.html`, `src/`, `assets/`, `scripts/`, and `.github/workflows/pages.yml`.
3. GitHub repository **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. Commit/push the files to the `main` branch. The `Publish GTA Save Studio` workflow automatically runs the tests and publishes the website.
5. In the GitHub repository, open **Actions** to see the deployment job. When it succeeds, open the URL from **Settings → Pages**.

Site URL examples:
- `https://YOUR_USERNAME.github.io/gta-save-studio/` for a repository named `gta-save-studio`.
- `https://YOUR_USERNAME.github.io/` for a repository named `YOUR_USERNAME.github.io`.

The script derives the correct asset and URL prefixes from `GITHUB_REPOSITORY`, so **do not hand-edit** the paths.

## Command-line upload alternative

In the extracted folder, using Git in a shell (replace YOUR_USERNAME and repository name):

```bash
git init
git add .
git commit -m "Publish GTA Save Studio"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/gta-save-studio.git
git push -u origin main
```

Create the empty GitHub repository before running those commands, and **do not initialize it with a README** if using the command-line approach.

## Local usage

Run `start-windows.bat` or `npm start` and visit `http://localhost:5173/`. GitHub Pages does not run `server.mjs`; the publishing workflow builds a static site in `dist/`.

You can test the production files locally for a root-hosted site with:

```bash
node scripts/build-pages.mjs
```

For a project site, pass a base path explicitly:

```bash
node scripts/build-pages.mjs --base /gta-save-studio
```

The generated `dist/` folder is a deployment artifact; upload the **source** project, not `dist/`, if using the workflow.

## How the clean URLs work

GitHub Pages normally returns a 404 for `/gtasa` on a static project site. The generated custom `404.html` redirects the request to the dashboard, which restores the intended `/gtasa` route before loading the application. This supports direct links, refreshing, browser history, and all six game routes.

## Privacy and limitations

GTA saves are read and edited in your browser. Uploading a save **into the running app** is not the same as uploading it into the GitHub repository. Never commit `.b` saves or `SGTA4xx` files you want to keep private.

Publishing a public repository makes its source code and included assets publicly accessible. This project contains no user saves in its distribution.
