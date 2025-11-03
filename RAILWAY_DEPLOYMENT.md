# Railway Deployment Guide for Kimkles Cravings

## Prerequisites

- Railway account (https://railway.app)
- GitHub repository with your code
- All API credentials ready

---

## Step 1: Push Your Code to GitHub

If you haven't already:

```bash
cd "Final API/kimkles_api"
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

---

## Step 2: Create Railway Project

1. Go to https://railway.app
2. Sign up/Login with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your repository

---

## Step 3: Configure Service Settings

### Root Directory
In Railway service settings:
- Set **Root Directory** to: `kimkles_api` (or the subdirectory path where your `package.json` is)

### Build Command
```bash
npm install && npm run build && cd server && npm install
```

### Start Command
```bash
cd server && npm start
```

---

## Step 4: Set Environment Variables

Go to **Variables** tab in Railway and add ALL these:

```
NODE_ENV=production
NOTIFICATIONAPI_CLIENT_ID=fcosc1jem7luu64b3xq1kphbtm
NOTIFICATIONAPI_CLIENT_SECRET=maxxgmjju846rib00umnessrqs75541iee4r8jlufb2n406zbm304t1l0m
MOVIDER_APIKEY=q_SMZMSLADAoLT79cBhbovSpfRtLfS
MOVIDER_APISECRET=2N6XNlkoVa60K_Jdss-wvoyCLfrD-W
PAYPAL_MODE=sandbox
REACT_APP_PAYPAL_SECRET=EA-lTz-0opFEvkup_GZktlRtZWFsnZghj123WOHcfRlmHnPBtV96sXYbQ-5dTM-wEIIfh4C6zjvBwmpn
REACT_APP_PAYPAL_CLIENT_ID=AfAuvkuuUaD_Q3J59qPasHtz-0YxOe9Mtcdw3Bnmane7gggF3AJn8m_kiFJbuLo49eOdmBmVabzpolru
REACT_APP_GEOAPIFY_KEY=a22d21fe33d345db8c376958e3965e5c
```

**⚠️ IMPORTANT:** Wait for the first deployment to complete, then add:

```
REACT_APP_API_BASE=https://your-actual-domain.up.railway.app
REACT_APP_SMS_WEBHOOK_URL=https://your-actual-domain.up.railway.app/api/send-notification
```

Replace `your-actual-domain` with Railway's generated domain.

---

## Step 5: Deploy

1. Railway will automatically detect your changes
2. Click **"Deploy"** or it will auto-deploy
3. Watch the build logs for any errors
4. Once deployed, you'll get a public URL like: `https://your-app.up.railway.app`

---

## Step 6: Update Domain URLs

After you get your Railway domain:
1. Go to **Variables** tab
2. Update:
   - `REACT_APP_API_BASE` = `https://your-actual-domain.up.railway.app`
   - `REACT_APP_SMS_WEBHOOK_URL` = `https://your-actual-domain.up.railway.app/api/send-notification`
3. Click **"Redeploy"**

---

## Step 7: Test Your Deployment

1. Visit your Railway URL: `https://your-app.up.railway.app`
2. Test health check: `https://your-app.up.railway.app/health`
3. Register a test user
4. Place a test order
5. Check email/SMS notifications

---

## Troubleshooting

### Build Fails
- Check build logs in Railway
- Ensure all dependencies are in `package.json`
- Make sure `package-lock.json` is committed

### Port Errors
- Railway auto-assigns PORT environment variable
- Your code already handles this: `process.env.PORT`

### API Not Working
- Check that `REACT_APP_API_BASE` matches your Railway domain
- Verify all API credentials are correct
- Check Railway logs for errors

### Static Files Not Loading
- Ensure `npm run build` completed successfully
- Check that `/build` folder exists (it's gitignored but should be created during build)
- Verify production mode code is in `server/index.js`

### CORS Errors
- Already configured to allow all origins in production
- In development, allows localhost:3000

---

## Custom Domain (Optional)

1. In Railway, go to **Settings**
2. Click **"Generate Domain"** or **"Add Domain"**
3. Follow Railway's DNS instructions
4. Update `REACT_APP_API_BASE` and `REACT_APP_SMS_WEBHOOK_URL` with your custom domain
5. Redeploy

---

## Monitoring

Railway provides:
- Real-time logs
- Metrics dashboard
- Automatic HTTPS
- Zero-downtime deploys

---

## Next Steps

After successful deployment:
1. Test all features (login, cart, checkout, admin)
2. Verify email/SMS notifications work
3. Test PayPal integration
4. Monitor logs for any errors
5. Share your app URL with users!

---

## Support

If you encounter issues:
1. Check Railway deployment logs
2. Verify all environment variables
3. Test API endpoints individually
4. Check browser console for errors

