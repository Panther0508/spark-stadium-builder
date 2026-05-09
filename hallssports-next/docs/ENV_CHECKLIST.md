# Environment Variables Checklist for Vercel Deployment

Before deploying HallsSports to Vercel, you must configure the following environment variables in your project settings. This document explains what each variable is for and where to find its value.

---

## How to Set Environment Variables in Vercel

1. Go to your project on [vercel.com](https://vercel.com)
2. Navigate to **Settings** → **Environment Variables**
3. Click **Add Variable** for each entry below
4. Choose **Environment** (Production, Preview, Development) – typically set for **Production** and **Preview**
5. Mark **Sensitive** (secret) for keys that should be hidden (service role, VAPID private, etc.)
6. Save → trigger a new deployment

---

## Required Variables

### Supabase (Database & Auth)

| Variable | Type | Description | Where to find |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Plain text | Your Supabase project URL (e.g., `https://abcdef.supabase.co`). This is **public** and embedded in client JavaScript. | Supabase Dashboard → Project Settings → **API** → "Project URL" |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Plain text | Supabase **anon** (public) API key. Allows read access and limited writes with Row Level Security (RLS). This key is **public**. | Supabase Dashboard → Project Settings → API → "anon public" key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | Supabase **service_role** key. Bypasses RLS – only for server-side and admin APIs. **Never expose to client.** | Supabase Dashboard → Project Settings → API → "service_role secret" key |

---

### Site Configuration

| Variable | Type | Description | Example |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Plain text | The canonical URL of your deployed site (used in emails, Open Graph, password reset redirects). | `https://hallssports.vercel.app` |

---

### Cloudinary (Media Uploads)

Cloudinary handles image and video uploads for player photos, team logos, and highlight reels.

| Variable | Type | Description | Where to find |
|---|---|---|---|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Plain text | Your Cloudinary cloud name (the `cloud_name` part of your credentials). | Cloudinary Dashboard → Account Details |
| `CLOUDINARY_API_KEY` | **Secret** | Cloudinary API key – used server-side for signed uploads. | Cloudinary Dashboard → API Keys |
| `CLOUDINARY_API_SECRET` | **Secret** | Cloudinary API secret – keep this confidential. | Cloudinary Dashboard → API Keys |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Plain text | Upload preset name (configured in Cloudinary to allow unsigned uploads if you use that mode). | Cloudinary Dashboard → Settings → Upload → Upload presets |

---

### VAPID Keys (Web Push Notifications)

Web push requires a pair of VAPID keys to authenticate your server with the browser's push service.

| Variable | Type | Description |
|---|---|---|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Plain text | The **public** VAPID key (embedded in client JS). |
| `VAPID_PRIVATE_KEY` | **Secret** | The **private** VAPID key – used server-side to sign push payloads. **Never expose to client.** |

**How to generate VAPID keys:**

```bash
# If you have web-push installed globally:
npx web-push generate-vapid-keys

# Or via Node:
node -e "const webpush = require('web-push'); console.log(webpush.generateVAPIDKeys());"
```

Save the output and set the two env vars accordingly.

---

### Gemini AI (Smart Summaries – optional)

Currently the AI summary feature is not fully implemented, but the config keys are reserved.

| Variable | Type | Description |
|---|---|---|
| `GEMINI_API_KEY` | **Secret** | Google Gemini API key for generating match summaries. Obtain from Google AI Studio. |

---

### Cron Jobs (Scheduled Tasks)

If you schedule tasks (e.g., automatic match status expiry, cleanup), use a shared secret.

| Variable | Type | Description |
|---|---|---|
| `CRON_SECRET` | **Secret** | A random, high-entropy string that protects your cron endpoints from unauthorized access. Set this and configure your cron provider to include it as a query param. |

---

## Optional Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_PANTERO_URL` | Override the Pantero link (defaults to `https://pantero.vercel.app`). |
| `NEXT_PUBLIC_FEEDBACK_URL` | Override the feedback form URL (defaults to `https://forms.gle/yourfeedbackform`). |

If not set, defaults from `settings` table are used.

---

## Verification Steps After Setting Env Vars

1. **Local test** (`.env.local`):  
   Create a `.env.local` file at project root with all keys and run `npm run dev`.  
   Watch for errors on startup – missing keys throw immediately.

2. **Vercel build**:  
   Push a commit and let Vercel build. Check build logs for:
   - `Supabase URL and anon key present`
   - `Service role key present`
   - No missing Cloudinary warnings

3. **Admin login test**:  
   Visit `/admin-login` and ensure you can authenticate.

4. **Push notifications**:  
   On a deployed HTTPS site, open the PWA and check Service Worker registration. Click "Subscribe" if visible.

---

## Troubleshooting

- **"env var not found" error**: Double-check spelling; env var names are case-sensitive.
- **Uploads fail**: Verify Cloudinary keys and that the upload preset allows the file type.
- **Email reset link wrong**: Ensure `NEXT_PUBLIC_SITE_URL` points to your live domain (not localhost).
- **Push subscription errors**: Make sure VAPID keys are correctly paired and the service worker file is served from `/public`.

---

Need help? Contact the project maintainer or refer to the individual service documentation linked above.
