# eli5

A personalised explanation app that learns how someone absorbs information, then adapts the same idea to their preferred pace and format.

## MVP

- Three-step learning-style calibration
- Personal learning profile saved in the browser
- Tailored explanation entry point with suggested topics
- Multiple explanation modes: analogy, steps, relevance, and knowledge check
- Adjustable detail level
- Responsive design for desktop and mobile

The app generates a complete explanation for any topic through a schema-validated OpenAI Responses API call. The learner profile and selected depth shape the prompt, while the response supplies the core idea, analogy, causal steps, relevance, and knowledge check.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with `npm run build`.

## Live AI setup

The API handler at `api/explain.js` is designed for a Vercel serverless deployment. It keeps the OpenAI key on the server, validates the generated structure, limits topic length, restricts browser origins, and applies a lightweight rate limit.

1. Import this GitHub repository into Vercel.
2. Add `OPENAI_API_KEY` to the Vercel project environment variables for Production, Preview, and Development as needed.
3. Optionally set `OPENAI_MODEL` (the cost-conscious default is `gpt-5.6-luna`) and set `APP_ORIGIN` to the production site origin.
4. Redeploy after changing environment variables.

When the whole app is hosted on Vercel, the browser calls the same-origin `/api/explain` route automatically; `VITE_API_URL` is not required. It is only needed when the frontend is hosted separately, such as on GitHub Pages. In that case, set it to the full Vercel endpoint URL and rebuild the frontend.

For local full-stack development, copy `.env.example` to `.env.local`, fill in the key, and run the project through `vercel dev`. Never add the real key to Git or to a `VITE_` environment variable.

Until `VITE_API_URL` is configured, the four suggested topics continue to use clearly labelled authored demos. Any other topic shows an explicit connection screen instead of pretending that a generic placeholder is a real explanation.

## Live app

The `main` branch deploys automatically to [alanrodmell.github.io/eli5app](https://alanrodmell.github.io/eli5app/) through GitHub Pages.
