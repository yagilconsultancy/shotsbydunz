# Deployment and git workflow

Same rule as the GPHS project: **all changes reach `main` through a pull request. Never commit straight to `main`.** Vercel builds whatever is on `main`, so `main` is always the version the client sees.

Commands are for PowerShell in the VS Code terminal. Run them one line at a time; `&&` doesn't work in PowerShell.

## First-time setup (once)

1. Install Git for Windows and Node.js 20 or newer if they aren't already installed.
2. On GitHub, create a new **private** repository called `shotsbydunz` under `yagilconsultancy`. Don't add a README; the project already has one.
3. In VS Code, open `Documents\shotsbydunz` and run:

   ```
   git init
   git add .
   git commit -m "Initial ShotsByDunz site with sample content"
   git branch -M main
   git remote add origin https://github.com/yagilconsultancy/shotsbydunz.git
   git push -u origin main
   ```

   When asked for a password, use your GitHub Personal Access Token (classic, `repo` scope), the same kind you use for GPHS.

4. On vercel.com, sign in with GitHub, choose Add New, Project, and import `shotsbydunz`. Leave the build settings as they are.
5. Before clicking Deploy, open Environment Variables and add:
   - `NEXT_PUBLIC_PREVIEW_MODE` = `true`
   - `NEXT_PUBLIC_SITE_URL` = the Vercel address (you can fill this in after the first deploy, then redeploy)
6. Deploy. Vercel gives you a link like `shotsbydunz.vercel.app`. That's the link to share with Dunz.

## Every change after that

1. Get the latest `main`:

   ```
   git checkout main
   git pull origin main
   ```

2. Make a branch for the change:

   ```
   git checkout -b update-booth-prices
   ```

   Use `feature/<name>` for new features and `update-<name>` for content or docs changes.

3. Make the edits (or let Claude make them), then check they work:

   ```
   npm run dev
   npm run build
   ```

4. Save the change to git and push the branch:

   ```
   git add .
   git commit -m "Update booth prices"
   git push -u origin update-booth-prices
   ```

5. On GitHub, open a Pull Request from your branch into `main`. Vercel posts a preview link on the pull request so you can check the change before it goes live. Merge when it looks right.
6. Vercel rebuilds `main` automatically within a minute or two. Unlike PythonAnywhere, there's no reload step.

Before trusting that something is committed, check with `git status` and `git log -1`. If a fix works locally but not on Vercel, it usually wasn't committed or the pull request wasn't merged.

## Going live on Dunz's domain

1. In Vercel, Project, Settings, Domains, add the domain and follow the DNS instructions it shows.
2. Change `NEXT_PUBLIC_SITE_URL` to `https://<the domain>` and `NEXT_PUBLIC_PREVIEW_MODE` to `false`.
3. Redeploy. Test the booking form end to end with a real email.
4. Update the link in her Instagram and TikTok bios.
