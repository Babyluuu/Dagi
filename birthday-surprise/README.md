# Birthday Surprise 💕

A romantic, mobile-friendly birthday surprise website.

## Open it

Double-click `index.html`, or run a local server:

```bash
npx serve .
```

## Secret emails (Yes / No buttons)

When she taps **Yes** or **No** on “Can you be my girlfriend?”, you get an email at **leulfshaiye2@gmail.com** (she does not see this).

1. Go to [web3forms.com](https://web3forms.com) and create a free access key for `leulfshaiye2@gmail.com`
2. Open `config.js` and paste your key into `accessKey`

| Button | Email message |
|--------|----------------|
| Yes ❤️ | `yes i want to be yours` |
| No | `no your not my type` |

## No button image

Add your side image as `images/no-side.jpg` (shows sliding in from the right when she presses No).

## Personalize

1. **Photos** — Add these files to the `images/` folder:
   - `first-photo.jpg`
   - `favorite-moment.jpg`
   - `funny-moment.jpg`

2. **Quiz answers** — Edit `QUIZ_QUESTIONS` in `app.js` (set `correct` to the index of the right option, 0-based).

3. **Love letter** — Edit the text in `index.html` inside `.letter-paper`.

4. **Background music** — Add a file named `romantic.mp3` in the project root, then tap the 🎵 button on the site.

5. **Captions** — Update `.memory-caption` text in `index.html`.

## Story flow (cinematic)

1. **Birthday cake** — realistic cake, upright candle & flame, warm glow, auto blow-out + sparkles, zoom transition
2. **Love letter** — envelope rises from bottom → opens → fades; letter expands full-screen (no scroll), blurred backdrop
3. **Are you single?** — Yes works; No dodges slowly when cursor gets close (still fair to click)
4. **Romance cinematic** (after Yes on single):
   - Auto messages fade in/out (single… / nobody wants us… / become someone to each other)
   - Suspense pause → **Can you be my girlfriend?** (Yes ❤️ / playful No)
   - Yes → confetti, hearts, glow, **I knew it… Happy Birthday My Love** → quiz → memories → finale
5. **Replay** — full story from the cake again

## Features

- Animated cake & candle blow-out
- Envelope opening letter
- 7-question interactive quiz with sweet feedback
- Memory gallery with photo placeholders
- Final message + Replay button
- Floating hearts, starry background, soft theme
- Optional music, click sounds, confetti
