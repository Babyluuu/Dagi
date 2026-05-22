# Fix: Email not working

Emails need **two things** from you. The website cannot email Gmail by itself without this.

## Step 1 — Get a free access key

1. Go to **https://web3forms.com**
2. Type your email: **leulfshaiye2@gmail.com**
3. Click **Create Access Key**
4. Open your inbox (check **Spam** too)
5. Copy the key (long code like `a1b2c3d4-e5f6-...`)

## Step 2 — Paste the key in `config.js`

Open `config.js` and replace `PASTE_YOUR_KEY_HERE` with your real key:

```javascript
accessKey: "a1b2c3d4-your-real-key-here",
```

Save the file.

## Step 3 — Run with a local server (important)

If you only **double-click** `index.html`, the browser often **blocks** sending email.

In PowerShell, in this folder:

```powershell
cd C:\Users\Leulf\Projects\birthday-surprise
npx serve .
```

Then open in Chrome/Edge:

**http://localhost:3000**

(Use the port number shown in the terminal if different.)

## Step 4 — Test

1. Open `http://localhost:3000?page=romance`
2. Wait for **Can you be my girlfriend?**
3. Tap **Yes** or **No**
4. Check **leulfshaiye2@gmail.com** (and Spam) within 1–2 minutes

| Button | Email subject | Message body |
|--------|---------------|--------------|
| Yes ❤️ | 💕 She said YES! | yes i want to be yours |
| No | She pressed NO | no your not my type |

## Still not working?

- Key pasted with **quotes**, no extra spaces
- Site opened as **http://localhost** not `file:///`
- Press **F12** → Console — look for `[Birthday]` messages
- Confirm key at https://web3forms.com (create a new one if needed)
- Web3Forms free plan: limited emails per month — enough for one birthday

She never sees any of this — only you get the emails.
