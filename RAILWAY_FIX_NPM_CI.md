# Fix: Railway npm ci Error

## Problem

Railway/Nixpacks is failing with:
```
npm error `npm ci` can only install packages when your package.json and package-lock.json are in sync.
npm error Missing: yaml@2.8.1 from lock file
```

## Solution

### Option 1: Regenerate package-lock.json (Recommended)

1. **Delete existing lock file:**
   ```bash
   rm package-lock.json
   ```

2. **Regenerate lock file:**
   ```bash
   npm install
   ```

3. **Commit and push:**
   ```bash
   git add package-lock.json
   git commit -m "Update package-lock.json"
   git push origin main
   ```

4. **Railway will auto-deploy** with the updated lock file

### Option 2: Use nixpacks.toml (Already Created)

A `nixpacks.toml` file has been created to control the build process and avoid `npm ci` issues.

**The file uses:**
- `npm install` instead of `npm ci`
- `--legacy-peer-deps` flag for compatibility

**To use it:**
1. Make sure `nixpacks.toml` is committed:
   ```bash
   git add nixpacks.toml
   git commit -m "Add nixpacks.toml configuration"
   git push origin main
   ```

2. Railway will automatically use `nixpacks.toml` if present

### Option 3: Update Railway Build Settings

In Railway dashboard:
1. Go to **Settings** → **Build**
2. Set **Build Command** to:
   ```bash
   npm install && cd server && npm install && cd .. && npm run build
   ```
3. This bypasses `npm ci` and uses `npm install` directly

## Why This Happens

- `npm ci` requires exact sync between `package.json` and `package-lock.json`
- A dependency (like `yaml@2.8.1`) was added but not reflected in the lock file
- Railway/Nixpacks runs `npm ci` by default before your build command

## Prevention

1. **Always commit `package-lock.json`** after installing packages
2. **Run `npm install`** locally before pushing to ensure sync
3. **Use `nixpacks.toml`** to control the build process explicitly

## Quick Fix Steps

```bash
# 1. Regenerate lock file
rm package-lock.json
npm install

# 2. Commit changes
git add package-lock.json nixpacks.toml
git commit -m "Fix npm ci sync issue"
git push origin main

# 3. Railway will auto-deploy
```

---

**After applying the fix, Railway should build successfully!** 🚀

