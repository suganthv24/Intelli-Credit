import { FileText, Download, Send } from "lucide-react";
import { generateCam } from "@/services/api";

interface FinalReportProps {
  analysisData: any;
}

export default function FinalReport({ analysisData }: FinalReportProps) {
  
  const handleDownloadCAM = async (format: 'pdf' | 'word') => {
    try {
      if (!analysisData) {
        alert("Please run AI analysis entirely first.");
        return;
      }
      
      const blob = await generateCam(analysisData, format);
      
      // Create object URL and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `IntelliCredit_Appraisal_${format === 'pdf' ? 'Report.pdf' : 'Document.docx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
    } catch (err) {
      console.error(err);
      alert("Failed to generate report.");
    }
  };

  return (
    <section className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-8">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Final Appraisal Summary</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            The borrower exhibits strong operational efficiency and stable financial growth. Despite a high debt-to-equity ratio, the interest coverage remains healthy at 4.2x. AI analysis suggests a '{analysisData?.recommendation?.loan_decision || 'PROCEED'}' with a conservative limit of ₹4.50 Cr pending final collateral valuation.
          </p>
          <div className="pt-4 flex flex-wrap gap-3">
            <button 
              onClick={() => handleDownloadCAM('word')}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              <FileText className="h-4 w-4 text-blue-600" />
              Generate Word Doc
            </button>
            <button 
              onClick={() => handleDownloadCAM('pdf')}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              <Download className="h-4 w-4 text-red-600" />
              Generate PDF Report
            </button>
          </div>
        </div>
        <div className="flex-shrink-0">
          <button className="w-full md:w-auto bg-primary text-white px-8 py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-2">
            Submit Final Review
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
