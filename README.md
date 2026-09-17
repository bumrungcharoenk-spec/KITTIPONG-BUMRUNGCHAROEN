# Navify

Navify is a same-origin Cloudflare Worker application. The Worker serves the existing campus navigation frontend and verifies access codes server-side.

## Local development

1. Install Node.js 18 or newer.
2. Run `npm install`.
3. Copy `.dev.vars.example` to `.dev.vars` and replace both placeholders locally. Never commit `.dev.vars`.
4. Run `npm run dev`.
5. Open the local Wrangler URL shown in the terminal.

The existing `index.html`, `styles.css`, and `scirpt.js` files are copied into an ignored `public/` staging directory before Wrangler starts or deploys. The Worker serves only those public assets, so `.env`, `.dev.vars`, source files, and package metadata are not published as static assets.

## Deploy to Cloudflare

Authenticate Wrangler once:

```powershell
npx wrangler login
```

Set the production secrets without putting them in the repository:

```powershell
npx wrangler secret put NAVIFY_ACCESS_CODES
npx wrangler secret put NAVIFY_SESSION_SECRET
```

Enter the values only when Wrangler prompts. Use a long random value for `NAVIFY_SESSION_SECRET`. Then deploy:

```powershell
npm run deploy
```

Wrangler prints the public `https://navify.<your-subdomain>.workers.dev` URL after a successful deployment. Cloudflare serves the frontend and authentication API from that same HTTPS origin, so no CORS configuration is needed.

## GitHub automatic deployments

In the Cloudflare dashboard, open **Workers & Pages**, choose **Create application**, select **Workers**, then choose **Import a repository** and connect the GitHub repository. Select the `main` branch, set the build command to `npm run build:assets`, set the deploy command to `npx wrangler deploy`, and leave the output directory empty because Wrangler uploads the Worker and its static assets.

Configure `NAVIFY_ACCESS_CODES` and `NAVIFY_SESSION_SECRET` as encrypted production secrets in the Cloudflare project. Do not add them to GitHub Actions variables, public configuration, or committed files. After the GitHub connection is enabled, pushes to `main` trigger Cloudflare deployment automatically.

The access code is never included in browser JavaScript, HTML, CSS, map data, API responses, or logs. Successful authentication uses a signed HttpOnly cookie; failed attempts are rate-limited per client address at the Worker edge.