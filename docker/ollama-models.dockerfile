# Dockerfile for Ollama with pre-downloaded models
FROM ollama/ollama:latest

# Install curl for healthchecks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy initialization script
COPY ollama-init.sh /ollama-init.sh
RUN chmod +x /ollama-init.sh

# Create a script to run ollama serve and then initialize models
RUN echo '#!/bin/bash\n\
# Start Ollama server in background\n\
ollama serve &\n\
\n\
# Wait for server to be ready then initialize models\n\
/ollama-init.sh\n\
\n\
# Keep the server running\n\
wait' > /start-ollama.sh && chmod +x /start-ollama.sh

# Set the entrypoint to our custom script
ENTRYPOINT ["/start-ollama.sh"]