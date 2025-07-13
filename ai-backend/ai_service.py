import os
import asyncio
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import httpx
from sentence_transformers import SentenceTransformer
import numpy as np

from database import get_database
from vector_store import VectorStore

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self, vector_store: VectorStore):
        self.vector_store = vector_store
        self.embedding_model = None
        self.ollama_base_url = "http://localhost:11434"
        self.model_name = "gemma3n:latest"  # Lightweight model for healthcare
        self.db = None
        self._ready = False

    async def initialize(self):
        """Initialize the AI service components."""
        try:
            logger.info("Initializing AI service...")
            
            # Initialize embedding model
            logger.info("Loading embedding model...")
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            
            # Initialize database connection
            self.db = await get_database()
            
            # Check if Ollama is available
            await self._check_ollama_health()
            
            self._ready = True
            logger.info("AI service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize AI service: {e}")
            raise

    def is_ready(self) -> bool:
        return self._ready

    async def _check_ollama_health(self):
        """Check if Ollama service is available."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.ollama_base_url}/api/tags")
                if response.status_code == 200:
                    logger.info("Ollama service is available")
                    return True
        except Exception as e:
            logger.warning(f"Ollama service not available: {e}")
        return False

    async def _call_ollama(self, prompt: str, system_prompt: str = None) -> str:
        """Call Ollama API for text generation."""
        try:
            payload = {
                "model": self.model_name,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "max_tokens": 500
                }
            }
            
            if system_prompt:
                payload["system"] = system_prompt
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.ollama_base_url}/api/generate",
                    json=payload
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result.get("response", "")
                else:
                    logger.error(f"Ollama API error: {response.status_code}")
                    return "Je suis désolé, je ne peux pas répondre pour le moment."
                    
        except Exception as e:
            logger.error(f"Error calling Ollama: {e}")
            return "Je suis désolé, je ne peux pas répondre pour le moment."

    async def process_chat_message(
        self, 
        message: str, 
        context: Optional[Dict[str, Any]] = None,
        user_id: str = None,
        patient_id: str = None
    ) -> str:
        """Process a chat message and return AI response."""
        
        system_prompt = """Tu es un assistant IA spécialisé dans les soins pour personnes ayant une déficience intellectuelle et des troubles du spectre de l'autisme (DI-TSA). 

Tu dois:
- Fournir des conseils pratiques et bienveillants
- Respecter la confidentialité et la dignité des résidents
- Donner des informations basées sur les meilleures pratiques
- Être empathique et professionnel
- Répondre en français
- Si tu n'es pas sûr d'une information médicale, recommander de consulter un professionnel

Tu NE dois PAS:
- Donner de conseils médicaux spécifiques
- Faire de diagnostics
- Recommander des changements de médication
- Partager des informations confidentielles"""

        # Add context if available
        context_info = ""
        if context:
            if patient_id:
                # Get recent patient data for context
                patient_context = await self._get_patient_context(patient_id)
                context_info = f"\nContexte du résident: {patient_context}"
        
        full_prompt = f"{context_info}\n\nQuestion: {message}"
        
        response = await self._call_ollama(full_prompt, system_prompt)
        return response

    async def _get_patient_context(self, patient_id: str) -> str:
        """Get relevant patient context for AI responses."""
        try:
            # Get recent reports and communications
            recent_reports = await self.db.daily_reports.find(
                {"patientId": patient_id}
            ).sort("reportDate", -1).limit(3).to_list(length=None)
            
            context = f"Derniers rapports disponibles: {len(recent_reports)} rapports"
            return context
            
        except Exception as e:
            logger.error(f"Error getting patient context: {e}")
            return "Contexte du résident non disponible"

    async def generate_patient_summary(self, patient_id: str, date_range: int = 7) -> Dict[str, Any]:
        """Generate AI-powered patient summary."""
        try:
            # Get patient data
            patient = await self.db.patients.find_one({"_id": patient_id})
            if not patient:
                raise ValueError("Patient not found")

            # Get recent data
            cutoff_date = datetime.now() - timedelta(days=date_range)
            
            reports = await self.db.daily_reports.find({
                "patientId": patient_id,
                "reportDate": {"$gte": cutoff_date.strftime("%Y-%m-%d")}
            }).to_list(length=None)
            
            bristol_entries = await self.db.bristol_entries.find({
                "patientId": patient_id,
                "entryDate": {"$gte": cutoff_date.strftime("%Y-%m-%d")}
            }).to_list(length=None)

            # Generate summary using AI
            data_summary = f"""
Résident: {patient.get('firstName', '')} {patient.get('lastName', '')}
Période: {date_range} derniers jours
Nombre de rapports: {len(reports)}
Nombre d'entrées Bristol: {len(bristol_entries)}
"""

            system_prompt = """Génère un résumé professionnel basé sur les données du résident. 
Identifie les tendances, préoccupations potentielles, et points positifs. 
Reste factuel et bienveillant."""

            ai_summary = await self._call_ollama(data_summary, system_prompt)

            return {
                "ai_summary": ai_summary,
                "data_points": {
                    "reports_count": len(reports),
                    "bristol_entries_count": len(bristol_entries),
                    "date_range": date_range
                }
            }

        except Exception as e:
            logger.error(f"Error generating patient summary: {e}")
            return {"error": "Impossible de générer le résumé"}

    async def analyze_communications(self, communications: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze sentiment and urgency of communications."""
        try:
            analysis_results = []
            
            for comm in communications:
                content = comm.get('content', '')
                
                # Simple sentiment analysis using keywords
                urgent_keywords = ['urgent', 'immédiat', 'critique', 'emergency', 'problème']
                positive_keywords = ['bien', 'excellent', 'amélioration', 'progrès', 'stable']
                negative_keywords = ['préoccupant', 'difficile', 'problème', 'inquiétude']
                
                urgency_score = sum(1 for keyword in urgent_keywords if keyword.lower() in content.lower())
                sentiment_score = (
                    sum(1 for keyword in positive_keywords if keyword.lower() in content.lower()) -
                    sum(1 for keyword in negative_keywords if keyword.lower() in content.lower())
                )
                
                analysis_results.append({
                    "communication_id": comm.get('_id'),
                    "urgency_score": urgency_score,
                    "sentiment_score": sentiment_score,
                    "estimated_urgency": "high" if urgency_score > 0 else "normal",
                    "estimated_sentiment": "positive" if sentiment_score > 0 else "negative" if sentiment_score < 0 else "neutral"
                })

            return {
                "analyses": analysis_results,
                "summary": {
                    "total_communications": len(communications),
                    "high_urgency_count": sum(1 for a in analysis_results if a["estimated_urgency"] == "high"),
                    "positive_sentiment_count": sum(1 for a in analysis_results if a["estimated_sentiment"] == "positive")
                }
            }

        except Exception as e:
            logger.error(f"Error analyzing communications: {e}")
            return {"error": "Impossible d'analyser les communications"}

    async def analyze_bristol_patterns(self, patient_id: str) -> Dict[str, Any]:
        """Analyze Bristol scale patterns for health insights."""
        try:
            # Get Bristol entries from last 30 days
            cutoff_date = datetime.now() - timedelta(days=30)
            
            entries = await self.db.bristol_entries.find({
                "patientId": patient_id,
                "entryDate": {"$gte": cutoff_date.strftime("%Y-%m-%d")},
                "type": "bowel"
            }).to_list(length=None)

            if not entries:
                return {"insights": "Pas assez de données pour l'analyse"}

            # Analyze patterns
            bristol_values = [int(entry.get('value', '4')) for entry in entries if entry.get('value', '').isdigit()]
            
            if bristol_values:
                avg_bristol = sum(bristol_values) / len(bristol_values)
                
                insights = []
                if avg_bristol < 3:
                    insights.append("Tendance vers la constipation")
                elif avg_bristol > 5:
                    insights.append("Tendance vers la diarrhée")
                else:
                    insights.append("Selles dans la normale")

                return {
                    "insights": "; ".join(insights),
                    "average_bristol": round(avg_bristol, 1),
                    "total_entries": len(entries),
                    "date_range": 30
                }

            return {"insights": "Données insuffisantes pour l'analyse"}

        except Exception as e:
            logger.error(f"Error analyzing Bristol patterns: {e}")
            return {"error": "Impossible d'analyser les données Bristol"}

    async def generate_care_recommendations(self, patient_id: str) -> Dict[str, Any]:
        """Generate personalized care recommendations."""
        try:
            # This would be expanded with more sophisticated analysis
            recommendations = [
                "Maintenir la routine quotidienne établie",
                "Surveiller l'hydratation régulièrement",
                "Encourager l'activité physique adaptée",
                "Assurer un environnement calme et prévisible"
            ]

            return {
                "recommendations": recommendations,
                "generated_at": datetime.now().isoformat(),
                "patient_id": patient_id
            }

        except Exception as e:
            logger.error(f"Error generating care recommendations: {e}")
            return {"error": "Impossible de générer les recommandations"}