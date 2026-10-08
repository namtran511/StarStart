# StarStart

StarStart is an early-stage AI startup exploring practical, human-guided workflows for small teams. This website includes an interactive product preview and a server-side Claude Messages API integration.

The product is in its first chapter. The website deliberately avoids claims about customers, revenue, funding, measured outcomes, or production integrations.

## Run the site

Requires Node.js 20 or newer. There are no package dependencies.

    npm start

Open http://localhost:4173.

The sample preview works without credentials. To enable live Claude responses:

1. Copy .env.example to .env.
2. Add your Anthropic API key to ANTHROPIC_API_KEY.
3. Run npm start again.

The server keeps the API key on the server and sends workflow text to the Anthropic Messages API when someone chooses a live workflow run. The demo endpoint allows 12 requests per client IP address every 10 minutes. Do not use real customer information in the public product preview.

## Contact

The early-access form opens the visitor’s email app and prepares a message for hello@starstart.world. Change the contact address in app.js and in the footer if you prefer another inbox.

## Publish the public website

This workspace is associated with GitHub account namtran511. Publish the static website from the main branch:

1. Create a GitHub repository named StarStart. A public repository works with GitHub Free Pages; private Pages repositories require a qualifying paid plan.
2. Push the StarStart site files to the main branch. The earlier Java exercise is excluded by .gitignore.
3. In the repository, open Settings → Pages. Choose Deploy from a branch, select main and /(root), then save.
4. Set the custom domain to starstart.world in Settings → Pages. The CNAME file is included with the site, though GitHub's Pages setting must also be saved.
5. At the DNS provider, point the apex domain to GitHub Pages with A records for 185.199.108.153, 185.199.109.153, 185.199.110.153, and 185.199.111.153. Enable Enforce HTTPS in Pages after GitHub finishes issuing the certificate.

The domain is configured in the project files. Its DNS records and GitHub Pages settings still need to be set at their respective providers.

## Claude API hosting

The interactive sample preview can run on GitHub Pages. Live Claude responses need a server that can run Node.js and hold ANTHROPIC_API_KEY; GitHub Pages alone cannot run server.mjs. Add a backend host before enabling live API requests on a public site. The in-memory demo rate limit is a starter guard, not a substitute for production abuse controls or usage budgets.

## Claude for Startups application preparation

Anthropic’s public startup-program terms say applications may be evaluated on business traction, investment and funding, and Claude integration and usage. This project demonstrates a real Claude API integration path and an interactive workflow prototype, but a website cannot establish company eligibility, traction, funding, or guarantee acceptance.

