"""
Stripe router
"""
from fastapi import APIRouter, HTTPException
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/create-checkout-session")
async def create_checkout_session():
    """Create checkout session endpoint"""
    # TODO: Implement
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/create-portal-session")
async def create_portal_session():
    """Create portal session endpoint"""
    # TODO: Implement
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/webhook")
async def webhook():
    """Stripe webhook endpoint"""
    # TODO: Implement
    raise HTTPException(status_code=501, detail="Not implemented yet")

