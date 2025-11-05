# Railway Deployment Guide

This guide will walk you through deploying the Kimkles API application to Railway.

## Prerequisites

- A Railway account (sign up at [railway.app](https://railway.app))
- A GitHub account (for connecting your repository)
- Your API keys and credentials ready

## Step 1: Prepare Your Repository

### 1.1 Push Your Code to GitHub

If you haven't already, push your code to a GitHub repository:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit"

# Add remote repository (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git push -u origin main
```

### 1.2 Create .env File Template

Create a `.env.example` file (or use the one provided) to document required environment variables:

```env
NODE_ENV=production
PORT=5000
SERVER_PORT=5000
NOTIFICATIONAPI_CLIENT_ID=your_notificationapi_client_id
NOTIFICATIONAPI_CLIENT_SECRET=your_notificationapi_client_secret
MOVIDER_APIKEY=your_movider_api_key
MOVIDER_APISECRET=your_movider_api_secret
REACT_APP_PAYPAL_CLIENT_ID=your_paypal_client_id
REACT_APP_API_BASE=https://your-app.railway.app
REACT_APP_GEOAPIFY_KEY=your_geoapify_api_key
```

**Note:** Don't commit your actual `.env` file - it's already in `.gitignore`.

## Step 2: Create Railway Project

### 2.1 Sign Up / Log In

1. Go to [railway.app](https://railway.app)
2. Sign up or log in with your GitHub account
3. Railway will automatically connect to your GitHub

### 2.2 Create New Project

1. Click **"New Project"** button
2. Select **"Deploy from GitHub repo"**
3. Choose your repository from the list
4. Railway will automatically detect it's a Node.js project

### 2.3 Configure Build Settings

Railway will auto-detect your project, but you may need to configure:

1. Click on your project
2. Go to **Settings** tab
3. Under **Build** settings, ensure:
   - **Build Command:** `npm run build` (builds React app)
   - **Start Command:** `npm run server` (starts the Express server)
   - **Root Directory:** `/` (root of your repository)

Alternatively, Railway can use the `railway.json` configuration file (see below).

## Step 3: Configure Environment Variables

### 3.1 Add Environment Variables

1. In your Railway project, go to the **Variables** tab
2. Click **"New Variable"** for each required variable:

**Required Variables:**

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

**Important Notes:**
- Railway automatically provides `PORT` variable, but you can set it explicitly
- `REACT_APP_API_BASE` should be set to your Railway app URL (you'll get this after first deployment)
- All `REACT_APP_*` variables are needed for the React build process

### 3.2 Get Your Railway App URL

After first deployment:
1. Go to **Settings** → **Domains**
2. Railway provides a default domain like: `your-app-name.up.railway.app`
3. Copy this URL
4. Update `REACT_APP_API_BASE` variable:
   ```
   REACT_APP_API_BASE=https://your-app-name.up.railway.app
   ```
5. Redeploy the app (Railway will auto-deploy or you can trigger manually)

## Step 4: Configure Build Process

### 4.1 Understanding the Build Process

Your app needs to:
1. Install root dependencies (`npm install`)
2. Install server dependencies (`cd server && npm install`)
3. Build React app (`npm run build`)
4. Start Express server (`npm run server`)

### 4.2 Option 1: Use railway.json (Recommended)

Railway will use the `railway.json` file if present. This file is already created in your project.

### 4.3 Option 2: Configure in Railway Dashboard

1. Go to **Settings** → **Build**
2. Set **Build Command:**
   ```bash
   npm install && cd server && npm install && cd .. && npm run build
   ```
3. Set **Start Command:**
   ```bash
   npm run server
   ```

### 4.4 Option 3: Use NPM Scripts

Add this to your root `package.json` scripts:

```json
{
  "scripts": {
    "build:all": "npm install && cd server && npm install && cd .. && npm run build",
    "start:prod": "npm run server"
  }
}
```

Then in Railway:
- **Build Command:** `npm run build:all`
- **Start Command:** `npm run start:prod`

## Step 5: Deploy

### 5.1 Automatic Deployment

Railway automatically deploys when you push to your main branch:
1. Push your code to GitHub
2. Railway detects the push
3. Automatically builds and deploys

### 5.2 Manual Deployment

1. Go to your Railway project
2. Click **"Deploy"** or **"Redeploy"**
3. Railway will build and deploy your app

### 5.3 Monitor Deployment

1. Go to **Deployments** tab
2. Watch the build logs in real-time
3. Check for any errors

## Step 6: Configure Custom Domain (Optional)

### 6.1 Add Custom Domain

1. Go to **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain name (e.g., `api.yourdomain.com`)
4. Railway will provide DNS records to add

### 6.2 Configure DNS

1. Go to your domain registrar
2. Add the DNS records provided by Railway:
   - **Type:** CNAME
   - **Name:** your subdomain (e.g., `api`)
   - **Value:** Railway-provided domain

### 6.3 Update Environment Variables

After setting up custom domain:
1. Update `REACT_APP_API_BASE` to your custom domain:
   ```
   REACT_APP_API_BASE=https://api.yourdomain.com
   ```
2. Redeploy the application

### 6.4 SSL Certificate

Railway automatically provides SSL certificates for both:
- Default Railway domains (`*.railway.app`)
- Custom domains

No additional configuration needed!

## Step 7: Verify Deployment

### 7.1 Check Application Status

1. Go to your Railway project dashboard
2. Check the **Deployments** tab for successful deployment
3. View logs in the **Logs** tab

### 7.2 Test Health Endpoint

Open your browser and visit:
```
https://your-app-name.up.railway.app/health
```

You should see:
```json
{
  "status": "ok",
  "message": "Notification API server is running"
}
```

### 7.3 Test Main Application

Visit your Railway domain:
```
https://your-app-name.up.railway.app
```

Your React application should load!

## Step 8: Monitoring and Logs

### 8.1 View Logs

1. Go to your Railway project
2. Click **"Logs"** tab
3. View real-time application logs

### 8.2 Metrics

Railway provides:
- CPU usage
- Memory usage
- Network traffic
- Request metrics

View in the **Metrics** tab

## Step 9: Update Application

### 9.1 Automatic Updates

When you push changes to your main branch:
1. Railway automatically detects the push
2. Builds the new version
3. Deploys automatically

### 9.2 Manual Updates

1. Make changes to your code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update application"
   git push origin main
   ```
3. Railway will automatically deploy

### 9.3 Update Environment Variables

1. Go to **Variables** tab
2. Edit any variable
3. Railway will automatically redeploy with new variables

## Troubleshooting

### Build Fails

**Issue:** Build command fails

**Solution:**
1. Check build logs in Railway dashboard
2. Ensure all dependencies are in `package.json`
3. Verify `npm run build` works locally
4. Check that all environment variables starting with `REACT_APP_` are set

### Application Not Starting

**Issue:** App starts but crashes

**Solution:**
1. Check application logs in Railway
2. Verify all required environment variables are set
3. Check that `PORT` variable is configured (Railway provides this automatically)
4. Ensure `NODE_ENV=production` is set

### Environment Variables Not Working

**Issue:** React app can't access environment variables

**Solution:**
1. Ensure all `REACT_APP_*` variables are set in Railway
2. **Important:** Environment variables must be set BEFORE building
3. If you add variables after build, you need to redeploy
4. Variables starting with `REACT_APP_` are embedded at build time

### 404 Errors on Routes

**Issue:** React Router routes return 404

**Solution:**
Your server already handles this! The `server/index.js` file serves the React app for all non-API routes. This should work automatically.

### API Endpoints Not Working

**Issue:** API calls fail

**Solution:**
1. Check `REACT_APP_API_BASE` is set correctly
2. Verify CORS is configured (your server allows all origins in production)
3. Check server logs for errors
4. Test `/health` endpoint first

### Build Takes Too Long

**Issue:** Build process is slow

**Solution:**
1. This is normal for React builds
2. Railway caches `node_modules` between builds
3. Consider using `.railwayignore` to exclude unnecessary files

## Advanced Configuration

### Using .railwayignore

Create a `.railwayignore` file to exclude files from deployment:

```
node_modules
.git
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
coverage
```

### Custom Build Script

You can create a custom build script:

**build.sh:**
```bash
#!/bin/bash
set -e

echo "Installing root dependencies..."
npm install

echo "Installing server dependencies..."
cd server && npm install && cd ..

echo "Building React application..."
npm run build

echo "Build complete!"
```

Then set **Build Command** to: `bash build.sh`

### Multiple Environments

Railway supports multiple environments:
1. Create separate projects for staging/production
2. Use different environment variables for each
3. Connect to different GitHub branches

## Railway Pricing

Railway offers:
- **Free tier:** $5 credit per month
- **Pay-as-you-go:** Pay only for what you use
- **Hobby plan:** $5/month for more resources

Check Railway pricing at [railway.app/pricing](https://railway.app/pricing)

## Benefits of Railway vs Digital Ocean

✅ **Simpler:** No server management
✅ **Automatic SSL:** Free SSL certificates
✅ **Auto-scaling:** Handles traffic automatically
✅ **Easy deployments:** Git-based deployments
✅ **Built-in monitoring:** Logs and metrics included
✅ **No SSH needed:** Everything through dashboard
✅ **Faster setup:** Deploy in minutes

## Security Best Practices

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Use Railway secrets** - Environment variables are encrypted
3. **Regular updates** - Keep dependencies updated
4. **Monitor logs** - Check for errors regularly
5. **Use HTTPS** - Railway provides SSL automatically

## Support

- **Railway Docs:** [docs.railway.app](https://docs.railway.app)
- **Railway Discord:** Join Railway community
- **Check logs:** Always check Railway logs first for errors

---

**Congratulations!** Your application should now be running on Railway! 🚀

For issues, check the troubleshooting section above or Railway's documentation.

