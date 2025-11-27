# Installazione Poppler su Windows

Poppler è richiesto per alcune funzionalità di conversione PDF (come `pdf2image`), ma il backend ora usa PyMuPDF come fallback automatico se Poppler non è installato.

## Opzione 1: Installazione Manuale (Raccomandato)

1. Scarica Poppler per Windows da: https://github.com/oschwartz10612/poppler-windows/releases
2. Scarica l'ultima versione (es. `Release-23.11.0-0.zip`)
3. Estrai il file ZIP in una cartella (es. `C:\poppler`)
4. Aggiungi la cartella `bin` al PATH di Windows:
   - Apri "Variabili d'ambiente" dal Pannello di controllo
   - Modifica la variabile `Path` e aggiungi `C:\poppler\Library\bin`
   - Riavvia il terminale/PowerShell

## Opzione 2: Usa il Fallback Automatico (Già Implementato)

Il backend ora usa automaticamente PyMuPDF (fitz) come fallback se Poppler non è disponibile. Questo significa che:
- ✅ Non è necessario installare Poppler per far funzionare il backend
- ✅ Le conversioni PDF funzioneranno comunque
- ⚠️ Alcune funzionalità avanzate potrebbero essere leggermente diverse

## Verifica Installazione

Per verificare se Poppler è installato correttamente:

```bash
python -c "from pdf2image import convert_from_bytes; print('Poppler OK')"
```

Se vedi un errore, il backend userà automaticamente PyMuPDF come fallback.

