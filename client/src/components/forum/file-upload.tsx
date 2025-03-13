import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { UploadIcon, XIcon } from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface FileUploadProps {
  onChange: (files: File[]) => void;
  multiple?: boolean;
  maxSize?: number;
  disabled?: boolean;
}

export function FileUpload({ onChange, multiple = false, maxSize = 5 * 1024 * 1024, disabled = false }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    processFiles(Array.from(files));
  };
  
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = event.dataTransfer.files;
    if (!files.length) return;
    
    processFiles(Array.from(files));
  };
  
  const processFiles = (newFiles: File[]) => {
    setError(null);
    
    // Check file size
    const oversizedFiles = newFiles.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setError(`Some files exceed the maximum size of ${formatBytes(maxSize)}`);
      return;
    }
    
    // If not multiple, replace existing files
    const updatedFiles = multiple ? [...selectedFiles, ...newFiles] : newFiles;
    
    setSelectedFiles(updatedFiles);
    onChange(updatedFiles);
  };
  
  const removeFile = (index: number) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);
    onChange(updatedFiles);
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors ${
          isDragging ? "border-primary bg-primary-50" : "border-gray-300"
        } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={disabled ? undefined : triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          multiple={multiple}
          disabled={disabled}
        />
        <div className="flex flex-col items-center">
          <UploadIcon className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm font-medium text-gray-700">
            Drag and drop files here, or{" "}
            <span className="text-primary-600">browse</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Max file size: {formatBytes(maxSize)}
          </p>
        </div>
      </div>
      
      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}
      
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Selected files:</p>
          <ul className="space-y-2">
            {selectedFiles.map((file, index) => (
              <li 
                key={`${file.name}-${index}`} 
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-sm"
              >
                <div className="flex items-center">
                  <div className="mr-2">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="truncate max-w-xs">{file.name}</span>
                  <span className="ml-2 text-gray-400">({formatBytes(file.size)})</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  disabled={disabled}
                >
                  <XIcon className="h-4 w-4 text-gray-500" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
