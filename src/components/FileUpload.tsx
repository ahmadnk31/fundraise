import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UploadedFile } from '@/types';

interface FileUploadProps {
  onUpload: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: string[];
  uploadType: 'campaign' | 'profile' | 'update';
  disabled?: boolean;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB default
  accept = ['image/*', 'video/*'],
  uploadType,
  disabled = false,
  className,
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejectionReasons = rejectedFiles.map(({ file, errors }) => 
        `${file.name}: ${errors.map((e: any) => e.message).join(', ')}`
      ).join('; ');
      setError(`Some files were rejected: ${rejectionReasons}`);
    }

    // Add accepted files
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploadStatus: 'pending',
      uploadProgress: 0,
    }));

    setFiles(prev => {
      const updated = [...prev, ...newFiles];
      if (updated.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`);
        return prev;
      }
      return updated;
    });
  }, [maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    maxFiles,
    disabled: disabled || isUploading,
  });

  const removeFile = (index: number) => {
    setFiles(prev => {
      const updated = [...prev];
      // Revoke object URL to prevent memory leaks
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required');
      setIsUploading(false);
      return;
    }

    try {
      const uploadPromises = files.map(async (fileData, index) => {
        if (fileData.uploadStatus === 'success') return fileData;

        try {
          // Update status to uploading
          setFiles(prev => {
            const updated = [...prev];
            updated[index].uploadStatus = 'uploading';
            updated[index].uploadProgress = 0;
            return updated;
          });

          // Use direct upload endpoint
          const formData = new FormData();
          formData.append('file', fileData.file);
          formData.append('type', uploadType);

          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/upload/direct`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
          }

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.message || 'Upload failed');
          }

          // Update file with success data
          setFiles(prev => {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              uploadStatus: 'success',
              uploadProgress: 100,
              publicUrl: result.data.publicUrl,
              fileKey: result.data.fileKey,
            };
            return updated;
          });

          return {
            ...fileData,
            uploadStatus: 'success' as const,
            uploadProgress: 100,
            publicUrl: result.data.publicUrl,
            fileKey: result.data.fileKey,
          };
        } catch (error) {
          console.error('Upload error:', error);
          
          // Update file with error
          setFiles(prev => {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              uploadStatus: 'error',
              uploadProgress: 0,
              error: error instanceof Error ? error.message : 'Upload failed',
            };
            return updated;
          });

          return {
            ...fileData,
            uploadStatus: 'error' as const,
            uploadProgress: 0,
            error: error instanceof Error ? error.message : 'Upload failed',
          };
        }
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(file => file.uploadStatus === 'success');
      
      if (successfulUploads.length > 0) {
        onUpload(successfulUploads);
      }

      if (results.some(file => file.uploadStatus === 'error')) {
        setError('Some files failed to upload. Please try again.');
      }

    } catch (error) {
      console.error('Upload process error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="w-8 h-8" />;
    if (file.type.startsWith('video/')) return <Video className="w-8 h-8" />;
    return <FileText className="w-8 h-8" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
          disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''
        )}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-primary">Drop files here...</p>
        ) : (
          <div>
            <p className="text-lg font-medium">Click to upload or drag and drop</p>
            <p className="text-sm text-muted-foreground mt-2">
              {accept.join(', ')} up to {formatFileSize(maxSize)} each
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Maximum {maxFiles} files
            </p>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Selected Files ({files.length})</h4>
            <Button
              onClick={uploadFiles}
              disabled={isUploading || files.every(f => f.uploadStatus === 'success')}
              size="sm"
            >
              {isUploading ? 'Uploading...' : 'Upload Files'}
            </Button>
          </div>

          {files.map((fileData, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start gap-4">
                {/* File Icon/Preview */}
                <div className="flex-shrink-0">
                  {fileData.file.type.startsWith('image/') ? (
                    <img
                      src={fileData.preview}
                      alt={fileData.file.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                      {getFileIcon(fileData.file)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-grow">
                      <p className="font-medium truncate">{fileData.file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(fileData.file.size)}
                      </p>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      {fileData.uploadStatus === 'success' && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {fileData.uploadStatus === 'error' && (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={isUploading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {fileData.uploadStatus === 'uploading' && (
                    <div className="mt-2">
                      <Progress value={fileData.uploadProgress} className="h-2" />
                    </div>
                  )}

                  {/* Error Message */}
                  {fileData.uploadStatus === 'error' && fileData.error && (
                    <p className="text-sm text-red-500 mt-1">{fileData.error}</p>
                  )}

                  {/* Success Message */}
                  {fileData.uploadStatus === 'success' && (
                    <p className="text-sm text-green-600 mt-1">Uploaded successfully</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
