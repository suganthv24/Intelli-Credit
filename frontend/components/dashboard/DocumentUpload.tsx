import React, { useRef } from "react";
import { UploadCloud, FileText, Table, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { uploadDocuments, processDocument } from "@/services/api";

interface DocumentUploadProps {
  uploadedFiles: any[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<any[]>>;
  isUploading: boolean;
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function DocumentUpload({ 
  uploadedFiles, 
  setUploadedFiles, 
  isUploading, 
  setIsUploading 
}: DocumentUploadProps) {
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files);
      
      // Immediately show them as uploading
      const newFiles = files.map(f => ({
        name: f.name,
        status: 'uploading',
        progress: 10,
        type: f.name.endsWith('.pdf') ? 'pdf' : 'sheet'
      }));
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setIsUploading(true);

      try {
        const response = await uploadDocuments(files);
        // Queue processing for each successfully uploaded file
        if (response.status === 'uploaded') {
          // Update status to processing visually
          setUploadedFiles(prev => prev.map(p => {
            const found = response.files.find((rf: any) => rf.filename === p.name);
            if (found) {
              return { ...p, id: found.id, status: 'processing', progress: 50 };
            }
            return p;
          }));

          // Process each document concurrently
          await Promise.all(response.files.map(async (fileObj: any) => {
             try {
               await processDocument(fileObj.id);
               setUploadedFiles(prev => prev.map(p => p.id === fileObj.id ? { ...p, status: 'processed', progress: 100 } : p));
             } catch (e) {
               setUploadedFiles(prev => prev.map(p => p.id === fileObj.id ? { ...p, status: 'failed', progress: 100 } : p));
             }
          }));
        }
      } catch (err) {
        console.error(err);
        alert("Failed to upload files.");
        setUploadedFiles(prev => prev.filter(p => !files.find(f => f.name === p.name)));
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Document Processing
        </h2>
        <span className="text-xs text-slate-400">{uploadedFiles.length} files uploaded</span>
      </div>
      
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {uploadedFiles.map((file, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${file.type === 'pdf' ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-green-50 dark:bg-green-900/20 text-green-600'}`}>
                {file.type === 'pdf' ? <FileText className="h-6 w-6" /> : <Table className="h-6 w-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{file.name}</p>
                <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${file.status === 'processed' ? 'bg-emerald-500' : file.status === 'failed' ? 'bg-red-500' : 'bg-primary animate-pulse'}`} 
                    style={{ width: `${file.progress}%` }}
                  ></div>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {file.status === 'processed' ? (
                    <>
                      <CheckCircle className="h-3 w-3 text-emerald-500" />
                      <span className="text-[10px] text-emerald-500">Processed • 100%</span>
                    </>
                  ) : file.status === 'failed' ? (
                    <>
                      <AlertCircle className="h-3 w-3 text-red-500" />
                      <span className="text-[10px] text-red-500">Processing Failed</span>
                    </>
                  ) : (
                    <>
                      <Loader2 className="h-3 w-3 text-slate-500 animate-spin" />
                      <span className="text-[10px] text-slate-500">{file.status === 'uploading' ? 'Uploading...' : 'AI Processing...'}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div 
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 hover:border-primary/50 transition-colors cursor-pointer group"
      >
        <UploadCloud className="h-8 w-8 group-hover:text-primary transition-colors text-slate-400" />
        <p className="text-sm mt-2">{isUploading ? 'Uploading...' : 'Drag and drop additional documents here or click to browse'}</p>
        <input 
          type="file" 
          multiple 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".pdf,.xlsx,.csv,.xls"
        />
      </div>
    </section>
  );
}
