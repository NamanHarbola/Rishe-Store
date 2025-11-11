import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Video } from 'lucide-react';
import { Button } from './ui/button';
import { fileToBase64, validateImageFile, validateVideoFile, validateFileSize } from '../utils/fileUpload';
import { toast } from 'sonner';

const FileUpload = ({ onUpload, accept = 'image/*', maxSize = 5, multiple = false, label = 'Upload Image' }) => {
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    console.log('Files selected:', files);
    setUploading(true);
    const uploadedFiles = [];

    try {
      for (const file of files) {
        console.log('Processing file:', file.name, file.type, file.size);
        
        // Validate file
        const isImage = accept.includes('image');
        const isVideo = accept.includes('video');
        
        if (isImage && !validateImageFile(file)) {
          toast.error(`${file.name} is not a valid image format`);
          continue;
        }
        
        if (isVideo && !validateVideoFile(file)) {
          toast.error(`${file.name} is not a valid video format`);
          continue;
        }

        if (!validateFileSize(file, maxSize)) {
          toast.error(`${file.name} exceeds ${maxSize}MB size limit`);
          continue;
        }

        // Convert to base64
        const base64 = await fileToBase64(file);
        console.log('File converted to base64, length:', base64.length);
        
        const fileData = {
          name: file.name,
          type: file.type,
          data: base64,
          preview: base64
        };
        
        uploadedFiles.push(fileData);
        console.log('File added to upload array');
      }

      if (uploadedFiles.length > 0) {
        console.log('Setting previews and calling onUpload');
        setPreviews(multiple ? [...previews, ...uploadedFiles] : uploadedFiles);
        onUpload(multiple ? uploadedFiles : uploadedFiles[0]);
        toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (index) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onUpload(multiple ? newPreviews : null);
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full"
      >
        <Upload className="mr-2" size={20} />
        {uploading ? 'Uploading...' : label}
      </Button>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {previews.map((file, index) => (
            <div key={index} className="relative group">
              {file.type.startsWith('image') ? (
                <img
                  src={file.preview}
                  alt={file.name}
                  className="w-full h-32 object-cover rounded-lg border"
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 rounded-lg border flex items-center justify-center">
                  <Video size={40} className="text-gray-400" />
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
              <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;