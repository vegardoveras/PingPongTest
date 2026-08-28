# Pong Challenge (PWA)

This project is a portrait, touch-first single-player Pong game with 5 levels.

## Do I need to merge to `main` before testing?

No.

Recommended flow:
1. Test on your feature branch first.
2. Publish that branch with GitHub Pages.
3. Test on iPhone.
4. Merge to `main` only when you are happy.

---

## 1) Local desktop test

From your repository root:

```bash
cd <repo-root>
node --check game.js
node --check sw.js
python3 -m http.server 8080
```

Then open:

- `http://localhost:8080`

What to verify:
- Touch/mouse paddle control works.
- Level progression works from 1 to 5.
- `Next Level`, restart, and end-game behavior are correct.

Stop server with `Ctrl + C`.

---

## 2) Publish to GitHub Pages from your branch (without merging)

1. Open your repository on GitHub.
2. Go to **Settings**.
3. In the left menu, click **Pages**.
4. Under **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: select your feature branch
   - **Folder**: `/ (root)`
5. Click **Save**.
6. Wait for GitHub Pages to deploy.
7. Copy the site URL shown on the Pages screen.

Notes:
- Deploy usually takes 1-3 minutes.
- If you push new commits, Pages redeploys automatically.

---

## 3) Install on iPhone (no jailbreak)

1. Open the GitHub Pages URL in **Safari** on iPhone.
2. Tap **Share**.
3. Tap **Add to Home Screen**.
4. Open the game from your Home Screen icon.

This runs as a standalone web app (PWA).

---

## 4) Update and retest loop

Each time you change code:
1. Commit and push your branch.
2. Wait for Pages redeploy.
3. Reopen the iPhone app and test again.

If cached content seems stale:
- Close/reopen app, or
- Remove Home Screen icon and add it again.

---

## 5) Merge strategy

Use this sequence:
1. Keep branch deployment while testing.
2. Merge PR to `main` when approved and tested.
3. (Optional, recommended) In **Settings → Pages**, switch branch source to `main` for your stable production URL.

---

## Quick checklist

- [ ] Local syntax checks pass
- [ ] Local game smoke test done
- [ ] Pages deployed from feature branch
- [ ] iPhone Home Screen install tested
- [ ] Final approval done
- [ ] PR merged to `main`
