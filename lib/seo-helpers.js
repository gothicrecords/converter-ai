// SEO Helpers for generating structured content for AI crawlers

export const toolSEOTemplates = {
  'rimozione-sfondo-ai': {
    faqItems: [
      {
        question: "Come funziona la rimozione dello sfondo con AI?",
        answer: "La nostra tecnologia AI utilizza algoritmi avanzati di deep learning per identificare automaticamente il soggetto principale dell'immagine e rimuovere lo sfondo con precisione. Il sistema analizza pixel per pixel per creare un ritaglio preciso e professionale."
      },
      {
        question: "Quali formati di immagine sono supportati?",
        answer: "Supportiamo tutti i formati immagine comuni: JPG, PNG, WEBP, GIF e BMP. Puoi caricare immagini fino a 10MB di dimensione."
      },
      {
        question: "La rimozione dello sfondo è gratuita?",
        answer: "Sì, offriamo un servizio gratuito per la rimozione dello sfondo. Per utenti PRO, offriamo elaborazioni più veloci e immagini ad alta risoluzione senza limiti."
      }
    ],
    howToSteps: [
      {
        name: "Carica l'immagine",
        text: "Trascina e rilascia la tua immagine nell'area di upload oppure clicca per selezionare un file dal tuo computer.",
      },
      {
        name: "Elaborazione automatica",
        text: "La nostra AI analizza automaticamente l'immagine, identifica il soggetto principale e rimuove lo sfondo con precisione.",
      },
      {
        name: "Scarica il risultato",
        text: "Una volta completata l'elaborazione, puoi scaricare l'immagine con sfondo trasparente in formato PNG ad alta qualità.",
      }
    ]
  },
  'upscaler': {
    faqItems: [
      {
        question: "Quanto posso aumentare la risoluzione di un'immagine?",
        answer: "Il nostro upscaler AI può aumentare la risoluzione delle immagini fino a 4x mantenendo alta qualità. Supportiamo upscaling 2x, 3x e 4x."
      },
      {
        question: "Quali formati di immagine posso upscalare?",
        answer: "Supportiamo JPG, PNG, WEBP e BMP. Puoi caricare immagini fino a 10MB."
      },
      {
        question: "L'upscaling mantiene la qualità originale?",
        answer: "Sì, il nostro algoritmo AI ricostruisce i dettagli mancanti utilizzando tecniche avanzate di deep learning, mantenendo e migliorando la qualità visiva."
      }
    ],
    howToSteps: [
      {
        name: "Carica l'immagine",
        text: "Seleziona l'immagine che vuoi migliorare dalla tua libreria.",
      },
      {
        name: "Scegli il fattore di upscaling",
        text: "Seleziona il livello di upscaling desiderato (2x, 3x o 4x).",
      },
      {
        name: "Scarica l'immagine migliorata",
        text: "Dopo l'elaborazione, scarica la tua immagine ad alta risoluzione.",
      }
    ]
  },
  'ocr-avanzato-ai': {
    faqItems: [
      {
        question: "Da quali formati posso estrarre testo?",
        answer: "Puoi estrarre testo da immagini (JPG, PNG), PDF scansionati, e documenti digitalizzati. Supportiamo anche immagini con testo scritto a mano (con accuratezza variabile)."
      },
      {
        question: "Quanto è accurato l'OCR?",
        answer: "Il nostro OCR AI ha un'accuratezza superiore al 95% per testi stampati chiari. Per testi scritti a mano o immagini di bassa qualità, l'accuratezza può variare."
      },
      {
        question: "Posso estrarre testo da più lingue?",
        answer: "Sì, supportiamo oltre 100 lingue, inclusi italiano, inglese, spagnolo, francese, tedesco, cinese, giapponese e molte altre."
      }
    ],
    howToSteps: [
      {
        name: "Carica il documento",
        text: "Carica l'immagine o PDF da cui vuoi estrarre il testo.",
      },
      {
        name: "Elaborazione OCR",
        text: "La nostra AI analizza il documento e estrae tutto il testo rilevabile.",
      },
      {
        name: "Copia o scarica il testo",
        text: "Copia il testo estratto o scaricalo come file TXT o DOCX.",
      }
    ]
  }
};

export function getToolSEOData(toolSlug) {
  return toolSEOTemplates[toolSlug] || {
    faqItems: [],
    howToSteps: []
  };
}

export function generateToolDescription(tool) {
  const descriptions = {
    'rimozione-sfondo-ai': 'Rimuovi lo sfondo da qualsiasi immagine con un click usando l\'intelligenza artificiale. Soggetto rilevato automaticamente, qualità professionale, ritaglio preciso.',
    'upscaler': 'Migliora la risoluzione delle tue immagini fino a 4x usando AI avanzata. Ricostruzione dettagli, qualità professionale, risultati istantanei.',
    'ocr-avanzato-ai': 'Estrai testo da immagini, PDF e documenti scansionati con OCR AI avanzato. Supporta 100+ lingue, alta accuratezza, esportazione multipla.',
    'generazione-immagini-ai': 'Crea immagini uniche da descrizioni testuali usando intelligenza artificiale generativa. Stili multipli, alta qualità, risultati creativi.',
    'traduzione-documenti-ai': 'Traduci interi documenti mantenendo la formattazione originale. Supporta 100+ lingue, traduzione contestuale, preservazione layout.',
    'trascrizione-audio': 'Converti file audio e vocali in testo modificabile. Supporta MP3, WAV, M4A, trascrizione accurata, timestamp opzionali.',
    'riassunto-testo': 'Sintetizza testi lunghi in riassunti chiari e concisi. Estrazione concetti chiave, lunghezza personalizzabile, alta qualità.',
    'correttore-grammaticale': 'Correggi errori grammaticali e migliora lo stile del tuo testo. Controllo ortografia, suggerimenti stilistici, supporto multilingua.',
    'combina-splitta-pdf': 'Unisci più PDF in un unico file o dividi un PDF in più parti. Operazioni rapide, preservazione qualità, interfaccia intuitiva.',
    'thumbnail-generator': 'Crea miniature accattivanti per video e social media. Design personalizzabile, dimensioni multiple, esportazione veloce.',
    'compressione-video': 'Riduci le dimensioni dei tuoi file video senza perdere qualità. Compressione intelligente, formati multipli, risultati ottimali.',
    'clean-noise-ai': 'Rimuovi rumore di fondo e migliora la qualità dei tuoi audio. Pulizia automatica, preservazione voce, risultati professionali.'
  };
  
  return descriptions[tool] || 'Strumento AI professionale per elaborazione avanzata. Veloce, sicuro e gratuito.';
}

