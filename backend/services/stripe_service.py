"""
Stripe service - handles Stripe payments
"""
import logging
from typing import Dict, Optional
import stripe
from backend.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class StripeService:
    """Service for Stripe payments"""
    
    def __init__(self):
        """Initialize Stripe service"""
        if settings.STRIPE_SECRET_KEY:
            stripe.api_key = settings.STRIPE_SECRET_KEY
            self.stripe = stripe
        else:
            self.stripe = None
            logger.warning("Stripe not configured - payment features will be limited")
    
    async def create_checkout_session(
        self,
        price_id: str,
        user_email: str,
        user_id: Optional[str] = None
    ) -> Dict:
        """Create Stripe checkout session"""
        if not self.stripe:
            raise ValueError("Stripe not configured")
        
        base_url = settings.APP_URL or "http://localhost:3000"
        
        session = self.stripe.checkout.Session.create(
            mode='subscription',
            payment_method_types=['card'],
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            success_url=f"{base_url}/dashboard?success=true&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{base_url}/pricing?canceled=true",
            customer_email=user_email,
            metadata={
                'userId': user_id or 'unknown',
            },
            allow_promotion_codes=True,
            billing_address_collection='required',
            subscription_data={
                'metadata': {
                    'userId': user_id or 'unknown',
                },
            },
        )
        
        return {
            'url': session.url,
            'sessionId': session.id,
        }
    
    async def create_portal_session(self, customer_id: str) -> Dict:
        """Create Stripe customer portal session"""
        if not self.stripe:
            raise ValueError("Stripe not configured")
        
        base_url = settings.APP_URL or "http://localhost:3000"
        
        session = self.stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=f"{base_url}/dashboard",
        )
        
        return {
            'url': session.url,
        }
    
    def verify_webhook(self, payload: bytes, signature: str) -> Dict:
        """Verify Stripe webhook signature"""
        if not self.stripe or not settings.STRIPE_WEBHOOK_SECRET:
            raise ValueError("Stripe webhook secret not configured")
        
        try:
            event = self.stripe.Webhook.construct_event(
                payload, signature, settings.STRIPE_WEBHOOK_SECRET
            )
            return event
        except ValueError as e:
            raise ValueError(f"Invalid payload: {e}")
        except stripe.error.SignatureVerificationError as e:
            raise ValueError(f"Invalid signature: {e}")

