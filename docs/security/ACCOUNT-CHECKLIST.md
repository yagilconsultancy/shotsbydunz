# Account security checklist

Settings that protect the site but live in the accounts, not the code (Findings 1, fix 6). Tick each one when done.

## GitHub (`yagilconsultancy`)

- [ ] Two-factor login: profile picture, Settings, Password and authentication, Enable two-factor authentication. Use an authenticator app, and save the recovery codes somewhere safe.
- [ ] Protect `main`: repo `shotsbydunz`, Settings, Branches (or Rules, Rulesets), Add rule for `main`:
  - Require a pull request before merging
  - Block force pushes
  - Restrict deletions
- [ ] Repo, Settings, Code security: turn on Dependabot alerts, Dependabot security updates and Secret scanning (with Push protection), so a key pasted by mistake is blocked before it reaches GitHub.
- [ ] Keep the repo private.

## Vercel

- [ ] Two-factor login: Account Settings, Authentication.
- [ ] Preview links: Project, Settings, Deployment Protection, Vercel Authentication on for previews. Share the production link with Dunz, not branch previews.
- [ ] Rate limit the forms: Project, Firewall, Configure, New rule:
  - Name: Form rate limit
  - If Request Path starts with `/api/`
  - Then Rate Limit: 10 requests per 60 seconds per IP, action Deny (429)
  - Save, then Review Changes and Publish
- [ ] Environment variables holding secrets (`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`) are marked Sensitive.

## Resend (when set up)

- [ ] Two-factor login.
- [ ] API key permission: Sending access only, limited to the ShotsByDunz domain.
- [ ] Verify the domain with SPF and DKIM, and add a DMARC record (`v=DMARC1; p=quarantine`) so nobody else can send as Dunz.

## Cloudflare (when Turnstile is set up)

- [ ] Two-factor login.
- [ ] Widget hostnames limited to the site's own addresses.

## Every few months

- [ ] `npm audit --omit=dev` shows 0 vulnerabilities; merge Dependabot pull requests after the preview checks out.
- [ ] Remove anyone who no longer needs access to GitHub, Vercel or Resend.
