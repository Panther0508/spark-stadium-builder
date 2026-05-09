# HallsSports Admin Guide

**Welcome, Admin!** 🎉  
This guide walks you through everything you need to know to manage HallsSports as one of three roles: **Data Scout**, **Media Manager**, or **Verifier**. Everything is designed to be simple – no technical skills required.

---

## Getting Started

### Logging In

1. Go to `https://yourdomain.com/admin-login`  
2. Enter your admin email and password  
3. After login you'll land on your role-specific dashboard:

| Role | Dashboard URL |
|---|---|
| Data Scout | `/admin/scout` |
| Media Manager | `/admin/media` |
| Verifier | `/admin/verifier` |

From the dashboard you can access all tools via the left sidebar (mobile: hamburger menu). The top-right "Back to Public View" button exits admin mode.

---

## Data Scout (Scout)

### Your Responsibilities

- Create and manage matches
- Enter live scores and events (goals, cards, subs)
- Manage player database (add/edit players, CSV import)
- Post announcements

### Creating a Match

1. In Scout Dashboard → **Manage Matches**
2. Click **"New Match"** button (top-right)
3. Fill in:
   - **Home Team** & **Away Team** (dropdown)
   - **Date & Time** (use picker)
   - **Venue** (optional)
   - **Featured?** Toggle ON to show on homepage
4. Click **"Create Match"**

The match now appears in the public **Matches** page.

### Live Score Entry (Live Panel)

1. From Scout Dashboard → **Live Score Entry**
2. Select an upcoming match from the dropdown. The panel shows:
   - Current score
   - Minute timer
   - Action buttons: **Goal**, **Yellow Card**, **Red Card**, **Substitution**
3. To record an event:
   - Click the appropriate button
   - Type the player's name (or pick from list if available)
   - For assists: enter assisting player name
   - For subs: enter player coming in/out
   - The event appears instantly on the live match page
4. Use **Half-Time** and **Full-Time** buttons when the match progresses.
5. Click **"Verify Match"** only after the match ends and all data is correct. Verified matches cannot be edited.

### Managing Players

**Add a single player:**

1. Scout Dashboard → **Manage Players**
2. **"Add Player"** → fill in name, team, position, number, photo URL (optional)
3. Click **"Add Player"**

**Bulk import via CSV:**

1. Click **"Import CSV"**
2. Prepare a CSV with columns: `name`, `team`, `position`, `number`  
   *(Team name must exactly match an existing team)*
3. Upload file → preview first 5 rows → confirm import

Post-import, players can be edited individually via the table row actions.

### Posting Announcements

1. Scout Dashboard → **Announcements**
2. Click **"New Announcement"**
3. Enter **Title**, **Body** (plain text – no HTML), optional **Image URL** and **Category**
4. Click **"Publish"**  
   *Note: Announcements require verifier approval to appear publicly.*

---

## Media Manager (Media)

### Your Responsibilities

- Upload and manage match highlights (photos/videos)
- Update tournament settings (name, description, social links)
- Manage static pages content (About page contributors, guests)

### Uploading Highlights

1. Media Dashboard → **Manage Highlights**
2. Click **"Add Highlight"**
3. Select a **Match** (required)
4. Enter **Title** and choose **Media Type** (image/video)
5. Upload file via Cloudinary (drag-and-drop or URL)
6. Click **"Publish"**

Highlights appear in the **Highlights** gallery and on the match detail page.

### Editing Tournament Settings

1. Media Dashboard → **Settings & About**
2. Edit fields:
   - **Tournament Name** (appears in header)
   - **About description** (homepage)
   - **Pantero link** (call-to-action button)
   - **Contributors** and **Honoured Guests** bios
3. Click **"Save"** – changes go live immediately.

---

## Verifier (Verifier)

### Your Responsibilities

- Review all data entered by Scouts and Media before it goes public
- Approve or reject items in the **Verification Queue**
- Manually override any data if needed
- Publish all approved content at once

### Verification Queue

1. Verifier Dashboard → **Verification Queue**
2. The queue lists all pending items: matches, events, players, announcements, highlights
3. For each item:
   - **View** opens a modal with full details
   - **Approve** makes it publicly visible
   - **Reject** sends it back to the Scout with an optional reason
4. Use the **"Publish All"** button to approve everything at once (great for bulk matches)

### Manual Override

Sometimes a score needs correction after verification. Use **Manual Override**:

1. Verifier Dashboard → **Manual Override**
2. Select table (Matches, Players, etc.)
3. Search record, edit, and save.  
   *Overrides are logged in `admin_logs` for audit.*

---

## Troubleshooting

### Live Scores Don't Update

- Check the live score entry panel: is the match marked as **Live**?  
- Ensure the Scout has clicked **"Verify"** after the match; unverified matches show only to admins.
- browser console errors? Check Supabase connection.

### Chat Stopped Working

- Chat automatically purges when a match finishes. Start a new live match to re-enable.
- If chat is still broken, verify `match_chats` table exists and RLS allows `INSERT`.

### Upload Fails

- File size limit: 5MB for images, 50MB for videos
- Allowed formats: JPEG, PNG, WebP, AVIF, MP4, WebM
- Make sure Cloudinary credentials are configured in Vercel env vars

### "Something went wrong" Errors

- Open browser DevTools → Console for error messages.
- Check the **Developer Console** (`/developer`) for database metrics.

---

## Need Help?

- **Feedback** → Tap the floating 💡 Feedback button (bottom-right) or open **More** → **Feedback**
- **Technical issues** → Contact the developer via links in the **About** page

---

> Last updated: May 2026 • HallsSports v1.0
