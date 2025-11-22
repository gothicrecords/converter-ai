// API chat intelligente che usa il sistema documentAI locale
import { 
  searchAllDocuments, 
  generateMultiDocumentAnswer,
  getDocument,
  getDocumentStats,
  getAllDocuments
} from '../../../lib/documentAI';
import { chatCompletion } from '../../../lib/openai';

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

    console.log('Chat request:', { message, fileIds: fileIds?.length || 0, conversationHistory: conversationHistory.length });

    // Ottieni statistiche documenti
    const stats = getDocumentStats();
    
    console.log('=== CHAT API CALL ===');
    console.log('Message:', message);
    console.log('FileIds received:', fileIds);
    console.log('FileIds type:', typeof fileIds, Array.isArray(fileIds));
    console.log('Document stats:', JSON.stringify(stats, null, 2));
    console.log('Store size:', stats.totalDocuments);
    
    // Verifica se ci sono fileIds validi
    const validFileIds = (fileIds && Array.isArray(fileIds) && fileIds.length > 0) 
      ? fileIds.filter(id => id && typeof id === 'string')
      : [];
    
    console.log('Valid fileIds:', validFileIds);
    
    // Verifica se i fileIds corrispondono a documenti esistenti
    let documentsFound = 0;
    if (validFileIds.length > 0) {
      for (const id of validFileIds) {
        const doc = getDocument(id);
        if (doc) {
          documentsFound++;
          console.log(`Document found for fileId ${id}:`, doc.metadata?.filename);
        } else {
          console.log(`Document NOT found for fileId ${id}`);
        }
      }
    }
    
    console.log(`Documents found for fileIds: ${documentsFound}/${validFileIds.length}`);

    // IMPORTANTE: Verifica sempre se ci sono documenti disponibili, anche se fileIds è vuoto
    // Il problema potrebbe essere che i fileIds non vengono passati ma i documenti esistono
    
    // Se non ci sono documenti caricati E non ci sono fileIds specifici E non ci sono documenti trovati per i fileIds
    if (stats.totalDocuments === 0 && validFileIds.length === 0) {
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
    const targetFileIds = validFileIds.length > 0 ? validFileIds : null;
    console.log('Searching in documents with fileIds:', targetFileIds);
    console.log('Stats before search:', stats);
    console.log('Documents found for fileIds:', documentsFound);
    
    const searchResults = searchAllDocuments(message, targetFileIds);
    
    console.log('Search results:', searchResults.length, 'results found');
    if (searchResults.length > 0) {
      console.log('Top result:', searchResults[0]);
    }

    // Anche se la ricerca semantica non trova risultati, usiamo OpenAI per analizzare i documenti
    // Questo permette di rispondere anche quando le parole chiave non matchano esattamente
    if (searchResults.length === 0) {
      console.log('No semantic search results, but using OpenAI to analyze documents anyway');
      
      // Prendi tutti i documenti disponibili
      let documentsToAnalyze = [];
      
      if (targetFileIds && targetFileIds.length > 0) {
        // Se ci sono fileIds specifici, usa quelli
        for (const id of targetFileIds) {
          const doc = getDocument(id);
          if (doc && doc.text) {
            documentsToAnalyze.push({
              fileId: id,
              filename: doc.metadata?.filename || doc.metadata?.originalFilename || 'Documento',
              text: doc.text
            });
          }
        }
      } else {
        // Altrimenti prendi tutti i documenti disponibili
        const allDocs = getAllDocuments();
        documentsToAnalyze = allDocs
          .filter(doc => doc.text)
          .map(doc => ({
            fileId: doc.fileId,
            filename: doc.metadata?.filename || doc.metadata?.originalFilename || 'Documento',
            text: doc.text
          }));
      }
      
      // Se abbiamo documenti, usiamo OpenAI per analizzarli
      console.log(`Documents to analyze: ${documentsToAnalyze.length}`);
      if (documentsToAnalyze.length > 0) {
        // Costruisci contesto dai documenti (limita a 3000 caratteri per documento per non superare i limiti)
        let documentContext = '';
        const documentNames = [];
        
        for (const doc of documentsToAnalyze) {
          documentNames.push(doc.filename);
          // Prendi fino a 3000 caratteri di ogni documento
          const docText = doc.text.length > 3000 
            ? doc.text.substring(0, 3000) + '...' 
            : doc.text;
          documentContext += `\n\n---\n[Documento: "${doc.filename}"]\n${docText}`;
        }
        
        // Costruisci contesto della conversazione
        const conversationContext = conversationHistory
          .filter(m => m.role && m.content)
          .slice(-3)
          .map(m => `${m.role === 'user' ? 'Utente' : 'Assistente'}: ${m.content}`)
          .join('\n\n');
        
        // Usa OpenAI direttamente per analizzare i documenti
        try {
          console.log('Calling OpenAI with', documentsToAnalyze.length, 'documents');
          
          const messages = [
            {
              role: 'system',
              content: `Sei un assistente AI esperto nell'analisi di documenti. Il tuo compito è rispondere alle domande degli utenti basandoti ESCLUSIVAMENTE sul contenuto dei documenti forniti. 

IMPORTANTE:
- Analizza attentamente il contenuto dei documenti forniti
- Rispondi in modo completo, dettagliato e accurato
- Se le informazioni non sono presenti nei documenti, dillo esplicitamente
- Cita sempre da quale documento provengono le informazioni quando possibile (es: "Secondo il documento 'X'...")
- Rispondi sempre in italiano a meno che l'utente non chieda diversamente
- Usa un linguaggio chiaro, professionale e ben strutturato
- Se la domanda è vaga, fornisci comunque informazioni utili basate sui documenti`
            },
            {
              role: 'user',
              content: `Analizza attentamente i seguenti documenti e rispondi alla domanda dell'utente in modo completo e accurato.

**CONTENUTO DEI DOCUMENTI:**
${documentContext}

${conversationContext ? `\n\n**CONTESTO DELLA CONVERSAZIONE PRECEDENTE:**\n${conversationContext}\n` : ''}

**DOMANDA DELL'UTENTE:**
${message}

**ISTRUZIONI:**
- Rispondi basandoti SOLO sul contenuto dei documenti forniti sopra
- Se la risposta richiede informazioni non presenti nei documenti, dillo chiaramente
- Cita sempre il nome del documento quando fai riferimento a informazioni specifiche (es: "Nel documento 'X' si legge che...")
- Fornisci una risposta completa, ben strutturata e dettagliata
- Se possibile, includi esempi o dettagli specifici dal documento`
            }
          ];
          
          const aiResponse = await chatCompletion(messages, {
            model: 'gpt-4o-mini',
            temperature: 0.2,
            max_tokens: 2000, // Aumentato per risposte più complete
            top_p: 0.9,
            frequency_penalty: 0.1,
            presence_penalty: 0.1
          });
          
          console.log('OpenAI response received, length:', aiResponse.length);
          
          return res.status(200).json({
            success: true,
            message: aiResponse.trim(),
            timestamp: new Date().toISOString(),
            confidence: 0.7, // Confidence media quando non c'è match semantico
            sources: documentNames.map(name => ({ filename: name, text: '...', score: '0.500' })),
            documentsUsed: documentNames.map(name => ({ filename: name, topScore: 0.5 })),
            stats,
          });
        } catch (openaiError) {
          console.error('Errore chiamata OpenAI:', openaiError);
          // Fallback a risposta generica se OpenAI fallisce
          return res.status(200).json({
            success: true,
            message: `Ho analizzato ${documentsToAnalyze.length} document${documentsToAnalyze.length > 1 ? 'i' : 'o'}, ma non sono riuscito a trovare informazioni specifiche per rispondere a: "${message}"\n\n**Suggerimenti:**\n- Prova a formulare la domanda in modo diverso\n- Usa parole chiave più specifiche\n- Assicurati che il documento contenga informazioni pertinenti\n\n**Errore tecnico:** ${openaiError.message}`,
            timestamp: new Date().toISOString(),
            noResults: true,
            stats,
          });
        }
      }
      
      // Se non ci sono documenti da analizzare, verifica meglio la situazione
      console.log('No documents to analyze. Stats:', stats);
      console.log('Valid fileIds:', validFileIds);
      console.log('Documents found:', documentsFound);
      
      // Se ci sono fileIds ma non sono stati trovati documenti, potrebbe essere un problema di persistenza
      if (validFileIds.length > 0 && documentsFound === 0) {
        return res.status(200).json({
          success: true,
          message: `Ho ricevuto ${validFileIds.length} fileId ma non ho trovato i documenti corrispondenti nello store.\n\n**Possibili cause:**\n- I documenti potrebbero non essere stati salvati correttamente\n- Il server potrebbe essere stato riavviato e lo store è stato perso\n\n**Soluzione:**\n- Ricarica i documenti usando il pulsante + in basso\n- Assicurati che i documenti siano stati caricati con successo`,
          timestamp: new Date().toISOString(),
          noResults: true,
          stats,
          fileIdsReceived: validFileIds,
        });
      }
      
      // Se non ci sono documenti da analizzare, restituisci messaggio di errore
      return res.status(200).json({
        success: true,
        message: `Non ho trovato documenti da analizzare per rispondere a: "${message}"\n\n**Suggerimenti:**\n- Carica uno o più documenti usando il pulsante + in basso\n- Assicurati che i documenti siano stati caricati correttamente\n- Verifica nella console del browser che i fileIds siano stati passati correttamente`,
        timestamp: new Date().toISOString(),
        noResults: true,
        stats,
      });
    }

    // Costruisci contesto della conversazione per OpenAI
    const conversationContext = conversationHistory
      .filter(m => m.role && m.content)
      .slice(-3) // Ultimi 3 messaggi per contesto
      .map(m => `${m.role === 'user' ? 'Utente' : 'Assistente'}: ${m.content}`)
      .join('\n\n');

    // Genera risposta intelligente basata sui risultati usando OpenAI
    // Passa anche il contesto della conversazione per risposte più coerenti
    const answer = await generateMultiDocumentAnswer(message, searchResults, conversationContext);

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
