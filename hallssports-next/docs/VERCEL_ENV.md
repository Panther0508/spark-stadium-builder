# Vercel Environment Variables – HallsSports

Set these in **Vercel Dashboard → Project Settings → Environment Variables**.

---

## Required (Production & Preview)

| Variable | Type | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Plain | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Plain | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | Supabase service role key |
| `NEXT_PUBLIC_SITE_URL` | Plain | Your deployed URL (e.g. `https://hallssports.vercel.app`) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Plain | Web Push public key |
| `VAPID_PRIVATE_KEY` | **Secret** | Web Push private key |
| `NEXT_PUBLIC_FEEDBACK_FORM_URL` | Plain | Google Forms embed URL for feedback |

---

## Optional (Cloudinary)

| Variable | Type | Description |
|---|---|---|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Plain | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | **Secret** | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | **Secret** | Cloudinary API secret |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Plain | Upload preset name |

---

## Admin Credentials

| Variable | Description |
|---|---|
| `ADMIN_SCOUT_EMAIL` / `ADMIN_SCOUT_PASSWORD` | Scout role login |
| `ADMIN_MEDIA_EMAIL` / `ADMIN_MEDIA_PASSWORD` | Media role login |
| `ADMIN_VERIFIER_EMAIL` / `ADMIN_VERIFIER_PASSWORD` | Verifier role login |

---

## Monitoring & AI (Optional)

| Variable | Type |
|---|---|
| `NEXT_PUBLIC_SENTRY_DSN` | Plain |
| `SENTRY_ORG` | Plain |
| `SENTRY_PROJECT` | Plain |
| `SENTRY_AUTH_TOKEN` | **Secret** |
| `GEMINI_API_KEY` | **Secret** |
| `CRON_SECRET` | **Secret** |
| `DEV_KEY` | Plain (developer console access) |

---

## After Setting Variables

1. Trigger a new deployment.
2. Verify health at `/` and admin login at `/admin-login`.
3. Test feedback modal via More → Feedback or floating button.

See `ENV_CHECKLIST.md` for full documentation on each variable.
