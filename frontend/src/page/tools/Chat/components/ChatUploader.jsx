import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Loader2, UploadCloud, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatUploader = ({ disabled, onNewUpload, onExtractionComplete, extractionResult, onStartConversation }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Access the UPLOAD API URL
  const uploadApiUrl = import.meta.env.VITE_UPLOAD_API_URL;

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleUpload = async (acceptedFile) => {
    if (disabled) return;

    setFile(acceptedFile);
    setIsUploading(true);
    setError('');
    onNewUpload(); 

    const formData = new FormData();
    formData.append('file', acceptedFile);

    try {
      const xhr = new XMLHttpRequest();
      // MODIFIED: Used the uploadApiUrl environment variable
      xhr.open('POST', `${uploadApiUrl}/api/upload`, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      };
      
      xhr.onload = () => {
        setIsUploading(false);
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          onExtractionComplete({
              ...response.data,
              fileName: acceptedFile.name,
              fileSize: acceptedFile.size,
          });
        } else {
          const errorResponse = JSON.parse(xhr.responseText);
          setError(errorResponse.error || 'Upload failed. Please try again.');
          setFile(null);
        }
      };

      xhr.onerror = () => {
        setError('A network error occurred. Please check your connection.');
        setIsUploading(false);
        setFile(null);
      };
      
      xhr.send(formData);

    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
      setIsUploading(false);
      setFile(null);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      handleUpload(acceptedFiles[0]);
    }
  }, [disabled, uploadApiUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    disabled: isUploading || disabled || !!extractionResult,
    multiple: false,
  });

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setError('');
    setUploadProgress(0);
    onNewUpload();
  };
  
  const UploaderContent = () => {
    if (extractionResult || file) {
      return (
        <motion.div
          key="result"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative flex flex-col items-center justify-center text-center p-8 w-full h-full"
        >
          <button 
            onClick={removeFile} 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Remove file"
          >
            <X size={24} />
          </button>
          
          <FileText className="w-12 h-12 text-teal-500" />
          
          <p className="font-semibold text-gray-800 truncate mt-4 max-w-full px-4">
            {extractionResult?.fileName || file?.name}
          </p>
          
          <div className="flex justify-center gap-2 text-sm text-gray-500 mt-1">
            {extractionResult?.fileSize ? (
              <span>{formatBytes(extractionResult.fileSize)}</span>
            ) : file?.size ? (
              <span>{formatBytes(file.size)}</span>
            ) : null}

            {extractionResult?.pageCount && (
              <>
                <span className="text-gray-300">|</span>
                <span>{extractionResult.pageCount} Pages</span>
              </>
            )}

            {extractionResult?.tokenCount && (
              <>
                <span className="text-gray-300">|</span>
                <span>{extractionResult.tokenCount.toLocaleString()} Tokens</span>
              </>
            )}
          </div>

          {isUploading && (
            <div className="w-full max-w-xs mx-auto mt-4">
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <motion.div 
                  className="bg-teal-500 h-1.5 rounded-full" 
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.5, ease: 'linear' }}
                />
              </div>
              <p className="text-teal-600 text-sm font-medium mt-2 animate-pulse">Processing...</p>
            </div>
          )}
          
          {extractionResult && !isUploading && (
            <div className="mt-6 w-full">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStartConversation}
                className="w-full max-w-xs mx-auto px-6 py-3 rounded-lg font-bold bg-teal-500 text-white shadow-md hover:bg-teal-600 transition-all"
              >
                Start Chat
              </motion.button>
            </div>
          )}
        </motion.div>
      );
    }

    return (
      <motion.div
        key="initial"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex flex-col items-center justify-center text-center space-y-2 h-full"
      >
        <UploadCloud className={`w-12 h-12 mb-2 ${isDragActive ? 'text-teal-500' : 'text-gray-400'}`} strokeWidth={1} />
        <p className="text-lg font-medium text-gray-600">
          {isDragActive ? 'Drop the PDF here...' : 'Drag & Drop or Click to Upload'}
        </p>
        <p className="text-gray-500 text-sm">PDF only, max 32MB</p>
      </motion.div>
    );
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div
        {...getRootProps()}
        className={`relative w-full h-72 flex items-center justify-center border-2 border-dashed rounded-2xl transition-all duration-300 ease-in-out
          ${isDragActive ? 'border-teal-500 bg-teal-50' : 'border-gray-300'}
          ${(disabled || !!extractionResult) ? 'cursor-not-allowed bg-gray-50 border-gray-200' : 'hover:border-teal-400 cursor-pointer bg-gray-50/50'}
          ${error ? 'border-red-500 bg-red-50' : ''}`}
      >
        <input {...getInputProps()} />
        <AnimatePresence mode="wait">
          <UploaderContent />
        </AnimatePresence>
      </div>
      
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-red-100 border border-red-200 text-red-800 text-sm font-medium rounded-lg flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="p-1 rounded-full hover:bg-red-200 transition-colors">
              <X className="w-5 h-5"/>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {disabled && !error && (
        <p className="mt-4 text-center text-sm font-semibold text-orange-600 bg-orange-100 p-3 rounded-lg">
            You have reached your document upload limit.
        </p>
      )}
    </div>
  );
};

export default ChatUploader;