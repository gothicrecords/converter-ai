"""
Chat service - handles AI chat functionality
"""
import logging
from typing import Dict, Optional, List
import openai
from backend.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class ChatService:
    """Service for AI chat"""
    
    def __init__(self):
        """Initialize chat service"""
        if settings.OPENAI_API_KEY:
            self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        else:
            self.openai_client = None
            logger.warning("OpenAI not configured - chat features will be limited")
    
    async def send_message(
        self,
        message: str,
        file_ids: Optional[List[str]] = None,
        conversation_history: Optional[List[Dict]] = None
    ) -> Dict:
        """Send chat message"""
        if not self.openai_client:
            return {
                'answer': 'OpenAI API non configurata. Configura OPENAI_API_KEY per usare la chat AI.',
                'sources': [],
            }
        
        try:
            messages = []
            
            # System message
            messages.append({
                'role': 'system',
                'content': 'Sei un assistente AI utile e professionale per MegaPixelAI.'
            })
            
            # Add conversation history
            if conversation_history:
                for msg in conversation_history:
                    messages.append({
                        'role': msg.get('role', 'user'),
                        'content': msg.get('content', '')
                    })
            
            # Add current message
            messages.append({
                'role': 'user',
                'content': message
            })
            
            # Call OpenAI
            response = self.openai_client.chat.completions.create(
                model='gpt-4',
                messages=messages,
                temperature=0.7,
            )
            
            answer = response.choices[0].message.content
            
            return {
                'answer': answer,
                'sources': [],
            }
        
        except Exception as exc:
            logger.error(f"Chat error: {exc}", exc_info=True)
            raise ValueError(f"Chat failed: {str(exc)}")
    
    async def upload_document(self, file_content: bytes, filename: str, user_id: str) -> Dict:
        """Upload document for chat context"""
        # This would integrate with document embedding service
        # For now, return a placeholder
        return {
            'fileId': f"file_{filename}",
            'status': 'uploaded',
        }

