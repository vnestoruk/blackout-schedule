# 🚀 Setup Guide for "Blackout Schedule"

## Step 1: Install Dependencies

```bash
npm install
```

This will install:

- Vue 3
- Vite
- Vite PWA Plugin
- Lucide Icons (professional SVG icons)

## Step 2: Create PWA Icons

You need to create two icon files in the `public/` directory:

### Option A: Use an online generator (Easiest)

1. Go to [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)
2. Upload a 512x512 image of a light bulb or electrical theme
3. Download the generated icons
4. Copy `pwa-192x192.png` and `pwa-512x512.png` to the `public/` folder

### Option B: Create manually

Create two PNG files with these specifications:

- `public/pwa-192x192.png` - 192x192 pixels
- `public/pwa-512x512.png` - 512x512 pixels

**Quick tip**: Use Canva, Figma, or Photoshop with a lightning bolt ⚡ or light bulb 💡 icon on a colored background.

### Option C: Use placeholders for testing

For quick testing, you can use any image and resize it:

```bash
# If you have ImageMagick installed
convert -size 192x192 xc:#FFD700 -gravity center -pointsize 100 -annotate +0+0 "⚡" public/pwa-192x192.png
convert -size 512x512 xc:#FFD700 -gravity center -pointsize 300 -annotate +0+0 "⚡" public/pwa-512x512.png
```

## Step 3: Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Step 4: Test the App

1. **Check current status**: The background should be green (ON) or red (OFF)
2. **Change queue**: Try different queues (1.1, 2.1, etc.)
3. **Enable notifications**: Click "Yes" when prompted
4. **Test PWA install**:
   - Chrome: Look for install icon in address bar
   - Mobile: Use "Add to Home Screen"

## Step 5: Build for Production

```bash
npm run build
```

The `dist/` folder will contain your production-ready app.

## Step 6: Deploy

### Deploy to Vercel (Recommended)

1. Push your code to GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/blackout-schedule.git
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Vite settings
6. Click "Deploy"

**Done!** Your app will be live at `https://blackout-schedule.vercel.app`

### Deploy to Netlify

1. Build the project: `npm run build`
2. Drag the `dist` folder to [netlify.com/drop](https://app.netlify.com/drop)
3. Done!

## Troubleshooting

### Icons not showing?

Make sure the PNG files exist:

```bash
ls -lh public/pwa-*.png
```

### API not loading?

Check your browser console (F12) for CORS errors. The API should be accessible from your domain.

### Notifications not working?

1. Check browser permissions (click the lock icon in address bar)
2. Make sure you clicked "Allow" on the notification prompt
3. Some browsers require HTTPS for notifications to work

### Background color not changing?

1. Check if the API is returning data
2. Verify the current time is within a blackout period
3. Open browser console and check for errors

## Environment Variables (Optional)

If you want to use different API endpoints for dev/prod, create:

`.env.development`

```
VITE_API_URL=http://localhost:3000
```

`.env.production`

```
VITE_API_URL=https://be-svitlo.oe.if.ua
```

Then update `src/utils/api.js`:

```javascript
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://be-svitlo.oe.if.ua";
```

## Testing PWA Features

### Test Service Worker

1. Build the app: `npm run build`
2. Preview: `npm run preview`
3. Open DevTools → Application → Service Workers
4. You should see the service worker registered

### Test Offline Mode

1. Open the app
2. Open DevTools → Network
3. Check "Offline"
4. Refresh the page
5. The app should still work!

### Test Install Prompt

1. Open the app in Chrome/Edge
2. Look for the install icon (⊕) in the address bar
3. Click it to install

## Need Help?

- Check the [README.md](README.md) for more info
- Open an issue on GitHub
- The app uses standard Vue 3 + Vite patterns

---

💙💛 Слава Україні!
