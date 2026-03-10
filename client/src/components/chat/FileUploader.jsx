// src/components/chat/FileUploader.jsx - File Upload Component
import { useState, useRef } from 'react';
import { Upload, X, File, Image, FileText, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const FileUploader = ({ onUpload, onCancel }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <Image className="w-12 h-12 text-blue-500" />;
    if (type.startsWith('video/')) return <Video className="w-12 h-12 text-purple-500" />;
    if (type.includes('pdf')) return <FileText className="w-12 h-12 text-red-500" />;
    return <File className="w-12 h-12 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large! Maximum size is 10MB');
      return;
    }

    setSelectedFile(file);

    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSend = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      setSelectedFile(null);
      setPreview(null);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    onCancel();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-4 bg-white dark:bg-card border rounded-lg"
    >
      {!selectedFile ? (
        // File Picker
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-forest bg-forest/5'
              : 'border-gray-300 dark:border-gray-700'
          }`}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Drag & drop a file here, or click to browse
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Images, documents, videos (max 10MB)
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,video/mp4,video/webm"
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />
          
          <div className="flex gap-2 justify-center">
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-forest hover:bg-forest/90"
            >
              Choose File
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        // File Preview
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded"
              />
            ) : (
              <div className="w-20 h-20 flex items-center justify-center bg-gray-200 dark:bg-gray-800 rounded">
                {getFileIcon(selectedFile.type)}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedFile(null);
                setPreview(null);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              className="bg-forest hover:bg-forest/90"
            >
              Send File
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FileUploader;