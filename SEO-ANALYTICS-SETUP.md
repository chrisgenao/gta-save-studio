# GTA Save Studio v3.0 — SEO + private analytics setup

This edition targets **https://chrisgenao.github.io/gta-save-studio/**. No API keys, backend, or paid services are required to deploy the editor. This repository contains no player save files.

## 1. Publish on GitHub Pages

1. Replace your repo `chrisgenao/gta-save-studio` files with the **contents** of this folder (`index.html`, `src`, `assets`, `gtasa`, `.github`, etc.). Preserve the directory structure.
2. In **Settings → Pages**, select **GitHub Actions** as the deployment source. The supplied `.github/workflows/pages.yml` builds and publishes the site. Branch-based root publishing also works because the per-game HTML files are included.
3. After the Action succeeds, check:
   - https://chrisgenao.github.io/gta-save-studio/
   - https://chrisgenao.github.io/gta-save-studio/gtasa/
   - https://chrisgenao.github.io/gta-save-studio/sitemap.xml
   - https://chrisgenao.github.io/gta-save-studio/assets/social-preview.png
   - https://chrisgenao.github.io/gta-save-studio/privacy.html
4. Test importing and exporting a *backup* save. Refresh `/gtasa/` directly to ensure the route resolves.

## 2. Make the site eligible for Google Search

1. Open **https://search.google.com/search-console/** and select **Add property → URL prefix**.
2. Enter **https://chrisgenao.github.io/gta-save-studio/** (with final slash). Follow Google's ownership-verification instructions. If using HTML verification, place the provided tag in the source `index.html` `<head>`, or place the supplied verification file in this repository's root. The GitHub Action must publish it: the current build includes only known files, so for an HTML verification file also add the filename to `scripts/build-pages.mjs`. Easiest: **HTML tag** method. Keep this tag after verification.
3. In Search Console open **Sitemaps**, submit **sitemap.xml**.
4. Use **URL Inspection** on your homepage and game URLs, then select **Request indexing** if offered.
5. Check Search Console **Performance → Search results** for impressions, clicks, CTR, search queries, countries, and ranking positions. Check **Indexing → Pages** to see indexing issues.

**Indexing is not automatic or guaranteed.** It can take days/weeks for Google to crawl and include new pages; Search Console's submission and sitemap are signals, not a promise. The sitemap lists your homepage plus six unique game editor pages. Each page has unique HTML title, description, canonical URL, Open Graph and Twitter sharing information, JSON-LD describing a free browser-based app, and readable text before JavaScript executes. There are no fabricated ratings or reviews.

**Note:** GitHub Pages project sites cannot set the host-root `https://chrisgenao.github.io/robots.txt` unless you manage that root Pages site too. A copy of `robots.txt` inside `/gta-save-studio/` exists for reference, but **the Search Console sitemap submission** is the reliable discovery method in this setup.

## 3. Enable statistics through Google Analytics 4

1. Visit **https://analytics.google.com/** and create an account / **GA4 property**, with a **Web** data stream for `https://chrisgenao.github.io/gta-save-studio/`.
2. Copy your *public* **Measurement ID** from **Admin → Data streams → your web stream**. It looks like `G-XXXXXXXXXX`.
3. Open **`src/analytics-config.js`** and replace the empty string:

   ```javascript
   export const GA4_MEASUREMENT_ID = 'G-XXXXXXXXXX';
   ```

4. Commit the change and wait for GitHub Pages to redeploy.
5. Open the website in a clean/incognito session. Select **Allow statistics** on the consent banner. Then open GA4 **Reports → Realtime** to confirm a visit appears. GA4 standard reports may take longer to populate.

**There is no tracking unless you set the ID AND each visitor consents.** Declining leaves GA unloaded. Consent preference uses browser localStorage (no save contents stored). Visitors can reopen their preference via the **Privacy & analytics** page. GA4 tracking should be reviewed against privacy laws applicable to your visitors; for a public website, you may want a more detailed privacy policy and appropriate contact details.

### What GA4 shows you

- Users and sessions, page views, approximate location/device and referrer data (depending on GA processing and consent)
- Your most visited game editor pages (`/gtasa/`, `/gtaiv/`, etc.)
- **Events:** `save_imported`, `save_exported`, and `import_failed`, each with a game ID (`SA`, `VC`, `III`, `IV`, `TLAD`, `TBOGT`). The custom `game_title` event parameter may require creating an event-scoped custom dimension in GA4 for breakdown reporting.

### What never gets sent to Analytics

The file bytes, filenames, save slot, player names, player statistics, money values, mission completion flags, errors, and exported save content. No user accounts or server-side uploads are added.

### Want statistics without optional cookies?

You could instead switch to a separate privacy-oriented analytics service such as Cloudflare Web Analytics, but that is *not* pre-enabled by this project. Avoid enabling multiple vendors without updating the privacy notice. This version includes **only optional GA4**.

## 4. Technical / customization notes

- Source pages live in `/gtaiii/index.html`, `/gtavc/index.html`, `/gtasa/index.html`, `/gtaiv/index.html`, `/tlad/index.html`, and `/tbogt/index.html`.
- Regenerate game SEO pages and sitemap with `node scripts/generate-seo.mjs`. The GitHub Pages build does this automatically.
- Set the canonical hosting location in the `SITE` constant of `scripts/generate-seo.mjs`, and the client metadata URLs in `src/app.js`, if you move to a custom domain. Then rebuild the static pages.
- For a social preview, see `assets/social-preview.png` (1200×630).
- Run `npm test` and `node scripts/build-pages.mjs` to validate and build the project.
- `privacy.html` documents analytics behavior, and `disclaimer.html` preserves the Rockstar/Take-Two non-affiliation statement.
