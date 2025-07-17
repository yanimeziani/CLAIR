import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional

logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.database = None

    async def connect(self):
        """Connect to MongoDB."""
        try:
            mongodb_url = os.getenv("MONGODB_URL", "mongodb://admin:securepassword@localhost:27017/irielle?authSource=admin")
            
            self.client = AsyncIOMotorClient(mongodb_url)
            self.database = self.client.irielle
            
            # Test connection
            await self.client.admin.command('ping')
            logger.info("Connected to MongoDB successfully")
            
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise

    async def disconnect(self):
        """Disconnect from MongoDB."""
        if self.client:
            self.client.close()
            logger.info("Disconnected from MongoDB")

    def get_collection(self, collection_name: str):
        """Get a collection from the database."""
        if not self.database:
            raise RuntimeError("Database not connected")
        return self.database[collection_name]

    @property
    def patients(self):
        return self.get_collection("patients")

    @property 
    def users(self):
        return self.get_collection("users")

    @property
    def communications(self):
        return self.get_collection("communications")

    @property
    def daily_reports(self):
        return self.get_collection("daily_reports")

    @property
    def bristol_entries(self):
        return self.get_collection("bristol_entries")

    @property
    def report_templates(self):
        return self.get_collection("report_templates")

# Global database instance
_database = None

async def get_database() -> Database:
    """Get the global database instance."""
    global _database
    
    if _database is None:
        _database = Database()
        await _database.connect()
    
    return _database

async def close_database():
    """Close the global database connection."""
    global _database
    
    if _database:
        await _database.disconnect()
        _database = None