# Ollama Model Persistence

## Overview

This Docker setup ensures that Ollama models are persistent across deployments and won't be re-downloaded unnecessarily.

## Key Components

### 1. Persistent Volume
- **Volume**: `ollama_data:/root/.ollama`
- **Purpose**: Stores downloaded models permanently
- **Persistence**: Survives container restarts and deployments

### 2. Model Initialization Script
- **File**: `docker/ollama-init.sh`
- **Purpose**: Checks for existing models and only downloads if missing
- **Models**: 
  - `gemma2:2b` - Main language model for text processing
  - `mxbai-embed-large` - Embedding model for vector operations

### 3. Custom Dockerfile
- **File**: `docker/ollama-models.dockerfile`
- **Purpose**: Builds Ollama container with initialization logic
- **Features**:
  - Automatic model checking on startup
  - Smart download (only if model doesn't exist)
  - Proper healthchecks

## How It Works

1. **First Deployment**: Models are downloaded and stored in the persistent volume
2. **Subsequent Deployments**: Script checks if models exist and skips download
3. **Volume Persistence**: Models remain available across container lifecycle

## Commands

### Check Downloaded Models
```bash
docker exec irielle-ollama ollama list
```

### Manually Download Model
```bash
docker exec irielle-ollama ollama pull gemma2:2b
```

### View Logs
```bash
docker logs irielle-ollama
```

## Benefits

- ⚡ **Faster Deployments**: No re-download of large models
- 💾 **Storage Efficiency**: Models stored once, reused multiple times
- 🔄 **Automatic Management**: Smart initialization on startup
- 🛡️ **Reliability**: Healthchecks ensure service availability

## Troubleshooting

### If Models Are Missing
1. Check volume mount: `docker volume inspect irielle-platform_ollama_data`
2. Restart container: `docker restart irielle-ollama`
3. Manual download: `docker exec irielle-ollama ollama pull gemma2:2b`

### If Service Won't Start
1. Check logs: `docker logs irielle-ollama`
2. Verify healthcheck: `docker inspect irielle-ollama --format='{{.State.Health.Status}}'`
3. Test API: `curl http://localhost:11434/api/version`