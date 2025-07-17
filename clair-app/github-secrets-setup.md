# GitHub Repository Secrets Setup

To complete the CI/CD deployment, you need to add the following secrets to your GitHub repository:

## Required Secrets

Go to your GitHub repository: `https://github.com/yanimeziani/irielle`

1. Navigate to **Settings** > **Secrets and variables** > **Actions**
2. Click **"New repository secret"** and add the following:

### MONGODB_URI
- **Name:** `MONGODB_URI`
- **Value:** Your MongoDB connection string
- **Example:** `mongodb://localhost:27017/irielle-production`
- **For MongoDB Atlas:** `mongodb+srv://username:password@cluster.mongodb.net/irielle?retryWrites=true&w=majority`

### NEXTAUTH_SECRET
- **Name:** `NEXTAUTH_SECRET`
- **Value:** A random 32-character string for JWT encryption
- **Generate one:** Run `openssl rand -base64 32` or use an online generator
- **Example:** `your-32-character-secret-key-here`

### NEXTAUTH_URL
- **Name:** `NEXTAUTH_URL` 
- **Value:** The production URL of your application
- **Example:** `http://89.116.170.202:3000`
- **With domain:** `https://your-domain.com`

## Quick Setup Commands

If you have GitHub CLI installed:

```bash
# Set MONGODB_URI (replace with your actual connection string)
gh secret set MONGODB_URI --body "mongodb://localhost:27017/irielle-production"

# Generate and set NEXTAUTH_SECRET
gh secret set NEXTAUTH_SECRET --body "$(openssl rand -base64 32)"

# Set NEXTAUTH_URL  
gh secret set NEXTAUTH_URL --body "http://89.116.170.202:3000"
```

## Production Database Setup

If you don't have a MongoDB database yet, you have these options:

### Option 1: MongoDB Atlas (Cloud - Recommended)
1. Go to https://cloud.mongodb.com
2. Create a free account and cluster
3. Get your connection string
4. Use it as your `MONGODB_URI`

### Option 2: Local MongoDB on Server
1. Install MongoDB on your VPS:
```bash
# On your server (89.116.170.202)
sudo apt update
sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Connection string would be:
# mongodb://localhost:27017/irielle-production
```

### Option 3: MongoDB Docker Container
```bash
# On your server
docker run -d \
  --name mongodb \
  --restart unless-stopped \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest

# Connection string would be:
# mongodb://localhost:27017/irielle-production
```

## Verification

After adding the secrets:
1. Go to your repository's **Actions** tab
2. You should see the workflow running automatically
3. The deployment should complete successfully
4. Your app will be available at http://89.116.170.202:3000

## Troubleshooting

- **Build fails:** Check that all three secrets are set correctly
- **App won't start:** Verify MongoDB is running and accessible
- **Connection issues:** Check firewall settings and MongoDB bind address

The CI/CD pipeline will automatically deploy on every push to the main branch once these secrets are configured.