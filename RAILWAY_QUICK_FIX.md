# Quick Fix: Railway npm ci Error

## The Problem

Railway runs `npm ci` **automatically** before detecting `nixpacks.toml`. This causes:
- Lock file sync errors
- Missing dependency errors (like `yaml@2.8.1`)
- Build failures

## The Solution: Set Build Command Explicitly

**DO NOT rely on `nixpacks.toml` detection.** Railway runs `npm ci` first, which fails.

### Step-by-Step Fix:

1. **Go to Railway Dashboard**
   - Open your **Frontend Service**
   - Go to **Settings** tab
   - Scroll to **Build** section

2. **Set Build Command Explicitly:**
   ```
   npm install --legacy-peer-deps && CI=false npm run build
   ```

3. **Set Start Command:**
   ```
   npm run serve
   ```

4. **Save** - Railway will auto-redeploy

5. **Done!** The build should now succeed.

## Why This Works

- Setting Build Command **overrides** Railway's automatic `npm ci`
- Uses `npm install` instead, which is more forgiving
- `--legacy-peer-deps` handles peer dependency conflicts
- `CI=false` prevents ESLint warnings from failing builds

## About nixpacks.toml

Railway runs `npm ci` **BEFORE** checking `nixpacks.toml`. So:
- ❌ Don't rely on `nixpacks.toml` for preventing `npm ci`
- ✅ Always set Build Command explicitly in Railway dashboard
- ✅ `nixpacks.toml` can still be used for other configurations

## Alternative: Update Lock File

If you want to use `npm ci`, you need a perfectly synced lock file:

```bash
# On your local machine
rm package-lock.json
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
git push origin main
```

But **explicitly setting Build Command is easier and more reliable.**

---

**After setting Build Command in Railway, your build should succeed!** 🚀

