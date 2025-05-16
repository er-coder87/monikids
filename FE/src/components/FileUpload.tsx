import React, { useState, useRef, ChangeEvent } from 'react';
import { Expense } from '../models/Expense';
import { uploadBankStatement } from '../services/BankStatementApi'; // Import the API function
import { Upload, FileText } from 'lucide-react';

interface FileUploadProps {
  onExpensesUploaded: (newExpenses: Expense[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onExpensesUploaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedPdfFile(file);
      setSelectedPdfUrl(URL.createObjectURL(file));
      setSelectedFileName(file.name);
      setUploadSuccess(null);
      setUploadError(null);
    } else if (file) {
      alert('Please select a PDF file.');
      setSelectedPdfFile(null);
      setSelectedPdfUrl(null);
      setSelectedFileName(null);
    } else {
      setSelectedPdfFile(null);
      setSelectedPdfUrl(null);
      setSelectedFileName(null);
    }
  };

  const handleSubmitClick = async () => {
    if (!selectedPdfFile) {
      alert('Please select a PDF file to upload.');
      return;
    }

    setUploading(true);
    setUploadSuccess(null);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', selectedPdfFile);

    try {
      const newExpenses = await uploadBankStatement(formData); // Call the imported API function
      onExpensesUploaded(newExpenses);
      setSelectedPdfFile(null);
      setSelectedPdfUrl(null);
      setSelectedFileName(null);
      setUploadSuccess(true);
    } catch (error: any) {
      console.error('File upload failed:', error.message);
      setUploadError(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Upload Expenses</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">PDF, CSV, or Excel files</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.csv,.xlsx,.xls"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        </div>

        {selectedPdfUrl && (
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{selectedFileName}</span>
            </div>
            <button
              onClick={handleSubmitClick}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        )}
      </div>
      {uploadSuccess === true && <p className="mt-4 text-green-500 font-semibold">Upload successful!</p>}
      {uploadError && <p className="mt-4 text-red-500 font-semibold">{uploadError}</p>}
    </div>
  );
};

export default FileUpload;
