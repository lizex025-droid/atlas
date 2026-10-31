# AnatomyAtlas production deployment

Target repository: https://github.com/lizex025-droid/atlas — branch main. Repository root is AnatomyAtlas; application/build root is app. The accidental ancestor Git repository in the Windows user directory is not used or modified.

Provisioned native Git-connected Pages project: **atlas**, project ID fd6c2462-2c82-414e-88a4-34523703aa20. Production hostname: **https://atlas-9gs.pages.dev**. Source repository ID 1440861213, owner lizex025-droid, branch main. Production deployments are enabled; preview deployments and PR bot comments are disabled. The other four existing Pages projects were left unchanged. No preexisting atlas project or remote commits existed at the initial audit.

Cloudflare Pages must use its native GitHub integration for this exact repository. No Direct Upload project or upload workflow is used. Build image v3, Node 22.23.4 (app/.node-version), build root app, build output dist. Build command: `npm ci && npm test && npm run build && npm run deploy:check`. Set SKIP_DEPENDENCY_INSTALL=1 to avoid duplicate dependency installation. Production automatic deployments must be enabled for main. Existing project settings/bindings must be retained if reusing a project.

The independent app's complete current runtime assets are included: licensed GLBs, original preview images, medical JSON, source/rights manifests and UI. The current model release uses materials without separate texture images; no texture payload is removed. Private installation backups, research caches, credentials, node_modules, dist and QA outputs are excluded from Git. Exact original public asset bytes are preserved by .gitattributes.

`npm run build` emits /deployment.json with the Git commit and SHA-256 of every public asset. `npm run deploy:check` verifies every published asset against those hashes and checks Pages size/count limits. Fixed-name models and metadata must revalidate; fingerprinted Vite chunks are immutable. This avoids keeping stale model bytes after a registry/hash update.

After deployment, verify the production HTTPS URL, deployment commit, JS/CSS/images, every public asset digest, real model selection/rotation, T7 surface markers, medical panels, atlas navigation and saved scenes. Confirm a subsequent main push produces a Git-triggered production deployment with that exact SHA; configuration alone is not proof.

The deployment does not change the recorded anatomical-data gaps or independent-review status. See implementation and landmark coverage reports.
