"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { classifyDocuments, extractSchema } from "@/services/api";
import { FileUp, SearchCode, Database, CheckCircle2, Loader2, ArrowRight, TableProperties, Network } from "lucide-react";

export default function ProcessingPipeline() {
  const router = useRouter();
  const [activeStage, setActiveStage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Stage 1: Upload Requirements
  const [uploads, setUploads] = useState({
    alm: null as File | null,
    shareholding: null as File | null,
    borrowing: null as File | null,
    annual: null as File | null,
    portfolio: null as File | null
  });

  // Stage 2: Classification
  const [classifications, setClassifications] = useState<any[]>([]);

  // Stage 3: Schema Mapping
  const [extractedTables, setExtractedTables] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, doctype: keyof typeof uploads) => {
    if (e.target.files && e.target.files[0]) {
      setUploads(prev => ({ ...prev, [doctype]: e.target.files![0] }));
    }
  };

  const getUploadedFilenames = () => {
    return Object.values(uploads)
      .filter((file): file is File => file !== null)
      .map(file => file.name);
  };

  const runClassification = async () => {
    setIsProcessing(true);
    try {
      const fnames = getUploadedFilenames();
      if (fnames.length === 0) {
        alert("Please upload at least one document.");
        setIsProcessing(false);
        return;
      }
      const data = await classifyDocuments(fnames);
      setClassifications(data.classifications || []);
      setActiveStage(2);
    } catch (e) {
      console.error(e);
      alert("Failed to run classification AI.");
    } finally {
      setIsProcessing(false);
    }
  };

  const runSchemaExtraction = async () => {
    setIsProcessing(true);
    try {
      const data = await extractSchema();
      setExtractedTables(data.extracted_tables || []);
      setActiveStage(3);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const finalizePipeline = () => {
    setIsProcessing(true);
    // Simulate mapping extraction into database memory
    setTimeout(() => {
        router.push("/assessment");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pt-12 p-4 antialiased">
      <div className="max-w-4xl w-full mx-auto space-y-8">
        
        {/* Pipeline Header */}
        <div className="text-center space-y-2 mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Intelli-Credit Pipeline</h1>
          <p className="text-slate-500">Intelligent Document Ingestion, Classification & Schema Mapping</p>
        </div>

        {/* Stage 1: Document Upload */}
        <div className={`transition-all duration-500 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden ${activeStage === 1 ? 'ring-2 ring-primary shadow-xl' : 'opacity-60 grayscale scale-[0.98]'}`}>
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-xl">
                <FileUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">1. Document Ingestion</h3>
                <p className="text-sm text-slate-500">Upload the mandatory entity forms.</p>
              </div>
            </div>
            {activeStage > 1 && <CheckCircle2 className="w-8 h-8 text-emerald-500" />}
          </div>
          
          {activeStage === 1 && (
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'alm', label: 'ALM (Asset Liability Management)' },
                  { id: 'shareholding', label: 'Shareholding Pattern' },
                  { id: 'borrowing', label: 'Borrowing Profile' },
                  { id: 'annual', label: 'Annual Reports' },
                  { id: 'portfolio', label: 'Portfolio Cuts' }
                ].map((doc) => (
                  <label key={doc.id} className="cursor-pointer flex items-center justify-between p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {doc.label}
                    </span>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => handleFileChange(e, doc.id as keyof typeof uploads)}
                    />
                    <div className="text-xs">
                      {uploads[doc.id as keyof typeof uploads] ? (
                         <span className="text-emerald-500 font-medium flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Ready</span>
                      ) : (
                        <span className="text-slate-400">Click to attach</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
              
              <div className="mt-8 flex justify-end">
                <button onClick={runClassification} disabled={isProcessing} className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90">
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Run AI Classification <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stage 2: Classification */}
        <div className={`transition-all duration-500 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden ${activeStage === 2 ? 'ring-2 ring-primary shadow-xl' : activeStage < 2 ? 'opacity-40 grayscale scale-[0.98]' : 'opacity-60 grayscale scale-[0.98]'}`}>
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/40 text-purple-600 rounded-xl">
                <SearchCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">2. Document Classification</h3>
                <p className="text-sm text-slate-500">AI automatically identifies document types.</p>
              </div>
            </div>
            {activeStage > 2 && <CheckCircle2 className="w-8 h-8 text-emerald-500" />}
          </div>

          {activeStage === 2 && (
            <div className="p-8">
              <div className="space-y-4">
                {classifications.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">{item.filename}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                          {item.detected_type}
                        </span>
                        <span className="text-xs text-slate-500">Confidence: {(item.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700">Change</button>
                       <button className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30 font-medium">Approve</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                <button onClick={runSchemaExtraction} disabled={isProcessing} className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90">
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Parse Tables & Map Schema <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stage 3: Schema Mapping */}
        <div className={`transition-all duration-500 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden ${activeStage === 3 ? 'ring-2 ring-primary shadow-xl' : 'opacity-40 grayscale scale-[0.98]'}`}>
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-xl">
                <Network className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">3. Extraction Schema Mapping</h3>
                <p className="text-sm text-slate-500">Map generic OCR rows to the standardized Risk Engine Schema.</p>
              </div>
            </div>
          </div>

          {activeStage === 3 && (
            <div className="p-8">
              <div className="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-xl">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-4 font-medium">Extracted Table Field</th>
                      <th className="p-4 font-medium">Detected Value</th>
                      <th className="p-4 font-medium">Schema Target</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedTables.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                        <td className="p-4 font-mono text-xs flex items-center gap-2"><TableProperties className="w-4 h-4 text-slate-400"/> {row.raw_field}</td>
                        <td className="p-4 text-slate-900 dark:text-white font-medium">INR {row.value}</td>
                        <td className="p-4">
                          <select className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary outline-none">
                            <option>{row.suggested_schema}</option>
                            <option>Operating Expenses</option>
                            <option>Net Profit</option>
                            <option>Fixed Assets</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 flex justify-end">
                <button onClick={finalizePipeline} disabled={isProcessing} className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90">
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Run AI Recommendation Engine <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
