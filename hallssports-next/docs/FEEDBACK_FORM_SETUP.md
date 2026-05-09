# Google Forms Feedback Setup

This guide explains how to create and configure the Google Form used for feedback and bug reports in HallsSports.

## Overview

HallsSports uses a Google Form embedded in a custom glassmorphism modal. The form captures:
- Feedback Type (Bug Report, Feature Request, General Feedback, Other)
- Subject (required)
- Description (required)
- Page URL (hidden, auto-filled)
- User Contact (optional)

You must create the Google Form and obtain the **form ID** and **field entry IDs**.

---

## Step 1: Create the Google Form

1. Go to [forms.google.com](https://forms.google.com) and create a new blank form.
2. Title it **"Hallsports Feedback & Bug Report"**.
3. Add these questions in order:

   **Question 1 – Feedback Type**
   - Type: Multiple choice
   - Question: `Feedback Type`
   - Options: `Bug Report`, `Feature Request`, `General Feedback`, `Other`
   - Make this **required** (toggle "Required" ON)

   **Question 2 – Subject**
   - Type: Short answer
   - Question: `Subject`
   - Required: YES

   **Question 3 – Description**
   - Type: Paragraph
   - Question: `Description`
   - Required: YES

   **Question 4 – Page URL**
   - Type: Short answer
   - Question: `Page URL`
   - **Important**: This field is for **internal use only** – it will be pre-filled automatically and should not be visible to users. The form will still show this question; we will hide it via CSS later, or you can make it optional.
   - Required: NO (optional)

   **Question 5 – User Contact**
   - Type: Short answer
   - Question: `User Contact` (Email or WhatsApp for follow-up)
   - Required: NO (optional)

4. Click **Settings** (gear icon) → **Responses** → ensure "Collect email addresses" is OFF.

---

## Step 2: Get the Form Embed URL and Form ID

1. Click **Send** (paper plane icon) in the top right.
2. Click the **`<>` (Embed HTML)** tab.
3. Copy the **iframe `src` URL**. It looks like:
   ```
   https://docs.google.com/forms/d/e/xxxxxxxxxxxxxxxxxxxxxx/viewform?embedded=true
   ```
4. Extract the **form ID** (the long string between `/d/e/` and `/viewform`):
   - Example: `xxxxxxxxxxxxxxxxxxxxxx`
5. Set the environment variable in your `.env.local` and Vercel:
   ```env
   NEXT_PUBLIC_FEEDBACK_FORM_URL=https://docs.google.com/forms/d/e/xxxxxxxxxxxxxxxxxxxxxx/viewform?embedded=true
   ```

---

## Step 3: Get the Entry IDs for Each Field

This is the most critical step. You must get the `entry.XXXXXXXXX` IDs that Google Forms uses internally.

1. Open your form in the editor (not the embed). Click the **eye icon** (Preview) to open the live form in a new tab.
2. On the live form page, **right-click** → **View Page Source** (or press `Ctrl+U`).
3. Search (`Ctrl+F`) for `entry.`. You will see multiple `<input>` tags with `name="entry.XXXXXXXXX"`.
4. The order of these `entry` IDs in the source corresponds to the order of questions in your form.

   Example HTML snippet:
   ```html
   <input type="hidden" name="entry.1234567890" value="">
   <input type="text" name="entry.0987654321" ...>
   <textarea name="entry.1122334455" ...></textarea>
   ```

5. Map each field to its entry ID:

   | Field | Placeholder Entry ID | Your Actual Entry ID |
   |---|---|---|
   | Feedback Type | `entry.1234567890` | `entry.YOUR_ID_HERE` |
   | Subject | `entry.0987654321` | `entry.YOUR_ID_HERE` |
   | Description | `entry.1122334455` | `entry.YOUR_ID_HERE` |
   | Page URL | `entry.5544332211` | `entry.YOUR_ID_HERE` |
   | User Contact | `entry.6677889900` | `entry.YOUR_ID_HERE` |

6. Open the file `src/components/FeedbackModal.tsx` and update the `ENTRY_IDS` object with your actual IDs:

   ```ts
   const ENTRY_IDS = {
     feedbackType: "entry.YOUR_FEEDBACK_TYPE_ID",
     subject: "entry.YOUR_SUBJECT_ID",
     description: "entry.YOUR_DESCRIPTION_ID",
     pageUrl: "entry.YOUR_PAGE_URL_ID",
     userContact: "entry.YOUR_USER_CONTACT_ID",
   } as const;
   ```

---

## Step 4: (Optional) Hide the Page URL Field from Users

The "Page URL" question is auto-filled and shouldn't be visible to users. You have two options:

**Option A – Form-level hiding (simplest):**
- In the Google Form editor, click the eye icon to preview.
- Click the three-dots menu on the Page URL question → **"Go to section based on answer"** – don't set this.
- Instead, simply delete the question text and leave it blank? Google Forms doesn't allow hiding individual questions without add-ons.

**Option B – CSS Hide via iframe wrapper (used by HallsSports):**
The embedded iframe is wrapped in a custom container. You can inject CSS to hide the Page URL row when the form loads:
```css
/* Add to global.css or style tag if needed */
/* The nth-child selector depends on question order – adjust accordingly */
```
*Alternatively*, accept that the Page URL field will be visible but pre-filled and read-only. Users can ignore it.

**Recommended**: Keep the field visible but set it as "Not required" and pre-filled. The form will still work.

---

## Step 5: Test the Integration

1. Start the dev server: `npm run dev`
2. Open http://localhost:3000
3. Click the floating feedback button (bottom-right) or go to **More → Feedback**
4. Fill out the form and submit.
5. Check your Google Form's **Responses** tab – your submission should appear.
6. If nothing appears, check the browser console for errors.

### If Direct POST Fails

The component attempts to POST directly to the Google Form. If this fails (CORS issues), it falls back to showing the Google Form iframe embedded in the modal. This ensures the user can always submit feedback.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Form submits but no response recorded | Wrong entry IDs for fields | Double-check ENTRY_IDS in FeedbackModal.tsx |
| Form does nothing on submit | NEXT_PUBLIC_FEEDBACK_FORM_URL is missing or malformed | Ensure URL is the full embed URL, not just the form URL |
| Page URL field shows but is empty | `window.location.href` not passed correctly | Check browser console – the field value should be the current page URL |
| Users can see Page URL field | Google Forms always displays all questions | Accept this, or use CSS to hide the specific row if needed |
| Submission always fails with network error | no-cors mode opaque response | This is expected – the fallback iframe will show |

---

## Deploying to Vercel

Remember to set `NEXT_PUBLIC_FEEDBACK_FORM_URL` in Vercel Environment Variables (Production). The entry IDs are hardcoded in the component, so no additional secrets needed.

---

## Need Help?

Contact the maintainer or open an issue on GitHub if you encounter problems setting up the feedback form.
