// Base di conoscenza per il supporto - FAQ e risposte intelligenti

export const supportCategories = {
  general: 'Generale',
  tools: 'Strumenti',
  account: 'Account',
  billing: 'Fatturazione',
  technical: 'Tecnico',
  features: 'Funzionalità'
};

export const faqDatabase = [
  // Generale
  {
    id: 'faq-1',
    category: 'general',
    question: 'Cos\'è MegaPixelAI?',
    answer: 'MegaPixelAI è una piattaforma completa di strumenti AI per immagini, documenti, video e audio. Offriamo upscaling immagini, rimozione sfondo, OCR avanzato, conversione file, e molto altro.',
    keywords: ['cosa', 'cos\'è', 'megapixel', 'piattaforma', 'strumenti'],
    relatedTools: ['upscaler', 'background-remover', 'ocr']
  },
  {
    id: 'faq-2',
    category: 'general',
    question: 'Come funziona?',
    answer: 'È semplice! Carica il tuo file, scegli lo strumento che preferisci, e ottieni il risultato in pochi secondi. Tutti i processi avvengono in modo sicuro e privato.',
    keywords: ['come', 'funziona', 'usare', 'utilizzare', 'processo'],
    relatedTools: []
  },
  {
    id: 'faq-3',
    category: 'general',
    question: 'È gratuito?',
    answer: 'Offriamo un piano gratuito con funzionalità base. Per funzionalità avanzate e maggiore velocità, puoi passare a un piano Pro. Visita la pagina Pricing per maggiori dettagli.',
    keywords: ['gratuito', 'prezzo', 'costo', 'piano', 'abbonamento', 'free'],
    relatedTools: []
  },

  // Strumenti
  {
    id: 'faq-4',
    category: 'tools',
    question: 'Quali formati di file sono supportati?',
    answer: 'Supportiamo un\'ampia gamma di formati:\n\n**Immagini:** JPG, PNG, WEBP, GIF, BMP, TIFF\n**Documenti:** PDF, DOCX, DOC, TXT, RTF\n**Fogli di calcolo:** XLSX, XLS, CSV\n**Presentazioni:** PPTX, PPT\n**Video:** MP4, AVI, MOV, MKV\n**Audio:** MP3, WAV, OGG, FLAC\n**Archivi:** ZIP, RAR, 7Z, TAR',
    keywords: ['formati', 'formato', 'supportati', 'file', 'tipi', 'estensioni'],
    relatedTools: ['pdf-converter', 'generic-converter']
  },
  {
    id: 'faq-5',
    category: 'tools',
    question: 'Come funziona l\'upscaling delle immagini?',
    answer: 'Il nostro upscaler AI utilizza algoritmi avanzati di deep learning per aumentare la risoluzione delle immagini fino a 4x mantenendo la qualità. Basta caricare l\'immagine e scegliere il fattore di upscaling desiderato.',
    keywords: ['upscale', 'upscaling', 'risoluzione', 'immagine', 'qualità', 'ingrandire'],
    relatedTools: ['upscaler']
  },
  {
    id: 'faq-6',
    category: 'tools',
    question: 'Posso rimuovere lo sfondo da qualsiasi immagine?',
    answer: 'Sì! Il nostro strumento di rimozione sfondo AI funziona con qualsiasi immagine. Funziona meglio con immagini che hanno un soggetto chiaro e uno sfondo contrastante.',
    keywords: ['sfondo', 'rimuovere', 'background', 'remove', 'trasparente'],
    relatedTools: ['rimozione-sfondo-ai']
  },
  {
    id: 'faq-7',
    category: 'tools',
    question: 'Come funziona l\'OCR?',
    answer: 'L\'OCR (Optical Character Recognition) avanzato estrae testo da immagini, PDF scansionati e documenti. Supporta più di 100 lingue e mantiene la formattazione quando possibile.',
    keywords: ['ocr', 'testo', 'estrarre', 'immagine', 'pdf', 'scansionato'],
    relatedTools: ['ocr-avanzato-ai']
  },
  {
    id: 'faq-8',
    category: 'tools',
    question: 'Posso convertire più file contemporaneamente?',
    answer: 'Sì! Molti strumenti supportano il batch processing. Puoi caricare più file e processarli tutti in una volta. I risultati verranno forniti come download singoli o in un archivio ZIP.',
    keywords: ['batch', 'multipli', 'più file', 'contemporaneamente', 'bulk'],
    relatedTools: ['combina-splitta-pdf', 'generic-converter']
  },

  // Account
  {
    id: 'faq-9',
    category: 'account',
    question: 'Come creo un account?',
    answer: 'Clicca su "Registrati" in alto a destra, inserisci nome, email e password. Riceverai un\'email di conferma. Una volta confermato, avrai accesso a tutte le funzionalità.',
    keywords: ['account', 'registrarsi', 'signup', 'iscriversi', 'creare'],
    relatedTools: []
  },
  {
    id: 'faq-10',
    category: 'account',
    question: 'Ho dimenticato la password',
    answer: 'Vai alla pagina di login e clicca su "Password dimenticata". Inserisci la tua email e riceverai un link per reimpostare la password.',
    keywords: ['password', 'dimenticata', 'reset', 'recuperare', 'forgot'],
    relatedTools: []
  },
  {
    id: 'faq-11',
    category: 'account',
    question: 'Come elimino il mio account?',
    answer: 'Vai alla Dashboard, sezione Impostazioni, e clicca su "Elimina Account". Conferma l\'operazione. Nota: questa azione è irreversibile.',
    keywords: ['eliminare', 'cancellare', 'account', 'delete', 'rimuovere'],
    relatedTools: []
  },

  // Fatturazione
  {
    id: 'faq-12',
    category: 'billing',
    question: 'Come funziona la fatturazione?',
    answer: 'I piani Pro sono fatturati mensilmente o annualmente. Puoi cancellare in qualsiasi momento dalla Dashboard. Non ci sono costi nascosti o commissioni.',
    keywords: ['fatturazione', 'billing', 'pagamento', 'piano', 'pro'],
    relatedTools: []
  },
  {
    id: 'faq-13',
    category: 'billing',
    question: 'Posso cambiare piano?',
    answer: 'Sì! Puoi aggiornare o downgrade il tuo piano in qualsiasi momento dalla Dashboard. Le modifiche entrano in vigore immediatamente.',
    keywords: ['cambiare', 'piano', 'upgrade', 'downgrade', 'modificare'],
    relatedTools: []
  },
  {
    id: 'faq-14',
    category: 'billing',
    question: 'Cosa succede se supero i limiti del piano?',
    answer: 'Riceverai una notifica quando ti avvicini ai limiti. Puoi aggiornare il piano o attendere il reset mensile. Alcune funzionalità potrebbero essere temporaneamente limitate.',
    keywords: ['limiti', 'superare', 'quota', 'limite', 'esaurito'],
    relatedTools: []
  },

  // Tecnico
  {
    id: 'faq-15',
    category: 'technical',
    question: 'I miei file sono sicuri?',
    answer: 'Assolutamente sì! Tutti i file vengono processati in modo sicuro e vengono eliminati automaticamente dopo 24 ore. Non condividiamo mai i tuoi file con terze parti.',
    keywords: ['sicurezza', 'privacy', 'sicuro', 'dati', 'protezione'],
    relatedTools: []
  },
  {
    id: 'faq-16',
    category: 'technical',
    question: 'Qual è la dimensione massima del file?',
    answer: 'Il limite dipende dal piano:\n- **Gratuito:** 10 MB per file\n- **Pro:** 100 MB per file\n- **Enterprise:** 500 MB per file\n\nPer file più grandi, contattaci per soluzioni personalizzate.',
    keywords: ['dimensione', 'dimensione massima', 'limite', 'size', 'mb'],
    relatedTools: []
  },
  {
    id: 'faq-17',
    category: 'technical',
    question: 'Il processo è veloce?',
    answer: 'Sì! La maggior parte dei processi viene completata in pochi secondi. I tempi dipendono dalla dimensione del file e dalla complessità dell\'operazione. I piani Pro hanno priorità più alta.',
    keywords: ['velocità', 'veloce', 'tempo', 'quanto', 'lento'],
    relatedTools: []
  },
  {
    id: 'faq-18',
    category: 'technical',
    question: 'Cosa succede se il processo fallisce?',
    answer: 'Se un processo fallisce, riceverai un messaggio di errore con dettagli. Puoi riprovare gratuitamente. Se il problema persiste, contatta il supporto con i dettagli dell\'errore.',
    keywords: ['errore', 'fallito', 'problema', 'non funziona', 'bug'],
    relatedTools: []
  },

  // Funzionalità
  {
    id: 'faq-19',
    category: 'features',
    question: 'Cosa sono i crediti?',
    answer: 'I crediti sono unità di consumo per le operazioni AI. Ogni operazione consuma un certo numero di crediti in base alla complessità. I crediti si ricaricano mensilmente o puoi acquistarli.',
    keywords: ['crediti', 'credits', 'consumo', 'unità'],
    relatedTools: []
  },
  {
    id: 'faq-20',
    category: 'features',
    question: 'Posso usare l\'API?',
    answer: 'Sì! Offriamo un\'API pubblica per sviluppatori. Visita la sezione API nella Dashboard per ottenere la tua API key e la documentazione completa.',
    keywords: ['api', 'sviluppatori', 'developer', 'integrazione'],
    relatedTools: []
  },
  {
    id: 'faq-21',
    category: 'features',
    question: 'C\'è un\'app mobile?',
    answer: 'Attualmente siamo disponibili solo come applicazione web responsive. Stiamo lavorando su app native iOS e Android. Iscriviti alla newsletter per essere aggiornato!',
    keywords: ['mobile', 'app', 'ios', 'android', 'telefono'],
    relatedTools: []
  }
];

// Funzione per cercare nella base di conoscenza
export function searchKnowledgeBase(query) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const lowerQuery = query.toLowerCase().trim();
  const words = lowerQuery.split(/\s+/);

  // Calcola score per ogni FAQ
  const scoredFAQs = faqDatabase.map(faq => {
    let score = 0;
    const lowerQuestion = faq.question.toLowerCase();
    const lowerAnswer = faq.answer.toLowerCase();
    const lowerKeywords = faq.keywords.map(k => k.toLowerCase());

    // Match esatto nella domanda (peso alto)
    if (lowerQuestion.includes(lowerQuery)) {
      score += 10;
    }

    // Match parziale nella domanda
    words.forEach(word => {
      if (lowerQuestion.includes(word)) {
        score += 5;
      }
    });

    // Match nelle keywords (peso medio)
    words.forEach(word => {
      if (lowerKeywords.some(k => k.includes(word) || lowerKeywords.includes(word))) {
        score += 3;
      }
    });

    // Match nella risposta (peso basso)
    words.forEach(word => {
      if (lowerAnswer.includes(word)) {
        score += 1;
      }
    });

    return { ...faq, score };
  });

  // Ordina per score e filtra
  return scoredFAQs
    .filter(faq => faq.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // Top 5 risultati
}

// Ottieni FAQ per categoria
export function getFAQsByCategory(category) {
  return faqDatabase.filter(faq => faq.category === category);
}

// Ottieni suggerimenti basati su query
export function getSuggestions(query) {
  if (!query || query.trim().length < 2) {
    // Suggerimenti di default
    return [
      'Come funziona l\'upscaling?',
      'Quali formati sono supportati?',
      'Come creo un account?',
      'I miei file sono sicuri?',
      'Quanto costa?'
    ];
  }

  const results = searchKnowledgeBase(query);
  return results.map(faq => faq.question);
}

// Ottieni FAQ correlata
export function getRelatedFAQs(faqId, limit = 3) {
  const faq = faqDatabase.find(f => f.id === faqId);
  if (!faq) return [];

  // Cerca FAQ con stessa categoria o strumenti correlati
  return faqDatabase
    .filter(f => 
      f.id !== faqId && 
      (f.category === faq.category || 
       f.relatedTools.some(tool => faq.relatedTools.includes(tool)))
    )
    .slice(0, limit);
}

