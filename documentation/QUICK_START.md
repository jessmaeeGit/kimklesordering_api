# Quick Start Guide - Digital Ocean Deployment

This is a condensed version of the deployment guide for quick reference.

## Prerequisites Checklist

- [ ] Digital Ocean account created
- [ ] Droplet created (Ubuntu 22.04 LTS, 2GB+ RAM recommended)
- [ ] Domain name configured (optional)
- [ ] All API keys and credentials ready:
  - [ ] NotificationAPI credentials
  - [ ] Movider API credentials
  - [ ] PayPal Client ID
  - [ ] Geoapify API key

## Quick Deployment Steps

### 1. Connect to Droplet
```bash
ssh root@YOUR_DROPLET_IP
```

### 2. Install Dependencies
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install Nginx and PM2
apt install -y nginx git build-essential
npm install -g pm2
```

### 3. Setup Application User
```bash
adduser kimkles
usermod -aG sudo kimkles
su - kimkles
```

### 4. Clone and Setup Application
```bash
cd ~
git clone YOUR_REPO_URL kimkles-api
cd kimkles-api
npm install
cd server && npm install && cd ..
```

### 5. Configure Environment
```bash
# Copy example file
cp .env.example .env

# Edit with your values
nano .env
```

**Required .env variables:**
- `NODE_ENV=production`
- `PORT=5000`
- `NOTIFICATIONAPI_CLIENT_ID`
- `NOTIFICATIONAPI_CLIENT_SECRET`
- `MOVIDER_APIKEY`
- `MOVIDER_APISECRET`
- `REACT_APP_PAYPAL_CLIENT_ID`
- `REACT_APP_API_BASE` (your domain/IP)
- `REACT_APP_GEOAPIFY_KEY`

### 6. Build and Deploy
```bash
# Build React app
npm run build

# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 7. Configure Nginx
```bash
# Create config file
sudo nano /etc/nginx/sites-available/kimkles-api
```

**Paste Nginx config (see DEPLOYMENT.md or nginx.conf.example)**

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/kimkles-api /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 8. Configure Firewall
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 9. Setup SSL (Optional but Recommended)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d YOUR_DOMAIN
```

## Common Commands

### PM2 Management
```bash
pm2 status              # Check status
pm2 logs kimkles-api    # View logs
pm2 restart kimkles-api # Restart app
pm2 monit               # Monitor
```

### Update Application
```bash
cd ~/kimkles-api
git pull origin main
npm install
cd server && npm install && cd ..
npm run build
pm2 restart kimkles-api
```

### Check Logs
```bash
# Application logs
pm2 logs kimkles-api

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

## Troubleshooting

**502 Bad Gateway?**
- Check if app is running: `pm2 status`
- Check logs: `pm2 logs kimkles-api`

**Can't access site?**
- Check firewall: `sudo ufw status`
- Check Nginx: `sudo systemctl status nginx`

**Application errors?**
- Check .env file: `cat .env`
- Test server manually: `cd server && node index.js`

## Need Full Details?

See `DEPLOYMENT.md` for complete step-by-step instructions with explanations.

