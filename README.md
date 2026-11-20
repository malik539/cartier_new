# Cartier Orthodontics — Google Ads landing page

Redesign of `https://smilehub2.cartierorthodontics.com/` (quiet-luxury / Hamptons look, far less text).
Static site: no build step, no dependencies.

```
index.html              landing page
thank-you/index.html    post-submit page (served at /thank-you)
assets/css/styles.css   all styles
assets/js/main.js       form popup + redirect, hero video, review ticker, fade-in, mobile bar
assets/img/             compressed WebP versions of the existing page's images
assets/fonts/           self-hosted Cormorant Garamond + Jost (latin, variable)
assets/video/           hero clinic video, re-encoded to 720p (3 MB; the original is 73 MB)
```

## Deploy

Upload the folder as-is to any static host (Vercel, Netlify, Cloudflare Pages, S3…) at the root of the
domain. `/thank-you` must resolve to `thank-you/index.html` (the default on those hosts).

Preview locally:

```bash
python3 -m http.server 8000
```

## Carried over unchanged — do not edit

- **Google Ads tag** `AW-18036592609`, both `phone_conversion_number` call-tracking configs and
  `gtag_report_conversion()` (in the `<head>` of both pages).
- **Lead conversion event** `AW-18036592609/Quh3CKKXo58dEOGfwphD` on the thank-you page.
- **SmileHub form** `3PoF8FP86X7OfRoyfHb0`: same iframe, same attributes, same `form_embed.js`.
  Fields and form styling are managed in SmileHub, not in this repo. As on the old page it appears
  twice: inline above the footer (`inline-…`) and in the popup every "Book Free Consultation" button
  opens (`modal-…`, created by `main.js` on first open).
- **Submit handling**: same detection as the old page — when the form reports a submission the visitor
  goes to `/thank-you`. The current query string (e.g. `?=wc`, `gclid`, `utm_*`) is carried along.
- **Phone numbers** are real text inside `tel:` links so Google's number swapping keeps working.
- **Offer terms** wording is verbatim.

## Open placeholders

- Footer **Privacy Policy** and **Terms of Service**: the old page shows these labels without any link
  URL. They are marked `[PLACEHOLDER]` in the footer — replace `href="#"` in `index.html` and delete the
  two `<span class="placeholder">` tags.
