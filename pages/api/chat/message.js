// API chat intelligente che usa il sistema documentAI locale
import { 
  searchAllDocuments, 
  generateMultiDocumentAnswer,
  getDocument,
  getDocumentStats 
} from '../../../lib/documentAI';

export default async function handler(req, res) {
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

    console.log('Chat request:', { message, fileIds: fileIds.length, conversationHistory: conversationHistory.length });

    // Ottieni statistiche documenti
    const stats = getDocumentStats();
    
    console.log('=== CHAT API CALL ===');
    console.log('Message:', message);
    console.log('FileIds received:', fileIds);
    console.log('Document stats:', JSON.stringify(stats, null, 2));
    console.log('Store size:', stats.totalDocuments);

    // IMPORTANTE: Verifica sempre se ci sono documenti disponibili, anche se fileIds è vuoto
    // Il problema potrebbe essere che i fileIds non vengono passati ma i documenti esistono
    
    // Se non ci sono documenti caricati E non ci sono fileIds specifici
    if (stats.totalDocuments === 0 && (!fileIds || fileIds.length === 0)) {
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

    // Cerca nei documenti caricati
    // Se ci sono fileIds specifici, cerca solo in quelli, altrimenti cerca in tutti
    const targetFileIds = (fileIds && Array.isArray(fileIds) && fileIds.length > 0) ? fileIds : null;
    console.log('Searching in documents with fileIds:', targetFileIds);
    console.log('Stats before search:', stats);
    
    const searchResults = searchAllDocuments(message, targetFileIds);
    
    console.log('Search results:', searchResults.length, 'results found');
    if (searchResults.length > 0) {
      console.log('Top result:', searchResults[0]);
    }

    if (searchResults.length === 0) {
      // Nessun risultato trovato nei documenti
      return res.status(200).json({
        success: true,
        message: `Non ho trovato informazioni rilevanti nei ${stats.totalDocuments} document${stats.totalDocuments > 1 ? 'i' : 'o'} caricat${stats.totalDocuments > 1 ? 'i' : 'o'} per rispondere a: "${message}"\n\n**Suggerimenti:**\n- Prova a formulare la domanda in modo diverso\n- Usa parole chiave diverse\n- Assicurati che il documento contenga informazioni pertinenti\n- Carica documenti più pertinenti`,
        timestamp: new Date().toISOString(),
        noResults: true,
        stats,
      });
    }

    // Genera risposta intelligente basata sui risultati
    const answer = generateMultiDocumentAnswer(message, searchResults);

    // Costruisci risposta completa
    let responseMessage = answer.answer;

    // Aggiungi informazioni sui documenti usati
    if (answer.sources && answer.sources.length > 0) {
      responseMessage += `\n\n📚 **Documenti consultati:**\n`;
      answer.sources.forEach((source, idx) => {
        responseMessage += `${idx + 1}. "${source.filename}" (rilevanza: ${(parseFloat(source.score) * 100).toFixed(0)}%)\n`;
      });
    }

    // Aggiungi statistiche se utile
    if (stats.totalDocuments > 1) {
      responseMessage += `\n\n💡 Ho cercato in ${stats.totalDocuments} documenti con ${stats.totalChunks} sezioni totali.`;
    }

    console.log('Generated answer:', {
      messageLength: responseMessage.length,
      confidence: answer.confidence,
      sourcesCount: answer.sources?.length || 0,
      documentsUsed: searchResults.length,
    });

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
