#!/bin/bash

# Ollama Model Initialization Script
# This script ensures required models are available and only downloads if needed

echo "🤖 Initializing Ollama models..."

# Wait for Ollama service to be ready
echo "⏳ Waiting for Ollama service to be ready..."
until curl -s http://localhost:11434/api/version > /dev/null 2>&1; do
    echo "Waiting for Ollama service..."
    sleep 5
done

echo "✅ Ollama service is ready!"

# Check if gemma2:2b model exists
if ollama list | grep -q "gemma2:2b"; then
    echo "✅ gemma2:2b model already exists, skipping download"
else
    echo "📥 Downloading gemma2:2b model..."
    ollama pull gemma2:2b
    echo "✅ gemma2:2b model downloaded successfully"
fi

# Check if mxbai-embed-large model exists (for embeddings)
if ollama list | grep -q "mxbai-embed-large"; then
    echo "✅ mxbai-embed-large model already exists, skipping download"
else
    echo "📥 Downloading mxbai-embed-large model..."
    ollama pull mxbai-embed-large
    echo "✅ mxbai-embed-large model downloaded successfully"
fi

echo "🎉 All required models are ready!"