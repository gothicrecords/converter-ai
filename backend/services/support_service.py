"""
Support service - handles support chat
"""
import logging
from typing import Dict, Optional, List
import openai
from backend.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class SupportService:
    """Service for support chat"""
    
    def __init__(self):
        """Initialize support service"""
        if settings.OPENAI_API_KEY:
            self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        else:
            self.openai_client = None
            logger.warning("OpenAI not configured - support features will be limited")
    
    async def chat(
        self,
        message: str,
        context: Optional[List[Dict]] = None,
        conversation_history: Optional[List[Dict]] = None
    ) -> Dict:
        """Handle support chat message"""
        if not self.openai_client:
            return {
                'answer': 'OpenAI API non configurata. Configura OPENAI_API_KEY per usare il supporto AI.',
            }
        
        try:
            # Build knowledge base context
            knowledge_context = ""
            if context:
                knowledge_context = "\n\n".join([
                    f"FAQ {i+1}:\nDomanda: {item.get('question', '')}\nRisposta: {item.get('answer', '')}"
                    for i, item in enumerate(context[:3])
                ])
            
            # Build system prompt
            system_prompt = """Sei un assistente virtuale esperto e amichevole per MegaPixelAI, una piattaforma di strumenti AI.

La tua missione è:
1. Rispondere alle domande degli utenti in modo chiaro, conciso e utile
2. Utilizzare la base di conoscenza fornita per dare risposte accurate
3. Suggerire strumenti e funzionalità rilevanti quando appropriato
4. Essere professionale ma amichevole
5. Se non conosci la risposta, ammettilo e suggerisci di contattare il supporto"""
            
            messages = [{'role': 'system', 'content': system_prompt}]
            
            if knowledge_context:
                messages.append({
                    'role': 'system',
                    'content': f"Base di conoscenza:\n{knowledge_context}"
                })
            
            # Add conversation history
            if conversation_history:
                for msg in conversation_history:
                    messages.append({
                        'role': msg.get('role', 'user'),
                        'content': msg.get('content', '')
                    })
            
            # Add current message
            messages.append({'role': 'user', 'content': message})
            
            # Call OpenAI
            response = self.openai_client.chat.completions.create(
                model='gpt-4',
                messages=messages,
                temperature=0.7,
            )
            
            answer = response.choices[0].message.content
            
            return {
                'answer': answer,
            }
        
        except Exception as exc:
            logger.error(f"Support chat error: {exc}", exc_info=True)
            raise ValueError(f"Support chat failed: {str(exc)}")

