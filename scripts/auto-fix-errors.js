/**
 * Auto-fix common errors
 * Usage: npm run error:fix
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

const FIXES = [
  {
    name: 'ESLint Auto-fix',
    description: 'Run ESLint with --fix to auto-fix linting errors',
    command: 'npm run lint:fix',
    enabled: true,
  },
  {
    name: 'Prettier Format',
    description: 'Format code with Prettier',
    command: 'npm run format',
    enabled: true,
  },
  {
    name: 'Create Missing Directories',
    description: 'Create required directories if they don\'t exist',
    action: async () => {
      const dirs = ['logs', 'uploads', 'tmp'];
      for (const dir of dirs) {
        const dirPath = path.join(process.cwd(), dir);
        try {
          await fs.mkdir(dirPath, { recursive: true });
          console.log(`✅ Created directory: ${dir}`);
        } catch (error) {
          console.log(`⚠️  Directory ${dir} already exists or couldn't be created`);
        }
      }
    },
    enabled: true,
  },
  {
    name: 'Check Environment Variables',
    description: 'Validate required environment variables',
    action: async () => {
      const required = ['NODE_ENV'];
      const missing = required.filter(key => !process.env[key]);
      
      if (missing.length > 0) {
        console.log(`⚠️  Missing environment variables: ${missing.join(', ')}`);
        console.log('   Create a .env file with required variables');
      } else {
        console.log('✅ All required environment variables are set');
      }
    },
    enabled: true,
  },
];

async function main() {
  console.log('🔧 Auto-fixing common errors...\n');

  let fixedCount = 0;
  let errorCount = 0;

  for (const fix of FIXES) {
    if (!fix.enabled) continue;

    console.log(`\n🔨 ${fix.name}`);
    console.log(`   ${fix.description}`);

    try {
      if (fix.command) {
        const { stdout, stderr } = await execAsync(fix.command, {
          cwd: process.cwd(),
        });
        if (stdout) console.log(`   ${stdout.trim()}`);
        if (stderr && !stderr.includes('warning')) {
          console.log(`   ⚠️  ${stderr.trim()}`);
        }
        fixedCount++;
        console.log(`   ✅ Completed`);
      } else if (fix.action) {
        await fix.action();
        fixedCount++;
      }
    } catch (error) {
      errorCount++;
      console.log(`   ❌ Failed: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Fixed: ${fixedCount}`);
  if (errorCount > 0) {
    console.log(`❌ Errors: ${errorCount}`);
  }
  console.log('\n💡 Tip: Run "npm run diagnostics" for comprehensive health check');
}

main().catch(error => {
  console.error('❌ Auto-fix failed:', error.message);
  process.exit(1);
});

