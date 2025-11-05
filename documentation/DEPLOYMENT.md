# Digital Ocean Droplet Deployment Guide

This guide will walk you through deploying the Kimkles API application to a Digital Ocean droplet.

## Prerequisites

- A Digital Ocean account
- A domain name (optional but recommended)
- Your API keys and credentials ready

## Step 1: Create a Digital Ocean Droplet

1. **Log in to Digital Ocean** and navigate to "Droplets"
2. **Click "Create Droplet"**
3. **Choose Configuration:**
   - **Image:** Ubuntu 22.04 LTS (or latest LTS)
   - **Plan:** Basic - Regular (at least 2GB RAM, 1 vCPU recommended)
   - **Datacenter:** Choose closest to your users
   - **Authentication:** SSH keys (recommended) or Password
   - **Hostname:** `kimkles-api` (or your preferred name)
4. **Click "Create Droplet"**

## Step 2: Initial Server Setup

### 2.1 Connect to Your Droplet

```bash
ssh root@YOUR_DROPLET_IP
```

Replace `YOUR_DROPLET_IP` with your actual droplet IP address.

### 2.2 Update System Packages

```bash
apt update && apt upgrade -y
```

### 2.3 Install Required Software

```bash
# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install Nginx
apt install -y nginx

# Install PM2 (Process Manager)
npm install -g pm2

# Install Git
apt install -y git

# Install build tools (for native modules)
apt install -y build-essential

# Verify installations
node --version
npm --version
nginx -v
pm2 --version
```

### 2.4 Create Application User (Recommended)

```bash
# Create a non-root user for running the application
adduser kimkles
usermod -aG sudo kimkles

# Switch to the new user
su - kimkles
```

## Step 3: Clone and Setup Your Application

### 3.1 Clone Your Repository

```bash
# Navigate to home directory
cd ~

# Clone your repository (replace with your actual repo URL)
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git kimkles-api
# OR if using SSH:
# git clone git@github.com:YOUR_USERNAME/YOUR_REPO.git kimkles-api

cd kimkles-api
```

**If you don't have a Git repository:**
- You can use SCP or SFTP to upload your files
- Or create a Git repository and push your code

### 3.2 Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 3.3 Create Environment File

```bash
# Create .env file in the root directory
nano .env
```

Add the following environment variables (replace with your actual values):

```env
# Server Configuration
NODE_ENV=production
PORT=5000
SERVER_PORT=5000

# NotificationAPI Configuration
NOTIFICATIONAPI_CLIENT_ID=your_notificationapi_client_id
NOTIFICATIONAPI_CLIENT_SECRET=your_notificationapi_client_secret

# Movider SMS Configuration
MOVIDER_APIKEY=your_movider_api_key
MOVIDER_APISECRET=your_movider_api_secret

# PayPal Configuration (for React frontend)
REACT_APP_PAYPAL_CLIENT_ID=your_paypal_client_id

# API Base URL (your domain or IP)
REACT_APP_API_BASE=http://YOUR_DOMAIN_OR_IP:5000

# Geoapify API Key (for address autocomplete)
REACT_APP_GEOAPIFY_KEY=your_geoapify_api_key
```

**Save the file:** Press `Ctrl+X`, then `Y`, then `Enter`

### 3.4 Build the React Application

```bash
npm run build
```

This creates a `build` folder with optimized production files.

## Step 4: Configure PM2 Process Manager

### 4.1 Create PM2 Ecosystem File

```bash
cd ~/kimkles-api
nano ecosystem.config.js
```

Add the following configuration:

```javascript
module.exports = {
  apps: [{
    name: 'kimkles-api',
    script: './server/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

### 4.2 Create Logs Directory

```bash
mkdir -p logs
```

### 4.3 Start Application with PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

The last command will output a command to run as root. Copy and run it:

```bash
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u kimkles --hp /home/kimkles
```

## Step 5: Configure Nginx as Reverse Proxy

### 5.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/kimkles-api
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    # Increase body size limit for file uploads
    client_max_body_size 10M;

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:5000/health;
        access_log off;
    }
}
```

Replace `YOUR_DOMAIN_OR_IP` with your actual domain or IP address.

### 5.2 Enable the Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/kimkles-api /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## Step 6: Configure Firewall

```bash
# Allow SSH (if not already configured)
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS (for SSL later)
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## Step 7: Setup SSL Certificate (Optional but Recommended)

### 7.1 Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 Obtain SSL Certificate

```bash
sudo certbot --nginx -d YOUR_DOMAIN
```

Replace `YOUR_DOMAIN` with your actual domain name.

Certbot will automatically:
- Obtain the certificate
- Configure Nginx to use HTTPS
- Set up automatic renewal

### 7.3 Update Environment Variables

If you're using HTTPS, update your `.env` file:

```env
REACT_APP_API_BASE=https://YOUR_DOMAIN
```

Then rebuild and restart:

```bash
npm run build
pm2 restart kimkles-api
```

## Step 8: Verify Deployment

1. **Check PM2 Status:**
   ```bash
   pm2 status
   pm2 logs kimkles-api
   ```

2. **Check Nginx Status:**
   ```bash
   sudo systemctl status nginx
   ```

3. **Test Application:**
   - Open your browser and visit: `http://YOUR_DOMAIN_OR_IP`
   - Or with SSL: `https://YOUR_DOMAIN`

4. **Test Health Endpoint:**
   - Visit: `http://YOUR_DOMAIN_OR_IP/health`

## Step 9: Configure Domain DNS (If Using Domain)

1. **Add A Record:**
   - Host: `@` (or `www`)
   - Points to: Your droplet IP address
   - TTL: 3600 (or default)

2. **Wait for DNS Propagation:**
   - Usually takes a few minutes to 48 hours

## Step 10: Monitoring and Maintenance

### 10.1 PM2 Commands

```bash
# View application status
pm2 status

# View logs
pm2 logs kimkles-api

# Restart application
pm2 restart kimkles-api

# Stop application
pm2 stop kimkles-api

# View monitoring
pm2 monit
```

### 10.2 Application Logs

```bash
# PM2 logs
pm2 logs kimkles-api

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### 10.3 Update Application

When you need to update your application:

```bash
cd ~/kimkles-api

# Pull latest changes (if using Git)
git pull origin main

# Install/update dependencies
npm install
cd server && npm install && cd ..

# Rebuild React app
npm run build

# Restart application
pm2 restart kimkles-api
```

## Troubleshooting

### Application Not Starting

1. **Check PM2 logs:**
   ```bash
   pm2 logs kimkles-api
   ```

2. **Check environment variables:**
   ```bash
   cat .env
   ```

3. **Test server manually:**
   ```bash
   cd ~/kimkles-api/server
   node index.js
   ```

### Nginx 502 Bad Gateway

1. **Check if application is running:**
   ```bash
   pm2 status
   ```

2. **Check if port 5000 is in use:**
   ```bash
   sudo netstat -tulpn | grep 5000
   ```

3. **Check Nginx error logs:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

### Can't Access Application

1. **Check firewall:**
   ```bash
   sudo ufw status
   ```

2. **Check Nginx configuration:**
   ```bash
   sudo nginx -t
   ```

3. **Check if Nginx is running:**
   ```bash
   sudo systemctl status nginx
   ```

### SSL Certificate Issues

1. **Check certificate status:**
   ```bash
   sudo certbot certificates
   ```

2. **Test renewal:**
   ```bash
   sudo certbot renew --dry-run
   ```

## Security Best Practices

1. **Keep system updated:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Use SSH keys instead of passwords**
3. **Regularly backup your `.env` file**
4. **Monitor application logs regularly**
5. **Set up fail2ban for SSH protection:**
   ```bash
   sudo apt install -y fail2ban
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

## Backup Strategy

1. **Backup environment file:**
   ```bash
   cp ~/kimkles-api/.env ~/kimkles-api/.env.backup
   ```

2. **Backup application code:**
   - Use Git repository
   - Or create regular backups

3. **Consider using Digital Ocean Snapshots** for full system backups

## Support

For issues or questions:
- Check PM2 logs: `pm2 logs kimkles-api`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Review this deployment guide

---

**Congratulations!** Your application should now be running on Digital Ocean! 🎉

