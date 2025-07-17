# Server Setup Instructions

## GitHub Actions Runner Configuration

To complete the setup, you need to configure the GitHub Actions runner with your repository:

### 1. Generate Runner Token
1. Go to your GitHub repository: `https://github.com/YOUR_USERNAME/irielle-platform`
2. Navigate to Settings > Actions > Runners
3. Click "New self-hosted runner"
4. Select "Linux" and "x64"
5. Copy the token from the configuration commands

### 2. Configure the Runner on Server
Connect to your server and run:

```bash
# Switch to github-runner user
sudo su - github-runner

# Navigate to actions-runner directory
cd /actions-runner

# Configure the runner (replace YOUR_TOKEN with the actual token)
./config.sh --url https://github.com/yanimeziani/irielle --token AYQQSBJZHXCIHJMS4OXL6PTIOOX4G --name "production-server" --work _work --runnergroup default --labels production,self-hosted,linux,x64

# Exit back to root
exit

# Enable and start the service
systemctl enable github-runner
systemctl start github-runner
systemctl status github-runner
```

### 3. Setup SSH Key for Git Operations (Optional but recommended)
```bash
# Generate SSH key for github-runner user
sudo su - github-runner
ssh-keygen -t ed25519 -C "github-runner@your-server"

# Add the public key to your GitHub repository
cat ~/.ssh/id_ed25519.pub
```

Add this public key to your GitHub repository's Deploy Keys (Settings > Deploy keys).

## Environment Variables
Create environment file for your application:

```bash
# Create environment file
sudo mkdir -p /var/www/irielle-platform
sudo chown github-runner:github-runner /var/www/irielle-platform

# Create .env file (adjust values as needed)
sudo tee /var/www/irielle-platform/.env > /dev/null << EOF
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://your-server-ip:3000
EOF

sudo chown github-runner:github-runner /var/www/irielle-platform/.env
```

## Firewall Configuration
```bash
# Allow port 3000 for the application
ufw allow 3000/tcp

# Allow SSH (if not already allowed)
ufw allow 22/tcp

# Enable firewall
ufw --force enable
```

## SSL Setup (Optional)
Install and configure Nginx as a reverse proxy with SSL:

```bash
# Install Nginx
apt update && apt install -y nginx certbot python3-certbot-nginx

# Create Nginx configuration
tee /etc/nginx/sites-available/irielle-platform > /dev/null << EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site
ln -s /etc/nginx/sites-available/irielle-platform /etc/nginx/sites-enabled/
systemctl restart nginx

# Get SSL certificate (replace your-domain.com with your actual domain)
certbot --nginx -d your-domain.com
```

## Monitoring
View logs:
```bash
# GitHub runner logs
sudo journalctl -u github-runner -f

# Docker container logs
docker logs irielle-platform -f

# System logs
sudo journalctl -f
```

## Server Information
- Server IP: 89.116.170.202
- SSH User: root
- Application Port: 3000
- Docker: Installed and running
- Node.js: v20.19.3
- GitHub Runner: Ready for configuration