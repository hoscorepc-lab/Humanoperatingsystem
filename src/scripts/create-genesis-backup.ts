#!/usr/bin/env node

/**
 * Genesis Backup Script
 * 
 * This script creates a complete backup of the HOS v3.0 Genesis system
 * and stores it in Supabase for safe keeping.
 * 
 * Usage:
 *   node scripts/create-genesis-backup.ts
 * 
 * Or programmatically:
 *   import './scripts/create-genesis-backup'
 */

import { createGenesisBackup } from '../utils/createBackup';

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('🚀 HOS GENESIS BACKUP SCRIPT');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log('Creating backup of HOS v3.0 - Genesis Edition');
  console.log('Total Modules: 39');
  console.log('Status: Production Ready');
  console.log('');
  console.log('This may take a moment...');
  console.log('');
  
  try {
    await createGenesisBackup();
    
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('🎉 SUCCESS! BACKUP COMPLETE');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log('Your HOS system has been backed up to:');
    console.log('  1. Supabase KV Store (database)');
    console.log('  2. Local markdown file');
    console.log('');
    console.log('You can:');
    console.log('  • View backups in the Backup Manager');
    console.log('  • Download backups as JSON');
    console.log('  • Restore at any time');
    console.log('');
    console.log('See BACKUP_COMPLETE_README.md for full details.');
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════');
    console.error('❌ ERROR: BACKUP FAILED');
    console.error('═══════════════════════════════════════════════════');
    console.error('');
    console.error('Error details:', error);
    console.error('');
    console.error('Please check:');
    console.error('  • Supabase connection');
    console.error('  • Environment variables');
    console.error('  • Network connectivity');
    console.error('');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as createBackup };
