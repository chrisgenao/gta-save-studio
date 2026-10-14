# GTA Save Studio — GitHub Pages fix for chrisgenao/gta-save-studio

This package fixes the `404` errors for `app.js`, `styles.css`, `favicon.svg`, and the game logos on project-hosted GitHub Pages. It works at `https://chrisgenao.github.io/gta-save-studio/` and at other GitHub Pages repository paths.

## Fastest fix: replace the repository files

1. Extract `GTA-Save-Studio-GitHub-Pages-FIXED.zip` on your computer.
2. Open https://github.com/chrisgenao/gta-save-studio and select **Add file → Upload files**.
3. Drag the **contents of the extracted folder** onto the upload area, *not the containing folder or ZIP*. Upload all source files and folders (including the corrected `index.html`, `src/`, `404.html`, and `scripts/`). If GitHub warns about overwriting, commit replacements. GitHub's web upload UI may not allow some overwrite workflows; in that case, use GitHub Desktop or Git to copy the files over and commit.
4. In your repository **Settings → Pages → Build and deployment**, choose one of:
   - **GitHub Actions** (recommended): the provided `.github/workflows/pages.yml` builds and deploys the static site. Visit the **Actions** tab and ensure **Publish GTA Save Studio** succeeds.
   - **Deploy from a branch**: select `main`, `/(root)`, and save. This also works because the source `index.html` uses dynamic asset paths and there is a `404.html` route fallback.
5. Wait for the Pages deployment. Refresh with **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac).

Your live site: https://chrisgenao.github.io/gta-save-studio/

## Check the assets

These URLs should now return actual files rather than a GitHub 404 page:

- https://chrisgenao.github.io/gta-save-studio/src/app.js
- https://chrisgenao.github.io/gta-save-studio/src/styles.css
- https://chrisgenao.github.io/gta-save-studio/favicon.svg
- https://chrisgenao.github.io/gta-save-studio/assets/gta-tlad.png
- https://chrisgenao.github.io/gta-save-studio/assets/gta-tbogt.png

The project site should load at `/gta-save-studio/`, and direct game URLs such as `/gta-save-studio/gtasa` should work via the `404.html` redirect.

## Technical details

The page computes its hosting root dynamically in the browser and installs a `<base>` element before loading CSS or JavaScript. The JavaScript router and logo URLs use `document.baseURI` too. Do not reintroduce root-relative asset links such as `src="/src/app.js"` because those resolve at the domain root, not the GitHub project path.

The optional GitHub Actions workflow copies the already-portable static project to `dist/`; Node.js is not required by GitHub Pages at runtime. The source ZIP excludes actual player save files.

## Testing and limitations

Run `npm test` to check binary/editor regression tests. Direct asset URLs and routing can also be checked via the browser's Network panel. Automated browser navigation in this environment was blocked by administrator policy, so visual end-to-end validation on the live site remains to be done after publishing.
