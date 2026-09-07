# Dowling Projects website

A one-page website for Dowling Projects, built as a lightweight static site with a Vercel serverless quote form.

## Open locally in VS Code

1. Open this folder in VS Code.
2. Run a local static server. VS Code Live Server works well, or run:
   `python3 -m http.server 8080`
3. Open `http://localhost:8080`.

The quote form will only send email after deployment to Vercel because `/api/quote` is a Vercel serverless function.

## Replace the placeholder photos

Replace these files while keeping the same filenames:

- `assets/hero-placeholder.jpg`, main hero image. Use a landscape or square photo of Anro working, preferably with clear darker space on the left for the headline.
- `assets/anro-placeholder.jpg`, About portrait. Use a natural working portrait of Anro.
- `assets/fabrication-placeholder.png`, Experience image. Use a close-up of actual hands-on work, fabrication, tools or a completed detail.

If you use different filenames, update the references in `index.html` and `styles.css`.

## Quote form email

The form posts to `/api/quote.js`, which sends the enquiry through Resend to Anro's dedicated Gmail address.

In Vercel, add these Environment Variables:

- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL`

For production, verify the Dowling Projects domain in Resend and use an address such as `website@dowlingprojects.co.za` as `CONTACT_FROM_EMAIL`. The recipient can still be Anro's Gmail address.

## Deploy to Vercel

The project can be imported directly from a GitHub repository. Vercel should detect it as a static project automatically. No build command is required.

Environment variables must be added before testing the live quote form.

## Main contact details

WhatsApp and phone: +27 62 411 4413

## Notes before launch

- Replace placeholder imagery with real images of Anro.
- Create the dedicated Gmail address and set `CONTACT_TO_EMAIL`.
- Add the final domain to Vercel.
- Verify the sending domain in Resend.
- Add Google Analytics / Google Tag Manager once the Google account setup is ready.
- Add the final Google Business Profile link when available.


## Charcoal + contour visual test

This build contains a reversible visual experiment using the proposed secondary palette:

- Charcoal: `#252A2D`
- Contour detail: `#555A5C`

The test is enabled by the class `theme-charcoal-test` on the `<body>` element in `index.html`.

**To revert to the previously approved design, simply remove `class="theme-charcoal-test"` from `<body>`.** All test styling is scoped to that class, so no other CSS needs to be undone. The extra `assets/contour-lines.svg` file can remain without affecting the site.

The experiment is deliberately limited to the trust ticker, Where We Work section, footer, secondary dark buttons and the Anro image label.
