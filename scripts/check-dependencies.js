#!/usr/bin/env node
/**
 * Script per verificare che LibreOffice, Pandoc e djvulibre siano installati
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
const execAsync = promisify(exec);

const isWindows = process.platform === 'win32';

async function commandExists(command) {
  const checkCmd = isWindows ? `where ${command} 2>nul` : `which ${command}`;
  try {
    const { stdout } = await execAsync(checkCmd);
    return stdout.trim().length > 0;
  } catch {
    return false;
  }
}

function findLibreOffice() {
  if (isWindows) {
    const paths = [
      process.env.PROGRAMFILES + '\\LibreOffice\\program\\soffice.exe',
      process.env['PROGRAMFILES(X86)'] + '\\LibreOffice\\program\\soffice.exe',
      'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
      'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe'
    ];
    
    for (const p of paths) {
      if (p && fs.existsSync(p)) {
        return p;
      }
    }
  }
  return null;
}

function findDjvuLibre() {
  if (isWindows) {
    const paths = [
      'C:\\Program Files\\djvulibre\\bin\\ddjvu.exe',
      'C:\\Program Files (x86)\\djvulibre\\bin\\ddjvu.exe'
    ];
    
    for (const p of paths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
  }
  return null;
}

async function checkLibreOffice() {
  const found = findLibreOffice();
  if (found) {
    try {
      const { stdout } = await execAsync(`"${found}" --version`);
      console.log('✅ LibreOffice trovato:', found);
      console.log('   Versione:', stdout.trim().split('\n')[0]);
      return true;
    } catch (e) {
      console.log('⚠️  LibreOffice trovato ma non funzionante:', found);
      return false;
    }
  }
  
  if (isWindows && await commandExists('soffice.exe')) {
    try {
      const { stdout } = await execAsync('soffice.exe --version');
      console.log('✅ LibreOffice trovato nel PATH');
      console.log('   Versione:', stdout.trim().split('\n')[0]);
      return true;
    } catch {}
  }
  
  if (!isWindows && await commandExists('soffice')) {
    try {
      const { stdout } = await execAsync('soffice --version');
      console.log('✅ LibreOffice trovato nel PATH');
      console.log('   Versione:', stdout.trim().split('\n')[0]);
      return true;
    } catch {}
  }
  
  console.log('❌ LibreOffice non trovato');
  console.log('   Installa da: https://www.libreoffice.org/download/');
  return false;
}

async function checkPandoc() {
  const cmd = isWindows ? 'pandoc.exe' : 'pandoc';
  
  // Su Windows, cerca anche in percorsi comuni
  if (isWindows) {
    const possiblePaths = [
      'C:\\Program Files\\Pandoc\\pandoc.exe',
      process.env.PROGRAMFILES + '\\Pandoc\\pandoc.exe',
      process.env.LOCALAPPDATA + '\\Pandoc\\pandoc.exe',
      'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Pandoc\\pandoc.exe'
    ];
    
    for (const p of possiblePaths) {
      if (p && fs.existsSync(p)) {
        try {
          const { stdout } = await execAsync(`"${p}" --version`);
          console.log('✅ Pandoc trovato:', p);
          console.log('   Versione:', stdout.trim().split('\n')[0]);
          return true;
        } catch {}
      }
    }
  }
  
  // Verifica nel PATH
  if (await commandExists(cmd)) {
    try {
      const { stdout } = await execAsync(`${cmd} --version`);
      console.log('✅ Pandoc trovato nel PATH');
      console.log('   Versione:', stdout.trim().split('\n')[0]);
      return true;
    } catch {}
  }
  
  console.log('❌ Pandoc non trovato');
  console.log('   Installa da: https://pandoc.org/installing.html');
  console.log('   Dopo l\'installazione, riavvia il terminale per aggiornare il PATH');
  return false;
}

async function checkDjvuLibre() {
  const found = findDjvuLibre();
  if (found) {
    try {
      const { stdout } = await execAsync(`"${found}" --version`);
      console.log('✅ djvulibre trovato:', found);
      console.log('   Versione:', stdout.trim().split('\n')[0]);
      return true;
    } catch {}
  }
  
  // Su Windows, cerca anche in percorsi comuni
  if (isWindows) {
    const possiblePaths = [
      'C:\\Program Files\\djvulibre\\bin\\ddjvu.exe',
      'C:\\Program Files (x86)\\djvulibre\\bin\\ddjvu.exe',
      process.env.PROGRAMFILES + '\\djvulibre\\bin\\ddjvu.exe',
      process.env['PROGRAMFILES(X86)'] + '\\djvulibre\\bin\\ddjvu.exe'
    ];
    
    for (const p of possiblePaths) {
      if (p && fs.existsSync(p)) {
        try {
          const { stdout } = await execAsync(`"${p}" --version`);
          console.log('✅ djvulibre trovato:', p);
          console.log('   Versione:', stdout.trim().split('\n')[0]);
          return true;
        } catch {}
      }
    }
  }
  
  // Verifica nel PATH
  const cmd = isWindows ? 'ddjvu.exe' : 'ddjvu';
  if (await commandExists(cmd)) {
    try {
      const { stdout } = await execAsync(`${cmd} --version`);
      console.log('✅ djvulibre trovato nel PATH');
      return true;
    } catch {}
  }
  
  console.log('❌ djvulibre non trovato');
  if (isWindows) {
    console.log('   Installa da: https://sourceforge.net/projects/djvu/files/');
    console.log('   Dopo l\'installazione, riavvia il terminale per aggiornare il PATH');
  } else {
    console.log('   Installa con: sudo apt install djvulibre-bin (Ubuntu/Debian) o brew install djvulibre (macOS)');
  }
  return false;
}

async function main() {
  console.log('🔍 Verifica dipendenze per i convertitori documentali...\n');
  
  const libreOffice = await checkLibreOffice();
  console.log('');
  
  const pandoc = await checkPandoc();
  console.log('');
  
  const djvuLibre = await checkDjvuLibre();
  console.log('');
  
  console.log('📊 Riepilogo:');
  console.log(`   LibreOffice: ${libreOffice ? '✅ Installato' : '❌ Non installato'}`);
  console.log(`   Pandoc: ${pandoc ? '✅ Installato' : '❌ Non installato'}`);
  console.log(`   djvulibre: ${djvuLibre ? '✅ Installato' : '❌ Non installato'}`);
  
  if (!libreOffice && !pandoc && !djvuLibre) {
    console.log('\n⚠️  Nessuna dipendenza trovata. Alcuni convertitori non funzioneranno.');
    console.log('   Consulta la documentazione per le istruzioni di installazione.');
  } else {
    console.log('\n✅ Alcune dipendenze sono disponibili. I convertitori corrispondenti funzioneranno.');
  }
}

main().catch(console.error);

