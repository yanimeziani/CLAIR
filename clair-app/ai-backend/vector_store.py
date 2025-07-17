import os
import logging
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings
import uuid
from datetime import datetime

logger = logging.getLogger(__name__)

class VectorStore:
    def __init__(self):
        self.client = None
        self.collection = None
        self._ready = False

    async def initialize(self):
        """Initialize ChromaDB vector store."""
        try:
            logger.info("Initializing ChromaDB vector store...")
            
            # Initialize ChromaDB client
            self.client = chromadb.PersistentClient(
                path="./chroma_db",
                settings=Settings(
                    anonymized_telemetry=False,
                    allow_reset=True
                )
            )
            
            # Get or create collection
            self.collection = self.client.get_or_create_collection(
                name="irielle_documents",
                metadata={"description": "Healthcare documents and knowledge base"}
            )
            
            # Initialize with some default healthcare knowledge
            await self._initialize_default_knowledge()
            
            self._ready = True
            logger.info("Vector store initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize vector store: {e}")
            raise

    def is_ready(self) -> bool:
        return self._ready

    async def _initialize_default_knowledge(self):
        """Initialize with default healthcare knowledge."""
        try:
            # Check if we already have documents
            existing_docs = self.collection.count()
            if existing_docs > 0:
                logger.info(f"Vector store already contains {existing_docs} documents")
                return

            default_knowledge = [
                {
                    "content": "L'échelle de Bristol classe les selles en 7 types: Type 1-2 indique constipation, Type 3-4 est normal, Type 5-7 indique diarrhée. Surveiller les changements de pattern.",
                    "document_type": "protocol",
                    "metadata": {"topic": "bristol_scale", "language": "fr"}
                },
                {
                    "content": "Pour les personnes avec TSA, maintenir une routine prévisible est essentiel. Les changements doivent être introduits graduellement avec préparation.",
                    "document_type": "guideline",
                    "metadata": {"topic": "autism_care", "language": "fr"}
                },
                {
                    "content": "La déficience intellectuelle nécessite une communication adaptée: phrases simples, temps de réponse, supports visuels, et patience.",
                    "document_type": "guideline", 
                    "metadata": {"topic": "intellectual_disability", "language": "fr"}
                },
                {
                    "content": "Signes d'urgence médicale: changement soudain de comportement, fièvre élevée, difficultés respiratoires, perte de conscience. Contacter immédiatement les services médicaux.",
                    "document_type": "emergency_protocol",
                    "metadata": {"topic": "emergency", "language": "fr"}
                },
                {
                    "content": "L'hydratation est cruciale: surveiller la couleur des urines, encourager la consommation d'eau, adapter selon la température et l'activité.",
                    "document_type": "health_guideline",
                    "metadata": {"topic": "hydration", "language": "fr"}
                }
            ]

            # Add default knowledge to collection
            for i, doc in enumerate(default_knowledge):
                await self.add_document(
                    content=doc["content"],
                    document_type=doc["document_type"],
                    metadata=doc["metadata"]
                )

            logger.info(f"Added {len(default_knowledge)} default knowledge documents")

        except Exception as e:
            logger.error(f"Error initializing default knowledge: {e}")

    async def add_document(
        self, 
        content: str, 
        document_type: str, 
        metadata: Dict[str, Any]
    ) -> str:
        """Add a document to the vector store."""
        try:
            document_id = str(uuid.uuid4())
            
            # Prepare metadata
            full_metadata = {
                "document_type": document_type,
                "created_at": datetime.now().isoformat(),
                **metadata
            }
            
            # Add to collection
            self.collection.add(
                documents=[content],
                metadatas=[full_metadata],
                ids=[document_id]
            )
            
            logger.info(f"Added document {document_id} of type {document_type}")
            return document_id
            
        except Exception as e:
            logger.error(f"Error adding document: {e}")
            raise

    async def search_documents(
        self, 
        query: str, 
        limit: int = 5,
        document_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Search for relevant documents using semantic similarity."""
        try:
            where_clause = {}
            if document_type:
                where_clause["document_type"] = document_type

            # Perform similarity search
            results = self.collection.query(
                query_texts=[query],
                n_results=limit,
                where=where_clause if where_clause else None
            )
            
            # Format results
            formatted_results = []
            if results['documents'] and len(results['documents']) > 0:
                for i, doc in enumerate(results['documents'][0]):
                    formatted_results.append({
                        "id": results['ids'][0][i],
                        "content": doc,
                        "metadata": results['metadatas'][0][i],
                        "distance": results['distances'][0][i] if 'distances' in results else None
                    })
            
            logger.info(f"Found {len(formatted_results)} documents for query: {query}")
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error searching documents: {e}")
            return []

    async def update_document(
        self, 
        document_id: str, 
        content: str, 
        metadata: Dict[str, Any]
    ) -> bool:
        """Update an existing document."""
        try:
            # Update metadata with modification timestamp
            full_metadata = {
                **metadata,
                "updated_at": datetime.now().isoformat()
            }
            
            # Update in collection
            self.collection.update(
                ids=[document_id],
                documents=[content],
                metadatas=[full_metadata]
            )
            
            logger.info(f"Updated document {document_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating document {document_id}: {e}")
            return False

    async def delete_document(self, document_id: str) -> bool:
        """Delete a document from the vector store."""
        try:
            self.collection.delete(ids=[document_id])
            logger.info(f"Deleted document {document_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting document {document_id}: {e}")
            return False

    async def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about the document collection."""
        try:
            count = self.collection.count()
            
            # Get document types distribution
            all_docs = self.collection.get()
            doc_types = {}
            if all_docs['metadatas']:
                for metadata in all_docs['metadatas']:
                    doc_type = metadata.get('document_type', 'unknown')
                    doc_types[doc_type] = doc_types.get(doc_type, 0) + 1
            
            return {
                "total_documents": count,
                "document_types": doc_types,
                "collection_name": self.collection.name
            }
            
        except Exception as e:
            logger.error(f"Error getting collection stats: {e}")
            return {"error": "Unable to get stats"}

    async def clear_collection(self) -> bool:
        """Clear all documents from the collection (use with caution)."""
        try:
            # This is a destructive operation
            self.client.delete_collection(self.collection.name)
            self.collection = self.client.create_collection(
                name="irielle_documents",
                metadata={"description": "Healthcare documents and knowledge base"}
            )
            
            logger.warning("Collection cleared - all documents deleted")
            return True
            
        except Exception as e:
            logger.error(f"Error clearing collection: {e}")
            return False