# eli5

A personalised explanation app that learns how someone absorbs information, then adapts the same idea to their preferred pace and format.

## MVP

- Three-step learning-style calibration
- Personal learning profile saved in the browser
- Tailored explanation entry point with suggested topics
- Multiple explanation modes: analogy, steps, relevance, and knowledge check
- Adjustable detail level
- Responsive design for desktop and mobile

The current prototype includes rich authored explanations for black holes, compound interest, APIs, and inflation, plus a generic fallback for free-text topics. A production version would connect the explanation view to a language-model API through a secure server endpoint.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with `npm run build`.

## Live app

The `main` branch deploys automatically to [alanrodmell.github.io/eli5app](https://alanrodmell.github.io/eli5app/) through GitHub Pages.
