import React, { useState, useRef, useEffect } from "react";
import { Download, Upload, Save, List, RefreshCw } from "lucide-react"; // Key import removed
import { supabase } from "../utils/supabaseClient";
import { encryptData, decryptData } from "../utils/encryption";
import { CVData } from "../types/cv";
import Toast from "./Toast";
// CopyButton import removed as it's no longer needed
import CryptoJS from 'crypto-js';

interface BackupRestoreProps {
  cvData: CVData | null;
  onDataChange?: () => void;
  setCvData: (data: CVData) => void;
}

// SecretKeyState interface removed as it's no longer needed

interface Backup {
  id: string;
  backup_number: number;
  created_at: string;
  data?: string; // Encrypted data
}

const BackupRestore: React.FC<BackupRestoreProps> = ({ cvData, onDataChange, setCvData }) => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showBackups, setShowBackups] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // Secret key state variables removed as they are no longer needed

  // Fetch backups when showBackups is true
  useEffect(() => {
    if (showBackups) {
      fetchBackups();
    }
  }, [showBackups]);

  // Function to get environment variables consistently
  const getEnv = (key: string): string => {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key] as string;
    }
    return '';
  };

  // Encryption key fetching useEffect removed as it's no longer needed

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('backup-restore')
        .select('id, backup_number, created_at')
        .order('backup_number', { ascending: true });

      if (error) {
        throw error;
      }

      setBackups(data || []);
    } catch (error) {
      console.error('Error fetching backups:', error);
      setToast({ message: 'Failed to fetch backups', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    if (!cvData) return;
    
    setLoading(true);
    try {
      // 1. Get current backups to determine new backup number
      const { data: currentBackups, error: fetchError } = await supabase
        .from('backup-restore')
        .select('id,backup_number')
        .order('backup_number', { ascending: true });

      if (fetchError) throw fetchError;

      // 2. Shift existing backup numbers (increment all by 1)
      if (currentBackups && currentBackups.length > 0) {
        const updatePromises = currentBackups.map(backup => 
          supabase
            .from('backup-restore')
            .update({ backup_number: backup.backup_number + 1 })
            .eq('id', backup.id)
        );
        
        await Promise.all(updatePromises);
      }

      // 3. Insert new backup with number 0 (latest)
      const now = new Date();
      // Convert to GMT+6 (Bangladesh Time)
      const bdTime = new Date(now.getTime() + 6 * 60 * 60 * 1000);
      const createdAt = `Backup created at ${bdTime.toISOString().slice(0, 10)} + ${bdTime.toISOString().slice(11, 19)} BD`;
      
      const { error: insertError } = await supabase
        .from('backup-restore')
        .insert([{ 
          data: encryptData(await fetchCVDataFromSupabase()),
          created_at: createdAt,
          backup_number: 0
        }]);

      if (insertError) throw insertError;

      // 4. Delete backups with backup_number >= 3 (keep only 0, 1, 2)
      const { error: deleteError } = await supabase
        .from('backup-restore')
        .delete()
        .gte('backup_number', 3);

      if (deleteError) throw deleteError;

      setToast({ message: 'Backup created successfully!', type: 'success' });
      
      // Refresh the backup list if it's currently shown
      if (showBackups) {
        fetchBackups();
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      setToast({ message: 'Failed to create backup', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCVDataFromSupabase = async () => {
    try {
      const { data, error } = await supabase.from('cv_data').select('*');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching CV data:', error);
      throw error;
    }
  };

  const downloadBackup = async (backupId: string) => {
    try {
      setLoading(true);
      
      // Fetch the specific backup
      const { data: backup, error } = await supabase
        .from('backup-restore')
        .select('*')
        .eq('id', backupId)
        .single();

      if (error) throw error;
      if (!backup) throw new Error('Backup not found');

      // Decrypt the data
      const decryptedData = decryptData(backup.data);
      if (!decryptedData) throw new Error('Failed to decrypt backup data');

      // Create and download the file
      const now = new Date();
      const bdTime = new Date(now.getTime() + 6 * 60 * 60 * 1000);
      const date = bdTime.toISOString().slice(0, 10);
      const time = bdTime.toISOString().slice(11, 19).replace(/:/g, '-');
      const filename = `ronydb_backup_${date}_${time}_BD.json`;
      
      const dataStr = JSON.stringify(decryptedData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      
      URL.revokeObjectURL(url);
      setToast({ message: 'Backup downloaded successfully!', type: 'success' });
    } catch (error) {
      console.error('Error downloading backup:', error);
      setToast({ message: 'Failed to download backup', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const restoreBackup = async (backupId: string) => {
    try {
      setLoading(true);
      
      // Fetch the specific backup
      const { data: backup, error } = await supabase
        .from('backup-restore')
        .select('*')
        .eq('id', backupId)
        .single();

      if (error) throw error;
      if (!backup) throw new Error('Backup not found');

      // Decrypt the data
      const decryptedData = decryptData(backup.data);
      if (!decryptedData) throw new Error('Failed to decrypt backup data');

      // Restore to cv_data table
      for (const record of decryptedData) {
        const { error: updateError } = await supabase
          .from('cv_data')
          .upsert([record], { onConflict: ['id'] });

        if (updateError) throw updateError;
      }

      // Update the UI with the restored data
      // Make sure decryptedData is in the correct format
      if (decryptedData && typeof decryptedData === 'object') {
        setCvData(decryptedData);
        
        // Ensure the parent component is updated
        if (onDataChange) {
          // Use setTimeout to ensure the state update happens after the current execution context
          setTimeout(() => {
            onDataChange();
            // Reload the page after data restoration
            window.location.reload();
          }, 0);
        }
      } else {
        throw new Error('Invalid data format after decryption');
      }
      
      setToast({ message: 'Backup restored successfully!', type: 'success' });
    } catch (error) {
      console.error('Error restoring backup:', error);
      setToast({ message: 'Failed to restore backup', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const text = await file.text();
      const json = JSON.parse(text);
      
      // Basic validation
      if (!Array.isArray(json)) {
        throw new Error('Invalid backup file format');
      }
      
      // Restore to cv_data table
      for (const record of json) {
        const { error: updateError } = await supabase
          .from('cv_data')
          .upsert([record], { onConflict: ['id'] });

        if (updateError) throw updateError;
      }

      // Update the UI with the restored data
      const decryptedData = decryptData(json[0].data);
      
      // Make sure decryptedData is in the correct format
      if (decryptedData && typeof decryptedData === 'object') {
        setCvData(decryptedData);
        
        // Ensure the parent component is updated
        if (onDataChange) {
          // Use setTimeout to ensure the state update happens after the current execution context
          setTimeout(() => {
            onDataChange();
            // Reload the page after data restoration
            window.location.reload();
          }, 0);
        }
      } else {
        throw new Error('Invalid data format after decryption');
      }
      
      setToast({ message: 'Backup file restored successfully!', type: 'success' });
    } catch (error) {
      console.error('Error restoring from file:', error);
      setToast({ message: 'Failed to restore from file', type: 'error' });
    } finally {
      setLoading(false);
      // Reset the file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // handleChangeEncryptionKey function removed as it's no longer needed

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Backup */}
        <div className="bg-card border border-border rounded-lg p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4">Backup</h3>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={createBackup}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Create Backup
              </button>
              
              <button
                onClick={() => setShowBackups(!showBackups)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
              >
                <List className="w-4 h-4" />
                {showBackups ? 'Hide Backups' : 'Show Backups'}
              </button>
            </div>

            {showBackups && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Available Backups</h4>
                  <button 
                    onClick={fetchBackups}
                    className="p-1 text-primary hover:text-blue-600 transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                
                {loading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : backups.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No backups found</div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {backups.map((backup) => (
                      <div 
                        key={backup.id} 
                        className="flex items-center justify-between p-3 bg-row border border-border rounded-md"
                      >
                        <div>
                          <div className="font-medium">Backup #{backup.backup_number}</div>
                          <div className="text-sm text-gray-500">{backup.created_at}</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => downloadBackup(backup.id)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => restoreBackup(backup.id)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-md transition-colors"
                            title="Restore"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Restore */}
        <div className="bg-card border border-border rounded-lg p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4">Restore</h3>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Upload a backup file to restore your data. This will replace your current data.
            </p>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                Upload & Restore Backup
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="application/json"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Change Secret Key Section removed as it's no longer needed */}

      {/* Toast notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default BackupRestore;