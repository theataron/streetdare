# STREETDARE

The website behind the STREETDARE shirts.

## How it works
- `index.html` is the home page (home, The Wall, About, Join the club).
- `p/index.html` is the page a shirt's QR code opens. It picks the language from the phone (EN | ES toggle in the corner) and goes straight to the dare deck.
- `stage/` is a hidden preview of the site as if the shirts were on sale (shop, Shirtless Pass, squad pack prices, referral discount). Nothing links to it and it's marked noindex. Open `streetdare.com/stage/`. Prices and checkout links live in `js/stage.js`; the shop in `js/shop.js`.
- Dare ideas people submit ("Got a better dare?") land in the Sheet's **Events** tab with type `dare_idea` (stage: `dare_idea_stage`).
- Each shirt's QR code points to `streetdare.com/p/?s=<id>`. Shirts are listed in `js/shirts.js` (Aron's is `?s=aron`).

## Files you may want to edit
- `js/text.js` - every word on the site (English and Spanish).
- `js/quests.js` - the dare decks.
- `js/common.js` - `API_URL`, which connects the site to the Google Sheet.
- `css/style.css` - colours and look.
- `VISION.md` - vision and mission statement.
- `backend/` - the Google Sheet connection. Follow `backend/SETUP.md`.

## Publishing (GitHub Pages)
Repo → Settings → Pages → Source: "Deploy from a branch" → `main` / root.
