"""
Stripe router - handles Stripe payments
"""
from fastapi import APIRouter, HTTPException, Request, Header
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from typing import Optional
import logging

from backend.services.stripe_service import StripeService

logger = logging.getLogger(__name__)

router = APIRouter()
stripe_service = StripeService()


class CreateCheckoutRequest(BaseModel):
    priceId: str
    userEmail: EmailStr
    userId: Optional[str] = None


class CreatePortalRequest(BaseModel):
    customerId: str


@router.post("/create-checkout-session")
async def create_checkout_session(request: CreateCheckoutRequest):
    """Create checkout session endpoint"""
    try:
        result = await stripe_service.create_checkout_session(
            price_id=request.priceId,
            user_email=request.userEmail,
            user_id=request.userId
        )
        return JSONResponse({
            "success": True,
            "url": result["url"],
        })
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as exc:
        logger.error(f"Create checkout session error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create checkout session")


@router.post("/create-portal-session")
async def create_portal_session(request: CreatePortalRequest):
    """Create portal session endpoint"""
    try:
        result = await stripe_service.create_portal_session(request.customerId)
        return JSONResponse({
            "success": True,
            "url": result["url"],
        })
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as exc:
        logger.error(f"Create portal session error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create portal session")


@router.post("/webhook")
async def webhook(request: Request):
    """Stripe webhook endpoint"""
    try:
        # Get raw body and signature
        body = await request.body()
        signature = request.headers.get("stripe-signature")
        
        if not signature:
            raise HTTPException(status_code=400, detail="Missing stripe-signature header")
        
        # Verify webhook
        event = stripe_service.verify_webhook(body, signature)
        
        # Handle event (this would integrate with database updates)
        logger.info(f"Received Stripe event: {event['type']}")
        
        return JSONResponse({"received": True})
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as exc:
        logger.error(f"Webhook error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Webhook processing failed")
