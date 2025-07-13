from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import ollama
import os
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Ollama client to connect to host machine
OLLAMA_HOST = os.getenv('OLLAMA_HOST', 'host.docker.internal:11434')
ollama_client = ollama.Client(host=f'http://{OLLAMA_HOST}')

app = FastAPI(
    title="Irielle AI Backend - Ollama",
    description="AI-powered text correction and summarization using Ollama with Gemma3n",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "https://dev.meziani.org"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class TextCorrection(BaseModel):
    text: str

class TextSummary(BaseModel):
    text: str
    context: Optional[str] = "healthcare"
    language: Optional[str] = "french"

@app.get("/")
async def root():
    return {
        "message": "Irielle AI Backend - Ollama",
        "status": "active",
        "model": "gemma3:4b",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    try:
        # Test Ollama connection
        models = ollama_client.list()
        return {
            "status": "healthy",
            "ollama_available": True,
            "models": [model['name'] for model in models.get('models', [])],
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "degraded",
            "ollama_available": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@app.post("/correct-text")
async def correct_text(request: TextCorrection):
    """
    Correct text using Ollama Gemma3n for grammar, spelling, and professional tone.
    """
    try:
        logger.info(f"Processing text correction request with Ollama host: {OLLAMA_HOST}")
        
        prompt = f"""Corrigez ce texte (orthographe, grammaire, style médical professionnel):

{request.text}

Texte corrigé:"""

        logger.info(f"Sending generate request to Ollama...")
        response = ollama_client.generate(
            model='gemma3:4b',
            prompt=prompt,
            options={
                'temperature': 0.3,
                'top_p': 0.9,
                'num_predict': 400
            }
        )
        logger.info("Generate request completed successfully")
        
        corrected_text = response['response'].strip()
        
        # Aggressive cleanup - remove any unwanted prefixes/suffixes
        unwanted_prefixes = [
            'voici', 'voilà', 'le texte corrigé', 'texte corrigé', 'correction',
            'voici le texte', 'voilà le texte', 'le résultat', 'résultat',
            'voici la correction', 'voilà la correction', 'après correction'
        ]
        
        # Check for unwanted prefixes and remove them
        corrected_lower = corrected_text.lower()
        for prefix in unwanted_prefixes:
            if corrected_lower.startswith(prefix):
                # Find the actual content after the prefix
                lines = corrected_text.split('\n')
                for i, line in enumerate(lines):
                    if ':' in line and any(p in line.lower() for p in unwanted_prefixes):
                        corrected_text = '\n'.join(lines[i+1:]).strip()
                        break
                else:
                    # If no colon found, just remove the prefix
                    corrected_text = corrected_text[len(prefix):].strip()
                break
        
        # Remove wrapping quotes
        if corrected_text.startswith('"') and corrected_text.endswith('"'):
            corrected_text = corrected_text[1:-1].strip()
        if corrected_text.startswith("'") and corrected_text.endswith("'"):
            corrected_text = corrected_text[1:-1].strip()
            
        # Remove any remaining colons at the start
        if corrected_text.startswith(':'):
            corrected_text = corrected_text[1:].strip()
        
        return {
            "success": True,
            "original_text": request.text,
            "corrected_text": corrected_text,
            "has_changes": corrected_text.strip() != request.text.strip(),
            "suggestions": {
                "grammar_improvements": True if corrected_text != request.text else False,
                "style_improvements": True if len(corrected_text) != len(request.text) else False
            },
            "timestamp": datetime.now().isoformat(),
            "model_used": "gemma3:4b"
        }
        
    except Exception as e:
        logger.error(f"Text correction failed: {e}")
        raise HTTPException(
            status_code=503, 
            detail="Service de correction IA temporairement indisponible"
        )

@app.post("/generate-summary")
async def generate_summary(request: TextSummary):
    """
    Generate summary using Ollama Gemma3n with healthcare context awareness.
    """
    try:
        context_prompt = ""
        if request.context == "healthcare":
            context_prompt = "dans le contexte des soins de santé et résidences DI-TSA"
        
        prompt = f"""Résumez ce texte médical en 2-3 phrases professionnelles {context_prompt}:

{request.text}

Résumé:"""

        response = ollama_client.generate(
            model='gemma3:4b',
            prompt=prompt,
            options={
                'temperature': 0.4,
                'top_p': 0.9,
                'num_predict': 250
            }
        )
        
        summary = response['response'].strip()
        
        # Aggressive cleanup for summary
        unwanted_prefixes = [
            'voici', 'voilà', 'le résumé', 'résumé', 'voici le résumé',
            'voilà le résumé', 'résumé:', 'voici un résumé', 'résultat',
            'voici la synthèse', 'synthèse', 'en résumé', 'pour résumer',
            'ce résumé', 'ce résumé est', 'le patient', 'dans le contexte'
        ]
        
        # Remove entire prefatory sentences
        unwanted_sentences = [
            'ce résumé est pertinent pour les soins de santé',
            'ce résumé est approprié pour',
            'dans le contexte des soins de santé',
            'pour les résidences di-tsa'
        ]
        
        # Clean up unwanted sentences first
        summary_lower = summary.lower()
        for sentence in unwanted_sentences:
            if sentence in summary_lower:
                # Remove the entire sentence and everything before it up to the first period
                lines = summary.split('.')
                cleaned_lines = []
                found_content = False
                for line in lines:
                    if not found_content and any(s in line.lower() for s in unwanted_sentences):
                        continue
                    if not found_content and line.strip() and not any(s in line.lower() for s in unwanted_sentences):
                        found_content = True
                    if found_content:
                        cleaned_lines.append(line)
                summary = '.'.join(cleaned_lines)
                break
        
        # Check for unwanted prefixes and remove them
        summary_lower = summary.lower()
        for prefix in unwanted_prefixes:
            if summary_lower.startswith(prefix):
                # Find the actual content after the prefix
                lines = summary.split('\n')
                for i, line in enumerate(lines):
                    if ':' in line and any(p in line.lower() for p in unwanted_prefixes):
                        summary = '\n'.join(lines[i+1:]).strip()
                        break
                else:
                    # If no colon found, just remove the prefix
                    summary = summary[len(prefix):].strip()
                break
        
        # Remove wrapping quotes
        if summary.startswith('"') and summary.endswith('"'):
            summary = summary[1:-1].strip()
        if summary.startswith("'") and summary.endswith("'"):
            summary = summary[1:-1].strip()
            
        # Remove any remaining colons at the start
        if summary.startswith(':'):
            summary = summary[1:].strip()
        
        return {
            "success": True,
            "original_text": request.text,
            "summary": summary,
            "word_count_original": len(request.text.split()),
            "word_count_summary": len(summary.split()),
            "compression_ratio": round(len(summary) / len(request.text) * 100, 1) if len(request.text) > 0 else 0,
            "context": request.context,
            "language": request.language,
            "timestamp": datetime.now().isoformat(),
            "model_used": "gemma3:4b"
        }
        
    except Exception as e:
        logger.error(f"Summary generation failed: {e}")
        raise HTTPException(
            status_code=503, 
            detail="Service de résumé IA temporairement indisponible"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )