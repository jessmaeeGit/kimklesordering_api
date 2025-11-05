# Railway Separate Services Setup Guide

This guide explains how to deploy your application as **two separate services** on Railway:
1. **API Server** - Express backend (handles `/api/*` endpoints)
2. **Frontend** - React application (served as static files)

## 📁 File Structure

After setup, your repository will have:

```
kimkles_api/
├── nixpacks.toml          # For frontend service
├── server/
│   ├── nixpacks.toml      # For API server service
│   ├── index.js          # API server (updated - no React serving)
│   └── package.json
├── src/                   # React app
├── package.json
└── ...
```

## 🚀 Railway Setup Steps

### Step 1: Create API Server Service

1. **Go to Railway Dashboard** → Create New Project
2. **Add Service** → "Deploy from GitHub repo"
3. **Select your repository**
4. **Configure Service Settings:**
   - **Service Name:** `kimkles-api-server` (or your preferred name)
   - **Root Directory:** `/server`
   - **Build Command:** (leave empty - handled by `server/nixpacks.toml`)
   - **Start Command:** (leave empty - handled by `server/nixpacks.toml`)

5. **Add Environment Variables:**
   ```
   NODE_ENV=production
   PORT=5000
   SERVER_PORT=5000
   NOTIFICATIONAPI_CLIENT_ID=your_notificationapi_client_id
   NOTIFICATIONAPI_CLIENT_SECRET=your_notificationapi_client_secret
   MOVIDER_APIKEY=your_movider_api_key
   MOVIDER_APISECRET=your_movider_api_secret
   FRONTEND_URL=https://your-frontend-service.railway.app
   ```
   **Note:** You'll update `FRONTEND_URL` after creating the frontend service.

6. **Get API Service URL:**
   - Go to **Settings** → **Domains**
   - Copy your Railway URL (e.g., `https://api-kimkles.up.railway.app`)
   - Save this URL - you'll need it for the frontend service

### Step 2: Create Frontend Service

1. **In the same Railway project**, click **"New Service"**
2. **"Deploy from GitHub repo"** → Select the same repository
3. **Configure Service Settings:**
   - **Service Name:** `kimkles-frontend` (or your preferred name)
   - **Root Directory:** `/` (root of repository)
   - **Build Command:** `npm install --legacy-peer-deps && CI=false npm run build`
   - **Start Command:** `npm run serve`
   
   **⚠️ CRITICAL - READ THIS:**
   - **MUST set Build Command explicitly** in Railway dashboard
   - Railway runs `npm ci` AUTOMATICALLY before detecting `nixpacks.toml`
   - This causes lock file sync errors (like missing `yaml@2.8.1`)
   - Setting Build Command explicitly overrides `npm ci` and uses `npm install` instead
   - **DO NOT rely on `nixpacks.toml`** - it's detected AFTER `npm ci` runs
   
   **See [RAILWAY_QUICK_FIX.md](RAILWAY_QUICK_FIX.md) for detailed fix instructions.**

4. **Add Environment Variables:**
   ```
   NODE_ENV=production
   REACT_APP_API_BASE=https://your-api-service.railway.app
   REACT_APP_PAYPAL_CLIENT_ID=your_paypal_client_id
   REACT_APP_GEOAPIFY_KEY=your_geoapify_api_key
   ```
   **Important:** Replace `https://your-api-service.railway.app` with the actual API service URL from Step 1.

5. **Get Frontend Service URL:**
   - Go to **Settings** → **Domains**
   - Copy your Railway URL (e.g., `https://frontend-kimkles.up.railway.app`)

### Step 3: Update CORS Configuration

1. **Go back to API Server Service**
2. **Update `FRONTEND_URL` environment variable:**
   ```
   FRONTEND_URL=https://your-frontend-service.railway.app
   ```
   Replace with your actual frontend service URL from Step 2.

3. **Redeploy API Service** (Railway will auto-redeploy when you update variables)

## 🔧 Configuration Files

### `server/nixpacks.toml` (API Server)
```toml
[phases.install]
cmds = ["npm install --legacy-peer-deps"]

[phases.build]
cmds = []  # No build needed for API server

[start]
cmd = "npm start"
```

### `nixpacks.toml` (Frontend)
```toml
[phases.install]
cmds = ["npm install --legacy-peer-deps"]

[phases.build]
cmds = ["CI=false npm run build"]

[start]
cmd = "npx serve -s build -l $PORT"
```

## 📝 Environment Variables Summary

### API Server Service Variables:
- `NODE_ENV=production`
- `PORT=5000` (Railway auto-provides this)
- `SERVER_PORT=5000`
- `NOTIFICATIONAPI_CLIENT_ID`
- `NOTIFICATIONAPI_CLIENT_SECRET`
- `MOVIDER_APIKEY`
- `MOVIDER_APISECRET`
- `FRONTEND_URL` (your frontend service URL)

### Frontend Service Variables:
- `NODE_ENV=production`
- `REACT_APP_API_BASE` (your API service URL)
- `REACT_APP_PAYPAL_CLIENT_ID`
- `REACT_APP_GEOAPIFY_KEY`

## ✅ Verification

1. **Test API Server:**
   - Visit: `https://your-api-service.railway.app/health`
   - Should return: `{"status":"ok","message":"Notification API server is running",...}`

2. **Test Frontend:**
   - Visit: `https://your-frontend-service.railway.app`
   - Should load your React application

3. **Test API Connection:**
   - Open browser console on frontend
   - Check that API calls are going to your API service URL
   - No CORS errors should appear

## 🔄 Updating Services

### Update API Server:
- Make changes to `server/` directory
- Push to GitHub
- API service will auto-deploy

### Update Frontend:
- Make changes to `src/` directory
- Push to GitHub
- Frontend service will auto-deploy

### Update Environment Variables:
- Go to service → **Variables** tab
- Edit variables
- Service will auto-redeploy

## 🎯 Benefits of Separate Services

✅ **Independent Scaling** - Scale API and frontend separately
✅ **Independent Deployments** - Deploy one without affecting the other
✅ **Better Resource Allocation** - Optimize resources per service
✅ **Easier Debugging** - Separate logs and monitoring
✅ **Cost Optimization** - Pay only for what each service needs

## 🆘 Troubleshooting

### CORS Errors
- **Issue:** Frontend can't call API
- **Solution:** 
  1. Check `FRONTEND_URL` in API service matches frontend URL exactly
  2. Check `REACT_APP_API_BASE` in frontend matches API URL exactly
  3. Verify both services are deployed and running

### API Not Found
- **Issue:** Frontend gets 404 on API calls
- **Solution:**
  1. Check `REACT_APP_API_BASE` is set correctly
  2. Ensure API endpoints start with `/api/`
  3. Check API service is running and healthy

### Build Failures
- **API Server:** Check `server/nixpacks.toml` is correct
- **Frontend:** Check root `nixpacks.toml` is correct
- **Both:** Check logs in Railway dashboard

### Frontend Build/Start Commands Not Working
- **Issue:** Railway not detecting `nixpacks.toml` or commands not executing
- **Solution:**
  1. **Explicitly set in Railway Dashboard:**
     - Go to Frontend Service → **Settings** → **Build**
     - Set **Build Command:** `npm install --legacy-peer-deps && CI=false npm run build`
     - Set **Start Command:** `npm run serve`
  2. **Verify `nixpacks.toml` is in root:**
     - File should be at: `/nixpacks.toml` (root of repository)
     - Not in a subdirectory
  3. **Check `package.json` has serve script:**
     ```json
     "scripts": {
       "serve": "serve -s build -l $PORT"
     }
     ```
  4. **Verify `serve` is installed:**
     - Check `devDependencies` includes `"serve": "^14.2.0"`
     - Or install globally in build phase

### npm ci Error - Package Lock File Out of Sync
- **Issue:** `npm ci` fails with "package.json and package-lock.json are not in sync" or "Missing: yaml@2.8.1 from lock file"
- **Solution (RECOMMENDED):**
  1. **Bypass npm ci in Railway Dashboard:**
     - Go to Frontend Service → **Settings** → **Build**
     - Set **Build Command:** `npm install --legacy-peer-deps && CI=false npm run build`
     - Set **Start Command:** `npm run serve`
     - Save and redeploy
     - This uses `npm install` instead of `npm ci`, avoiding sync issues
  2. **Alternative - Update package-lock.json:**
     ```bash
     rm package-lock.json
     npm install
     git add package-lock.json
     git commit -m "Update package-lock.json"
     git push origin main
     ```
  3. **Verify all dependencies are in package.json:**
     - Make sure `serve` is in `devDependencies`
     - Run `npm install` locally to ensure lock file is updated

**Note:** Railway runs `npm ci` automatically before detecting `nixpacks.toml`. Setting Build Command explicitly prevents this.

### Environment Variables Not Working
- **Frontend:** `REACT_APP_*` variables must be set BEFORE build
- **API:** Variables take effect immediately on restart
- **Solution:** Redeploy after adding/updating variables

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Nixpacks Documentation](https://nixpacks.com)
- Check Railway logs for detailed error messages

---

**Your application is now running as separate services on Railway!** 🚀

