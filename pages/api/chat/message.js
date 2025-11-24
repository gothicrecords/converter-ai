// API chat intelligente che usa OpenAI e ricerca semantica con embeddings
import { searchAllDocuments, generateMultiDocumentAnswer, getDocumentStats } from '../../../lib/documentAI.js';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, fileIds = [], conversationHistory = [] } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ 
        error: 'Message is required',
        details: 'Please provide a non-empty message'
      });
    }

    console.log('Chat request:', { message, fileIds: fileIds?.length || 0, conversationHistory: conversationHistory.length });

    // Ottieni statistiche documenti dallo store in-memory
    const stats = getDocumentStats();
    
    console.log('=== CHAT API CALL ===');
    console.log('Message:', message);
    console.log('FileIds received:', fileIds);
    console.log('Document stats:', JSON.stringify(stats, null, 2));
    console.log('Total documents in store:', stats.totalDocuments);
    
    // Verifica se ci sono fileIds validi
    const validFileIds = (fileIds && Array.isArray(fileIds) && fileIds.length > 0) 
      ? fileIds.filter(id => id && typeof id === 'string')
      : null; // null = cerca in tutti i documenti
    
    console.log('Valid fileIds:', validFileIds);

    // Se non ci sono documenti nel database
    if (stats.totalDocuments === 0) {
      console.log('NO DOCUMENTS FOUND - returning helpful message');
      const lowerMessage = message.toLowerCase();
      
      // Risposte utili per quando non ci sono documenti
      let helpfulResponse = '';
      
      if (lowerMessage.includes('come funziona') || lowerMessage.includes('how does')) {
        helpfulResponse = 'Benvenuto in **Documenti AI**! 🚀\n\n**Come funziona:**\n1. Carica uno o più documenti (PDF, DOCX, XLSX, TXT)\n2. Fai domande sul contenuto\n3. Ricevi risposte intelligenti basate sui tuoi file\n\n**Cosa posso fare:**\n- Analizzare documenti e trovare informazioni specifiche\n- Rispondere a domande sul contenuto\n- Eseguire ricerche semantiche nei tuoi file\n- Sintetizzare informazioni da più documenti\n\n**Carica un documento per iniziare!**';
      } else if (lowerMessage.includes('formato') || lowerMessage.includes('format')) {
        helpfulResponse = '**Formati supportati:**\n\n✅ PDF - Documenti PDF\n✅ DOCX - Documenti Word\n✅ XLSX/XLS/CSV - Fogli di calcolo Excel\n✅ TXT - File di testo\n\nTutti i formati vengono analizzati completamente per permetterti di fare domande intelligenti sul contenuto.';
      } else if (lowerMessage.includes('cosa puoi fare') || lowerMessage.includes('what can')) {
        helpfulResponse = '**Cosa posso fare con i tuoi documenti:**\n\n📊 **Analisi intelligente** - Estraggo e organizzo tutto il contenuto\n🔍 **Ricerca semantica** - Trovo informazioni anche con parole chiave diverse\n💬 **Chat intelligente** - Rispondo a domande specifiche sul contenuto\n📝 **Sintesi** - Riassumo informazioni da più documenti\n🔗 **Citazioni** - Mostro esattamente da dove provengono le risposte\n\n**Carica un documento e prova!**';
      } else if (lowerMessage.includes('ciao') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        helpfulResponse = 'Ciao! 👋\n\nSono il tuo assistente AI per l\'analisi documenti. Posso aiutarti a:\n- Analizzare documenti PDF, DOCX, Excel e file di testo\n- Trovare informazioni specifiche nel contenuto\n- Rispondere a domande sui tuoi file\n- Eseguire ricerche semantiche intelligenti\n\n**Carica un documento per iniziare!** Usa il pulsante + per caricare i tuoi file.';
      } else {
        helpfulResponse = `Ho ricevuto il tuo messaggio: "${message}"\n\n**Per rispondere alle tue domande sui documenti:**\n1. Carica uno o più documenti usando il pulsante + in basso\n2. Fai domande sul contenuto\n3. Ricevi risposte precise basate sui tuoi file\n\n**Formati supportati:** PDF, DOCX, XLSX, TXT\n**Tutto completamente gratuito e illimitato!**`;
      }

      return res.status(200).json({
        success: true,
        message: helpfulResponse,
        timestamp: new Date().toISOString(),
        noDocuments: true,
        stats,
      });
    }

    // Ricerca semantica con embeddings nello store in-memory
    console.log('Eseguendo ricerca semantica con embeddings...');
    const searchResults = await searchAllDocuments(message, validFileIds);
    
    console.log('Search results:', searchResults.length, 'documents found');
    if (searchResults.length > 0) {
      console.log('Top result:', {
        filename: searchResults[0].filename,
        topScore: searchResults[0].topScore?.toFixed(4),
        resultsCount: searchResults[0].results?.length
      });
    }

    // Se non ci sono risultati rilevanti
    if (searchResults.length === 0) {
      console.log('No semantic search results found');
      
      return res.status(200).json({
        success: true,
        message: `Non ho trovato informazioni rilevanti nei documenti caricati per rispondere a: "${message}"\n\n**Suggerimenti:**\n- Prova a formulare la domanda in modo diverso\n- Usa parole chiave più specifiche\n- Verifica che i documenti caricati contengano le informazioni richieste\n\n**Documenti caricati:** ${stats.totalDocuments}\n**Sezioni totali:** ${stats.totalChunks}`,
        timestamp: new Date().toISOString(),
        noResults: true,
        stats,
      });
    }

    // Costruisci contesto della conversazione (ultimi 3 messaggi)
    const conversationContext = conversationHistory
      .filter(m => m.role && m.content)
      .slice(-3)
      .map(m => `${m.role === 'user' ? 'Utente' : 'Assistente'}: ${m.content}`)
      .join('\n\n');

    // Genera risposta usando OpenAI con i risultati della ricerca semantica
    // IMPORTANTE: passa SOLO testo, non oggetti o ID
    console.log('Generating answer with OpenAI...');
    const answer = await generateMultiDocumentAnswer(message, searchResults, conversationContext);
    
    console.log('Generated answer:', {
      answerLength: answer.answer.length,
      confidence: answer.confidence,
      sourcesCount: answer.sources?.length || 0,
    });

    // Costruisci risposta completa con formattazione
    let responseMessage = answer.answer;

    // Aggiungi informazioni sui documenti usati
    if (answer.sources && answer.sources.length > 0) {
      responseMessage += `\n\n📚 **Documenti consultati:**\n\n`;
      answer.sources.forEach((source, idx) => {
        const score = parseFloat(source.score);
        const percentage = (score * 100).toFixed(0);
        responseMessage += `"${source.filename}" (rilevanza: ${percentage}%)\n`;
      });
    }

    // Aggiungi statistiche
    responseMessage += `\n\n💡 Ho cercato in ${stats.totalDocuments} document${stats.totalDocuments > 1 ? 'i' : 'o'} con ${stats.totalChunks} sezioni totali.`;

    return res.status(200).json({
      success: true,
      message: responseMessage,
      timestamp: new Date().toISOString(),
      confidence: answer.confidence,
      sources: answer.sources || [],
      documentsUsed: searchResults.map(r => ({
        fileId: r.fileId,
        filename: r.filename,
        topScore: r.topScore,
      })),
      stats,
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    
    return res.status(500).json({ 
      error: 'Errore durante l\'elaborazione',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
