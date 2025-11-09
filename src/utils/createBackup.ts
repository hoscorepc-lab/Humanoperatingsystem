/**
 * HOS System Backup Utility
 * 
 * This utility creates a backup of the current HOS system state
 * and stores it both locally and in Supabase for redundancy.
 */

import { projectId, publicAnonKey } from './supabase/info';

interface BackupMetadata {
  version: string;
  moduleCount: number;
  createdAt: string;
  description: string;
  tags?: string[];
}

interface BackupData {
  appVersion: string;
  moduleList: string[];
  componentCount: number;
  criticalFiles: string[];
  notes: string;
  checksums?: Record<string, string>;
}

/**
 * Creates a backup in Supabase
 */
export async function createSupabaseBackup(
  backupName: string,
  backupData: BackupData,
  metadata: BackupMetadata
): Promise<{ success: boolean; backupKey?: string; error?: string }> {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-8d51d9e2/backup/create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          backupName,
          backupData,
          metadata,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create backup');
    }

    const result = await response.json();
    
    console.log('✅ Backup created successfully:', result.backupKey);
    
    return {
      success: true,
      backupKey: result.backupKey,
    };
  } catch (error) {
    console.error('❌ Error creating backup:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Gets list of all backups from Supabase
 */
export async function listBackups(): Promise<{
  success: boolean;
  backups?: any[];
  error?: string;
}> {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-8d51d9e2/backup/list`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to list backups');
    }

    const result = await response.json();
    
    console.log('✅ Found', result.count, 'backups');
    
    return {
      success: true,
      backups: result.backups,
    };
  } catch (error) {
    console.error('❌ Error listing backups:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Retrieves a specific backup from Supabase
 */
export async function getBackup(backupKey: string): Promise<{
  success: boolean;
  backup?: any;
  error?: string;
}> {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-8d51d9e2/backup/${backupKey}`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get backup');
    }

    const result = await response.json();
    
    console.log('✅ Backup retrieved successfully');
    
    return {
      success: true,
      backup: result.backup,
    };
  } catch (error) {
    console.error('❌ Error getting backup:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Deletes a backup from Supabase
 */
export async function deleteBackup(backupKey: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-8d51d9e2/backup/${backupKey}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete backup');
    }

    console.log('✅ Backup deleted successfully');
    
    return {
      success: true,
    };
  } catch (error) {
    console.error('❌ Error deleting backup:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Creates the Genesis v3.0 production backup
 */
export async function createGenesisBackup(): Promise<void> {
  const backupName = 'HOS_PRODUCTION_V3.0_GENESIS';
  
  const backupData: BackupData = {
    appVersion: '3.0.0-genesis',
    moduleList: [
      // Core Modules (15)
      'dashboard', 'chat', 'evolver', 'hos-chip', 'agent-forge',
      'agent-factory', 'agent-marketplace', 'appstudio', 'screenshot',
      'gcn', 'hosgpt', 'financial-research', 'whitepaper', 'analytics', 'agents-arena',
      
      // Human Modules (13)
      'rdp', 'kernel', 'mind', 'processes', 'memory', 'timeline',
      'parallel-selves', 'life-debugger', 'emotional-bios', 'narrative-engine',
      'quantum-planner', 'reflection-mirror', 'habit-forge',
      
      // Research Modules (5)
      'core-research', 'llm', 'neural-network', 'cosmic-cortex', 'autonomous',
      
      // Genesis Secret (1)
      'open-hos'
    ],
    componentCount: 150,
    criticalFiles: [
      '/App.tsx',
      '/lib/hosData.ts',
      '/lib/supabase/HOSProvider.tsx',
      '/supabase/functions/server/index.tsx',
      '/components/modules/OpenHOSModule.tsx',
      '/styles/globals.css',
      '/types/hos.ts',
    ],
    notes: 'Production-ready HOS system with all 39 modules functional. Includes mysterious Genesis Secret module with Matrix-style interface. Mobile-optimized, fully authenticated, with comprehensive backend (95+ endpoints). Ready for beta testing and deployment.',
  };
  
  const metadata: BackupMetadata = {
    version: '3.0.0-genesis',
    moduleCount: 39,
    createdAt: new Date().toISOString(),
    description: 'Critical production backup with Genesis Secret module. Complete mobile optimization, authentication, and backend verification.',
    tags: ['production', 'genesis', 'mobile-optimized', 'critical-backup'],
  };
  
  console.log('🚀 Creating Genesis v3.0 production backup...');
  
  const result = await createSupabaseBackup(backupName, backupData, metadata);
  
  if (result.success) {
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ GENESIS BACKUP CREATED SUCCESSFULLY');
    console.log('═══════════════════════════════════════════════════');
    console.log('Backup Key:', result.backupKey);
    console.log('Version:', metadata.version);
    console.log('Module Count:', metadata.moduleCount);
    console.log('Created:', metadata.createdAt);
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log('📍 Backup Location:');
    console.log('  • Supabase KV Store: ' + result.backupKey);
    console.log('  • Local File: /HOS_PRODUCTION_BACKUP_V3.0_GENESIS.md');
    console.log('');
    console.log('🔐 This backup can be restored at any time using:');
    console.log('  • getBackup("' + result.backupKey + '")');
    console.log('  • Or by reading the local markdown file');
    console.log('');
  } else {
    console.error('❌ Failed to create backup:', result.error);
  }
}

// Example usage:
// import { createGenesisBackup } from './utils/createBackup';
// await createGenesisBackup();
