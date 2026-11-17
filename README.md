# STREETDARE

The website behind the STREETDARE shirts.

## How it works
- `index.html` is the home page (home, The Wall, About, Join the club).
- `p/index.html` is the page a shirt's QR code opens. It picks the language from the phone (EN | ES toggle in the corner) and goes straight to the dare deck.
- `stage/` is a hidden preview of the site as if the shirts were on sale (shop, Shirtless Pass, squad pack prices, referral discount). Nothing links to it and it's marked noindex. Open `streetdare.com/stage/`. Prices and checkout links live in `js/stage.js`; the shop in `js/shop.js`.
- Dare ideas people submit ("Got a better dare?") land in the Sheet's **Events** tab with type `dare_idea` (stage: `dare_idea_stage`).
- Each shirt's QR code points to `streetdare.com/p/?s=<id>`. Shirts are listed in `js/shirts.js` (Aron's is `?s=aron`).

## Database and admin board (Supabase)
- `streetdare.com/admin/` is the admin board: log in with a magic link, then edit decks and dares, add shirts, and watch scans and dares live.
- Decks, dares and shirts live in the Supabase database (project `jlnsqerwiwmbqpzzcskf`, Frankfurt). The scan page loads them from there and falls back to `js/quests.js` and `js/shirts.js` if the database can't be reached, so keep those files roughly in sync.
- Every scan, spin, accepted and completed dare is saved in the `play_events` table (and still in the Google Sheet for now). The waitlist and emails still run on the Sheet.
- `streetdare.com/login/` is the login for everyone (6-digit email code; "Continue with Google" appears automatically once the Google provider is switched on in Supabase). `streetdare.com/me/` is a shirt owner's dashboard: claim a shirt with its code (DARE-XXXXXX, shown in the admin Shirts tab), live scans, own dares (max 10), decks, name and Instagram on the shirt, delete account.
- The login email template is in `backend/emails/login-code.html`. Paste it into Supabase → Authentication → Emails → Templates, for both "Magic link" and "Confirm sign up".
- `.github/workflows/keep-alive.yml` pings the database every 3 days so the free plan never pauses it.

## Files you may want to edit
- `js/text.js` - every word on the site (English and Spanish).
- `js/quests.js` - the dare decks.
- `js/common.js` - `API_URL`, which connects the site to the Google Sheet.
- `css/style.css` - colours and look.
- `VISION.md` - vision and mission statement.
- `backend/` - the Google Sheet connection. Follow `backend/SETUP.md`.

## Publishing (GitHub Pages)
Repo → Settings → Pages → Source: "Deploy from a branch" → `main` / root.
