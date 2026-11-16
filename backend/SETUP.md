# Connecting the site to a Google Sheet (about 5 minutes)

Until this is done the site runs in demo mode: emails are not saved and wall messages stay on the visitor's phone.

1. Create a new Google Sheet (for example inside the Drive folder "03 Data") and name it "STREETDARE data".
2. In the Sheet: Extensions → Apps Script.
3. Delete whatever is in the editor, paste everything from `Code.gs`, and save.
4. Click Deploy → New deployment → type "Web app".
   - Execute as: Me
   - Who has access: Anyone
5. Click Deploy, approve the permissions, and copy the Web app URL (it ends in `/exec`).
6. Open `js/common.js` and paste the URL between the quotes after `API_URL:`.
7. Publish the change. The "Demo mode" notes on the site disappear.

The Sheet then fills three tabs: Waitlist (emails), Wall (messages - type anything in the "hidden" column to remove one from the site) and Events (scans, spins, accepted and completed quests per shirt).

## Turning on the emails (welcome + launch)

The site's code is already updated, but Google only runs the copy pasted into the Sheet, so do this once:

1. Open the Sheet → Extensions → Apps Script. Replace everything in the editor with the new `Code.gs` and save.
2. In the function dropdown at the top pick `testWelcome` and click Run. Google asks for permission to send email as you: approve it. You get the welcome email in your own inbox.
3. Deploy → Manage deployments → pencil icon → Version: "New version" → Deploy. The link stays the same, so nothing changes on the site.

From then on every new sign-up gets the welcome email (in English or Spanish, matching the site language they used). Emails are sent from the Google account that owns the Sheet, with replies going to streetdare.official@gmail.com.

On launch day: create the discount code `EARLYDARE` in your checkout (€10 off, valid one week), paste the shop link into `LAUNCH_URL` at the top of `Code.gs`, save, then run `sendLaunchEmail`. Gmail allows about 100 emails a day; with a longer list, run it again the next day and it carries on where it stopped.
