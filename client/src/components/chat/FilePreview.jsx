// src/components/chat/FilePreview.jsx - File Display Component
import { Download, File, FileText, Image as ImageIcon, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FilePreview = ({ fileUrl, fileName, fileType, fileSize, mimeType, isOwn }) => {

  const serverUrl = import.meta.env.VITE_SERVER_URL || 'https://tlearnapp.onrender.com';

  const fullFileUrl = fileUrl.startsWith('http') ? fileUrl : `${serverUrl}${fileUrl}`;

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = () => {
    if (fileType === 'image') return <ImageIcon className="w-5 h-5" />;
    if (fileType === 'video') return <Video className="w-5 h-5" />;
    if (mimeType?.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5" />;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fullFileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Image Preview
  if (fileType === 'image') {
    return (
      <div className={`max-w-sm ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
        <div className="relative group">
          <img
            src={fullFileUrl}
            alt={fileName}
            className="rounded-lg max-h-80 w-full object-cover cursor-pointer"
            onClick={() => window.open(fullFileUrl, '_blank')}
          />
          
          {/* Overlay with download button */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-1 truncate">
          {fileName} • {formatFileSize(fileSize)}
        </p>
      </div>
    );
  }

  // Video Preview
  if (fileType === 'video') {
    return (
      <div className={`max-w-sm ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
        <video
          controls
          className="rounded-lg max-h-80 w-full"
          src={fullFileUrl}
        />
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500 truncate flex-1">
            {fileName} • {formatFileSize(fileSize)}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Document/File Card
  return (
    <div className={`max-w-sm ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
      <div
        className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${
          isOwn
            ? 'bg-forest/10 border-forest/20'
            : 'bg-white dark:bg-card'
        }`}
        onClick={() => window.open(fullFileUrl, '_blank')}
      >
        <div className={`flex-shrink-0 w-12 h-12 rounded flex items-center justify-center ${
          isOwn ? 'bg-forest/20' : 'bg-gray-100 dark:bg-gray-800'
        }`}>
          {getFileIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {fileName}
          </p>
          <p className="text-xs text-gray-500">
            {formatFileSize(fileSize)}
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default FilePreview;