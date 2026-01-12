"""API route for demo requests."""
from fastapi import APIRouter, HTTPException
from app.models.schemas import DemoRequest, DemoResponse
from app.core.database import mongodb
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/request", response_model=DemoResponse)
async def create_demo_request(request: DemoRequest):
    """
    Save a demo request to the form_data collection.
    """
    try:
        logger.info(f"Received demo request from {request.email}")
        
        # Get the form_data collection
        collection = mongodb.get_collection("form_data")
        
        # Prepare data with timestamp
        demo_data = request.dict()
        demo_data["created_at"] = datetime.utcnow()
        
        # Insert into database
        await collection.insert_one(demo_data)
        
        logger.info(f"Successfully saved demo request for {request.email}")
        
        return DemoResponse(
            success=True,
            message="Demo request submitted successfully. Our team will contact you soon."
        )
        
    except Exception as e:
        logger.error(f"Error saving demo request: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )
