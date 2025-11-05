# Fix: npm ci Error in Railway Frontend Service

## Problem

Railway frontend service fails with:
```
npm error `npm ci` can only install packages when your package.json and package-lock.json are in sync.
npm error Missing: yaml@2.8.1 from lock file
```

## Root Cause

Railway automatically runs `npm ci` **before** detecting `nixpacks.toml`. This causes issues when:
- Dependencies are added but lock file isn't updated
- Lock file is out of sync with `package.json`

## Solution: Explicitly Set Build Command

### Step 1: Go to Railway Dashboard

1. Open your **Frontend Service** in Railway
2. Go to **Settings** tab
3. Scroll to **Build** section

### Step 2: Set Build Command Explicitly

**Set Build Command to:**
```bash
npm install --legacy-peer-deps && CI=false npm run build
```

**Set Start Command to:**
```bash
npm run serve
```

### Step 3: Save and Redeploy

1. Click **Save** or the changes will auto-save
2. Railway will automatically redeploy with the new settings
3. The build should now succeed

## Why This Works

- Setting Build Command explicitly **overrides** Railway's automatic `npm ci`
- Uses `npm install` instead, which is more forgiving with lock file sync
- `--legacy-peer-deps` handles peer dependency conflicts
- `CI=false` prevents ESLint warnings from failing the build

## Alternative: Update Lock File (If Needed)

If you still want to use `npm ci`, ensure lock file is synced:

```bash
# On your local machine
rm package-lock.json
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
git push origin main
```

Then Railway's `npm ci` should work.

## Recommendation

**Always set Build Command explicitly** in Railway dashboard for frontend service to avoid these issues.

---

**After setting the Build Command, your frontend service should build successfully!** 🚀

