# GitHub Actions Configuration

This directory contains the GitHub Actions workflows for the CLAIR Healthcare System.

## 🚀 Workflows

### 1. Deploy (`deploy.yml`)
**Triggers:** Push to `main` branch, manual dispatch

**Purpose:** Complete deployment of the CLAIR application to the production server.

**Steps:**
- **Test Phase:**
  - Install dependencies for `clair-app`
  - Run linting for the application
  - Build the application with test environment
  
- **Deploy Phase:**
  - Clean workspace and checkout fresh code
  - Set up environment variables
  - Gracefully shutdown existing services
  - Reset database with fresh demo data
  - Build and deploy Docker containers
  - Configure SSL certificates automatically
  - Verify deployment health

**Services Deployed:**
- `clair-frontend` (Port 3000)
- `ai-backend` (Port 8001)
- `mongodb` (Port 27017)
- `chromadb` (Port 8000)
- `ollama` (Port 11434)
- `nginx` (Ports 80/443)

### 2. Test (`test.yml`)
**Triggers:** Pull requests to `main` branch, manual dispatch

**Purpose:** Validate code quality and build success without deployment.

**Steps:**
- Install dependencies for the application
- Run linting and type checking
- Build the application
- Test Docker builds
- Validate docker-compose configuration

### 3. SSL Renewal (`ssl-renewal.yml`)
**Triggers:** Daily at 2:00 AM UTC, manual dispatch

**Purpose:** Automatically renew SSL certificates for `dev.meziani.org`.

**Steps:**
- Check certificate expiration
- Renew certificates if needed
- Reload nginx with new certificates

## 📁 Directory Structure Support

The workflows are designed to work with the new directory structure:

```
CLAIR/
├── clair-app/              # CLAIR healthcare application
│   ├── package.json
│   ├── package-lock.json
│   └── ...
├── docker-compose.yml      # Complete system orchestration
└── .github/workflows/      # This directory
```

## 🔧 Configuration

### Environment Variables
The workflows use the following environment variables:

- `NODE_VERSION`: Node.js version (default: 18)
- `NEXTAUTH_SECRET`: Required secret for NextAuth.js
- `MONGODB_URI`: Database connection string
- `AI_BACKEND_URL`: AI backend service URL

### Secrets Required
Set these in your GitHub repository settings:

- `NEXTAUTH_SECRET`: NextAuth.js secret key

### Self-Hosted Runner
The deployment workflow requires a self-hosted runner with:
- Docker and Docker Compose installed
- Access to the production server
- Proper firewall configuration for ports 80, 443, 3000, 3001

## 🚀 Access URLs After Deployment

### Production URLs:
- **CLAIR Healthcare:** `https://dev.meziani.org`

### Fallback URLs:
- **CLAIR Healthcare:** `http://89.116.170.202:3000`

### Development URLs:
- **CLAIR:** `http://localhost:3000`

## 📋 Default Credentials

After deployment, the system includes fresh demo data:

- **Admin PIN:** 1234
- **Staff PIN:** 5678
- **MongoDB:** admin/securepassword

## 🔍 Troubleshooting

### Common Issues:

1. **Dependencies not found:**
   - Ensure `package-lock.json` exists in `clair-app/`
   - Clear npm cache: `npm cache clean --force`

2. **Docker build failures:**
   - Check Docker daemon is running
   - Ensure sufficient disk space
   - Verify Dockerfile syntax

3. **SSL certificate issues:**
   - Verify domain DNS points to server
   - Check firewall allows ports 80/443
   - Run SSL workflow manually

4. **Database connection errors:**
   - Ensure MongoDB container is running
   - Check database credentials
   - Verify network connectivity

### Logs and Debugging:

- **View workflow logs:** GitHub Actions tab in repository
- **Check deployment status:** `docker-compose ps`
- **View service logs:** `docker-compose logs [service-name]`

## 🔄 Manual Workflow Triggers

All workflows can be triggered manually:

1. Go to the **Actions** tab in your repository
2. Select the workflow you want to run
3. Click **Run workflow**
4. Choose the branch and click **Run workflow**

## 📝 Maintenance

### Regular Tasks:
- Monitor SSL certificate expiration
- Update Node.js version in workflows
- Review and update dependencies
- Test deployment in staging environment

### Updates:
When updating the workflows:
1. Test changes in a pull request first
2. Use the test workflow to validate builds
3. Monitor deployment logs for any issues
4. Update this documentation if needed

## 🛠️ Development Guidelines

### Adding New Services:
1. Update `docker-compose.yml`
2. Add build steps to `deploy.yml`
3. Add health checks to deployment verification
4. Update nginx configuration if needed

### Modifying Workflows:
1. Test changes locally with `act` or similar tools
2. Create pull request to trigger test workflow
3. Review logs and fix any issues
4. Merge only after successful testing

## 🔐 Security Notes

- Never commit secrets to the repository
- Use GitHub Secrets for sensitive data
- Regularly rotate passwords and keys
- Monitor workflow logs for security issues
- Keep dependencies updated