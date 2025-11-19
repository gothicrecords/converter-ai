// API endpoint per chat supporto AI
import { searchKnowledgeBase, getSuggestions, getRelatedFAQs } from '../../../lib/supportKnowledgeBase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, context = [], conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Cerca nella base di conoscenza
    const kbResults = searchKnowledgeBase(message);
    
    // Costruisci contesto dalla base di conoscenza
    let knowledgeContext = '';
    if (kbResults.length > 0) {
      knowledgeContext = kbResults
        .slice(0, 3)
        .map((faq, idx) => `FAQ ${idx + 1}:\nDomanda: ${faq.question}\nRisposta: ${faq.answer}`)
        .join('\n\n');
    }

    // Aggiungi contesto fornito
    if (context.length > 0) {
      const providedContext = context
        .map((item, idx) => `Contesto ${idx + 1}:\nDomanda: ${item.question}\nRisposta: ${item.answer}`)
        .join('\n\n');
      knowledgeContext = knowledgeContext 
        ? `${knowledgeContext}\n\n${providedContext}`
        : providedContext;
    }

    // Costruisci prompt per AI
    const systemPrompt = `Sei un assistente virtuale esperto e amichevole per MegaPixelAI, una piattaforma di strumenti AI.

La tua missione è:
1. Rispondere alle domande degli utenti in modo chiaro, conciso e utile
2. Utilizzare la base di conoscenza fornita per dare risposte accurate
3. Suggerire strumenti e funzionalità rilevanti quando appropriato
4. Essere professionale ma amichevole
5. Se non conosci la risposta, ammettilo e suggerisci di contattare il supporto

${knowledgeContext ? `\nBase di conoscenza:\n${knowledgeContext}` : ''}

Rispondi sempre in italiano, a meno che l'utente non chieda esplicitamente in un'altra lingua.
Mantieni le risposte concise ma complete (max 200 parole).
Usa formattazione markdown quando utile (**, liste, etc.).`;

    const userPrompt = `Domanda dell'utente: ${message}`;

    // Simula risposta AI (in produzione, usa OpenAI o altro servizio)
    // TODO: Integrare con OpenAI quando disponibile
    let aiResponse = generateAIResponse(message, knowledgeContext, conversationHistory);

    // Ottieni FAQ correlate
    const relatedFAQs = kbResults.length > 0 
      ? getRelatedFAQs(kbResults[0].id, 2)
      : [];

    // Genera suggerimenti
    const suggestions = getSuggestions(message).slice(0, 3);

    // Se la risposta è basata su FAQ, migliorala
    if (kbResults.length > 0 && kbResults[0].score > 5) {
      aiResponse = `**${kbResults[0].question}**\n\n${kbResults[0].answer}\n\n${aiResponse}`;
    }

    return res.status(200).json({
      success: true,
      response: aiResponse,
      relatedFAQs: relatedFAQs.map(faq => ({
        id: faq.id,
        question: faq.question,
        answer: faq.answer
      })),
      suggestions,
      confidence: kbResults.length > 0 ? Math.min(kbResults[0].score / 10, 1) : 0.5
    });

  } catch (error) {
    console.error('Support chat API error:', error);
    return res.status(500).json({ 
      error: 'Errore interno del server',
      message: error.message 
    });
  }
}

// Funzione per generare risposta AI (fallback quando OpenAI non è disponibile)
function generateAIResponse(message, knowledgeContext, conversationHistory) {
  const lowerMessage = message.toLowerCase();

  // Pattern matching intelligente
  if (lowerMessage.includes('ciao') || lowerMessage.includes('salve') || lowerMessage.includes('buongiorno')) {
    return 'Ciao! 👋 Sono qui per aiutarti. Come posso assisterti oggi?';
  }

  if (lowerMessage.includes('grazie') || lowerMessage.includes('grazie mille')) {
    return 'Prego! Sono felice di aver potuto aiutarti. Se hai altre domande, sono qui! 😊';
  }

  if (lowerMessage.includes('prezzo') || lowerMessage.includes('costo') || lowerMessage.includes('quanto costa')) {
    return 'Offriamo diversi piani:\n\n• **Gratuito**: Funzionalità base\n• **Pro**: Funzionalità avanzate e priorità\n• **Enterprise**: Soluzioni personalizzate\n\nVisita la pagina Pricing per maggiori dettagli!';
  }

  if (lowerMessage.includes('formato') || lowerMessage.includes('supporta')) {
    return 'Supportiamo molti formati:\n\n**Immagini:** JPG, PNG, WEBP, GIF\n**Documenti:** PDF, DOCX, TXT\n**Video:** MP4, AVI, MOV\n**Audio:** MP3, WAV, OGG\n\nE molti altri! Quale formato ti interessa?';
  }

  if (lowerMessage.includes('sicuro') || lowerMessage.includes('privacy') || lowerMessage.includes('dati')) {
    return 'La sicurezza è la nostra priorità! 🔒\n\n• I tuoi file vengono processati in modo sicuro\n• Eliminazione automatica dopo 24 ore\n• Nessuna condivisione con terze parti\n• Crittografia end-to-end\n\nI tuoi dati sono al sicuro con noi.';
  }

  if (lowerMessage.includes('errore') || lowerMessage.includes('problema') || lowerMessage.includes('non funziona')) {
    return 'Mi dispiace per il problema! 😔\n\nProva questi passaggi:\n1. Ricarica la pagina\n2. Verifica la connessione internet\n3. Controlla che il file sia nel formato corretto\n4. Se il problema persiste, contatta il supporto con i dettagli dell\'errore';
  }

  if (lowerMessage.includes('account') || lowerMessage.includes('registrarsi') || lowerMessage.includes('iscriversi')) {
    return 'Per creare un account:\n\n1. Clicca su "Registrati" in alto a destra\n2. Inserisci nome, email e password\n3. Conferma l\'email\n4. Inizia a usare tutti gli strumenti!\n\nÈ gratuito e veloce! 🚀';
  }

  // Se c'è contesto dalla base di conoscenza, usalo
  if (knowledgeContext) {
    // Estrai la prima risposta rilevante
    const contextMatch = knowledgeContext.match(/Risposta: ([^\n]+(?:\n(?!FAQ|Contesto)[^\n]+)*)/);
    if (contextMatch) {
      return `Basandomi sulla nostra base di conoscenza:\n\n${contextMatch[1]}\n\nSe hai bisogno di maggiori dettagli, chiedi pure!`;
    }
  }

  // Risposta generica ma utile
  return `Grazie per la tua domanda! 🤔\n\nHo cercato nella nostra base di conoscenza. Se la risposta non è completa, posso aiutarti in altri modi:\n\n• Cerca nelle FAQ usando il tab "FAQ"\n• Contatta il supporto diretto\n• Esplora gli strumenti disponibili\n\nCome posso aiutarti meglio?`;
}

