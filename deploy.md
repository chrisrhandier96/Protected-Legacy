# Patrimonio Protegido: from file to live site

Everything here is done from a browser. No terminal, no code. Budget: the site and hosting are free, the domain is about $12 to $20 a year.

---

## What changed in your file

| Change | Why |
|---|---|
| Every "Marsh" string is gone | The three mentions were the 2021 **Marshall Fire** citation, not your employer. They now read "incendio de Boulder County, Colorado" and "2021 Boulder County wildfire in Colorado". Same study, same source, same data, zero chance of a misread. |
| The contact form actually sends | Before, the button only hid the fields and showed a thank-you. Nobody received anything. It is now a real form that posts to your host and lands on `gracias.html`. |
| A thank-you page (`gracias.html`) | Google Ads counts a conversion when someone lands on it. Far more reliable than event tracking. |
| A privacy policy (`privacidad.html`) | Google requires one before it approves ads that collect contact data. Written in both languages, honest about what you keep. |
| One config block at the top of `index.html` | Domain, contact email, Analytics ID, Ads ID, license status. Five lines, one place. |
| License notice is now a switch | Today it says you are not licensed. Set `LICENSED: true` and paste the number and both languages rewrite themselves. |
| `?lang=en` works | Your English ads can land people on English copy. Also remembers the visitor's choice. |
| SEO and sharing | Canonical link, structured data, `og.png` preview image, `robots.txt`, `sitemap.xml`, favicon. |
| Analytics loads only when you fill in the IDs | No empty tracking calls, no console errors, nothing fires before you are ready. |

The cinema layers, the ES/EN toggle, the quiz and every word of your copy are untouched.

---

## Step 1. Put it online today, free (10 minutes)

1. Go to **netlify.com** and sign up (email or GitHub, free tier).
2. Click **Add new site** then **Deploy manually**.
3. Drag the whole `patrimonio-site` folder (or the `patrimonio-site.zip`) into the drop area.
4. It goes live in about 20 seconds at something like `https://silly-name-12345.netlify.app`.
5. **Site configuration → Site details → Change site name**: make it `patrimonio-protegido`. Your temporary address becomes `https://patrimonio-protegido.netlify.app`. That address works for testing and even for the first ads if the domain is not ready.

### Turn on form notifications (2 minutes, do not skip)

1. In the site: **Forms**. You will see a form named `contacto` after the first deploy.
2. **Form notifications → Add notification → Email notification**.
3. Put your personal email in. Every submission now arrives in your inbox and is also stored in Netlify.
4. Send yourself a test from the live site and confirm the email arrives.

---

## Step 2. The domain

`patrimonioprotegido.com` is taken (registered through IONOS, expires October 5, 2026, currently pointing nowhere). `patrimonioprotegido.net` is taken too (Cloudflare, registered January 2026).

Available right now, checked in the registry:

| Domain | Verdict |
|---|---|
| **patrimonioprotegidofl.com** | **Recommended.** Brand intact, Florida signal, reads well in an ad. |
| patrimoniofl.com | Shorter, but loses the brand word. |
| patrimonioprotegidomiami.com | Long, and it boxes you into Miami when your audience is statewide. |

Buy it wherever you like. Cheapest with privacy included is **Cloudflare Registrar** (at cost, about $10 a year). **Namecheap** is about $12. **GoDaddy** works too, just decline every upsell at checkout: you do not need their hosting, their email, their SSL or their "protection" plan. Netlify gives you SSL free.

If you want the exact `.com` later: it expires October 5, 2026. If the owner does not renew, it usually becomes available again 75 to 90 days after that. A backorder at Namecheap or GoDaddy costs about $20 and only charges you if it drops.

### Point the domain at the site

In Netlify: **Domain management → Add a domain** and type your new domain. Then either:

- **Easiest:** let Netlify handle DNS. Netlify shows you four nameservers. In your registrar, replace the existing nameservers with those four. Wait 15 minutes to a few hours.
- **Or keep DNS at the registrar:** add an `A` record for `@` pointing to `75.2.60.5`, and a `CNAME` for `www` pointing to your `something.netlify.app` address.

SSL turns on by itself once DNS resolves. Check that `https://` works before running any ad.

---

## Step 3. Fill in the config (5 minutes)

Open `index.html` in any text editor. Near the top:

```js
window.PP = {
  SITE_URL:      'https://patrimonioprotegidofl.com',
  CONTACT_EMAIL: 'su-correo@ejemplo.com',
  FORM_ENDPOINT: '',        // leave empty on Netlify
  GA4_ID:        'G-XXXXXXXXXX',
  ADS_ID:        'AW-XXXXXXXXX',
  ADS_LABEL:     'xxxxxxxxxxxxxxx',
  LICENSED:      false,
  LICENSE_NUMBER:''
};
```

Then three quick edits elsewhere:
- `gracias.html`: same `GA4_ID`, `ADS_ID` and `ADS_LABEL` in its small config block.
- `robots.txt` and `sitemap.xml`: replace `REEMPLAZAR-DOMINIO.com` with your domain.
- `privacidad.html`: one line at the bottom holds the contact email.

Save, then drag the folder into Netlify again. That is what a redeploy is.

---

## Step 4. Analytics and conversion tracking

1. **Google Analytics 4**: analytics.google.com → create a property → add a **Web** data stream with your domain → copy the `G-XXXXXXXXXX` into both files.
2. **Google Ads**: create the account, then **Switch to Expert Mode** before anything else (the simple mode hides everything that matters).
3. In Google Ads: **Goals → Conversions → New conversion action → Website**. Enter your domain. Create one manually:
   - Category: **Submit lead form**
   - Name: `Formulario de contacto`
   - Rule: **URL contains** `/gracias.html`
   - Value: leave blank for now. Count: **One**.
4. Google gives you a conversion ID (`AW-XXXXXXXXX`) and a label. Paste both into the config blocks.
5. Link Google Ads to GA4 (**Tools → Data manager → Google Analytics 4**), and import the GA4 property while you are there.
6. **Search Console**: search.google.com/search-console → add your domain → verify with the DNS TXT record your registrar lets you add → submit `sitemap.xml`.

---

## Step 5. Before a single ad runs

- [ ] The live site loads over `https://` with no warning.
- [ ] A test submission arrives in your email and lands on the thank-you page.
- [ ] The privacy policy opens from the footer.
- [ ] The license sentence in the footer matches your real status today. This is the one line that must be true before you spend money pointing traffic at the page.
- [ ] `?lang=en` shows the English version.
- [ ] Open the site on your phone and read the first screen. That is where most of the ad traffic will land.

Once those six are ticked, the Google Ads plan in `google-ads-plan.md` takes it from there.
