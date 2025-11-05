# Railway Quick Start Guide

This is a condensed version of the Railway deployment guide for quick reference.

## Prerequisites Checklist

- [ ] Railway account created ([railway.app](https://railway.app))
- [ ] GitHub account with your code pushed
- [ ] All API keys ready:
  - [ ] NotificationAPI credentials
  - [ ] Movider API credentials
  - [ ] PayPal Client ID
  - [ ] Geoapify API key

## Quick Deployment Steps

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### 2. Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository

### 3. Configure Environment Variables

In Railway dashboard → **Variables** tab, add:

```env
NODE_ENV=production
PORT=5000
SERVER_PORT=5000
NOTIFICATIONAPI_CLIENT_ID=your_actual_client_id
NOTIFICATIONAPI_CLIENT_SECRET=your_actual_secret
MOVIDER_APIKEY=your_actual_api_key
MOVIDER_APISECRET=your_actual_api_secret
REACT_APP_PAYPAL_CLIENT_ID=your_actual_paypal_client_id
REACT_APP_GEOAPIFY_KEY=your_actual_geoapify_key
```

**Important:** After first deployment, get your Railway URL and add:
```
REACT_APP_API_BASE=https://your-app-name.up.railway.app
```

Then redeploy.

### 4. Build Configuration

Railway will automatically use `railway.json` if present. Otherwise:

**Build Command:**
```bash
npm install && cd server && npm install && cd .. && npm run build
```

**Start Command:**
```bash
npm run server
```

### 5. Deploy

Railway auto-deploys when you push to GitHub. Or click **"Deploy"** in dashboard.

### 6. Get Your URL

1. Go to **Settings** → **Domains**
2. Copy your Railway URL (e.g., `your-app.up.railway.app`)
3. Update `REACT_APP_API_BASE` with this URL
4. Redeploy

## Common Commands

### View Logs
- Go to Railway dashboard → **Logs** tab

### Check Deployment
- Go to **Deployments** tab

### Update Environment Variables
- Go to **Variables** tab → Edit → Auto-redeploys

### Redeploy
- Go to **Deployments** → Click **"Redeploy"**

## Troubleshooting

**Build fails?**
- Check **Logs** tab for errors
- Verify all `REACT_APP_*` variables are set
- Check build command works locally

**App not starting?**
- Check application logs
- Verify `NODE_ENV=production` is set
- Check all required variables are set

**404 on routes?**
- Your server already handles this - should work automatically

**API not working?**
- Check `REACT_APP_API_BASE` is correct
- Verify Railway URL is updated in variables
- Check server logs

## Need Full Details?

See **[RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)** for complete step-by-step instructions.

## Railway Benefits

✅ No server management
✅ Automatic SSL certificates
✅ Git-based deployments
✅ Built-in monitoring
✅ Auto-scaling
✅ Free tier available

---

**Deploy in minutes!** 🚀

