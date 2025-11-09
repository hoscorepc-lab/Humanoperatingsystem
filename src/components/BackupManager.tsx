import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Download, Upload, Trash2, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { 
  createGenesisBackup, 
  listBackups, 
  getBackup, 
  deleteBackup 
} from '../utils/createBackup';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface Backup {
  key: string;
  name: string;
  timestamp: string;
  version: string;
}

export function BackupManager() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      await createGenesisBackup();
      toast.success('System backup created successfully!', {
        description: 'Backup saved to Supabase and local storage.',
      });
      // Refresh the list
      await loadBackups();
    } catch (error) {
      toast.error('Failed to create backup', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBackups = async () => {
    setLoading(true);
    try {
      const result = await listBackups();
      if (result.success && result.backups) {
        setBackups(result.backups);
      }
    } catch (error) {
      toast.error('Failed to load backups', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = async (backupKey: string) => {
    try {
      const result = await getBackup(backupKey);
      if (result.success && result.backup) {
        // Create a downloadable JSON file
        const dataStr = JSON.stringify(result.backup, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${backupKey}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        toast.success('Backup downloaded successfully!');
      }
    } catch (error) {
      toast.error('Failed to download backup', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleDeleteBackup = async (backupKey: string) => {
    if (!confirm('Are you sure you want to delete this backup? This cannot be undone.')) {
      return;
    }

    try {
      const result = await deleteBackup(backupKey);
      if (result.success) {
        toast.success('Backup deleted successfully');
        await loadBackups();
      }
    } catch (error) {
      toast.error('Failed to delete backup', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleOpenManager = () => {
    setIsOpen(true);
    loadBackups();
  };

  return (
    <>
      {/* Trigger Button */}
      <Button
        onClick={handleOpenManager}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Database className="w-4 h-4" />
        Backup Manager
      </Button>

      {/* Backup Manager Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              System Backup Manager
            </DialogTitle>
            <DialogDescription>
              Create and manage system backups. All backups are stored in Supabase for redundancy.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Create Backup Section */}
            <Card className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Create New Backup</h3>
                  <p className="text-sm text-muted-foreground">
                    Creates a complete backup of the current HOS system state (v3.0 Genesis Edition with 39 modules)
                  </p>
                </div>
                <Button
                  onClick={handleCreateBackup}
                  disabled={loading}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {loading ? 'Creating...' : 'Create Backup'}
                </Button>
              </div>
            </Card>

            {/* Existing Backups List */}
            <div>
              <h3 className="font-semibold mb-3">Existing Backups</h3>
              
              {backups.length === 0 ? (
                <Card className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">No backups found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create your first backup to get started
                  </p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {backups.map((backup) => (
                    <Card key={backup.key} className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <h4 className="font-medium truncate">{backup.name}</h4>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Version: {backup.version}</span>
                            <span>•</span>
                            <span>{new Date(backup.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleDownloadBackup(backup.key)}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </Button>
                          <Button
                            onClick={() => handleDeleteBackup(backup.key)}
                            variant="outline"
                            size="sm"
                            className="gap-2 text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Info Section */}
            <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
              <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                📍 Backup Locations
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• <strong>Supabase KV Store:</strong> All backups are stored in the database</li>
                <li>• <strong>Local File:</strong> /HOS_PRODUCTION_BACKUP_V3.0_GENESIS.md</li>
                <li>• <strong>Download:</strong> Click download to save backup as JSON</li>
              </ul>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
