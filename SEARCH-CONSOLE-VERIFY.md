# Google Search Console and GitHub Pages troubleshooting

Google requested an HTML verification file named:

`google1ed131ac7d6d9c0a.html`

The repository root and generated GitHub Pages site both include the *original uploaded file*.
Its contents are:

```
google-site-verification: google1ed131ac7d6d9c0a.html
```

The published URL must be:

https://chrisgenao.github.io/gta-save-studio/google1ed131ac7d6d9c0a.html

## Steps

1. Commit all new files, including `.github/workflows/pages.yml`, `scripts/build-pages.mjs`, and the verification HTML file to the **root** of `main`.
2. Set **Settings → Pages → Source → GitHub Actions**.
3. Look in **Actions → Publish GTA Save Studio** and wait for **build**, then **deploy**.
4. Open the verification URL. It must show the single-line verification message rather than a 404, the GTA website, or an HTML redirect.
5. Press **Verificar** in Google Search Console. Keep the file permanently.

When GitHub says `No artifacts named "github-pages"`, the build artifact was not available for the deployment run. The updated workflow makes the deploy job depend on the build job and explicitly checks that Google verification and site assets exist in the uploaded folder.

If you still see this after the update, confirm the run selected is **Publish GTA Save Studio** (not `pages-build-deployment`) and check whether **Upload GitHub Pages artifact** succeeded.
