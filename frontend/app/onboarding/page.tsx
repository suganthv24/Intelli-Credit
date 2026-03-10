"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { onboardEntity } from "@/services/api";
import { Building2, Landmark, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    company_name: "Acme Corp",
    cin: "U74999MH2021PTC355000",
    pan: "ABCDE1234F",
    sector: "Manufacturing",
    sub_sector: "Auto Ancillaries",
    annual_turnover: 50000000,
    incorporation_date: "2015-06-01",
    
    loan_type: "Term Loan",
    loan_amount: 15000000,
    tenure: 36,
    interest_rate: 9.5,
    purpose: "Capacity Expansion"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'annual_turnover' || name === 'loan_amount' || name === 'tenure' || name === 'interest_rate' 
              ? Number(value) : value
    }));
  };

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await onboardEntity({...formData, user_id: user.id || 1});
      // Hackathon Journey: Move strictly to Stage 2 (Upload / Processing)
      router.push("/processing");
    } catch (error) {
      console.error(error);
      alert("Failed to onboard entity. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 antialiased">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header Progress */}
        <div className="bg-slate-100 dark:bg-slate-800/50 p-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${step >= 1 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'}`}>
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Step 1</p>
              <p className="text-xs text-slate-500">Company Information</p>
            </div>
          </div>
          
          <div className="w-16 h-1 bg-slate-200 dark:bg-slate-700 rounded-full">
            <div className={`h-full bg-primary rounded-full transition-all duration-300 ${step === 2 ? 'w-full' : 'w-0'}`}></div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${step >= 2 ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
              <Landmark className="w-5 h-5" />
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Step 2</p>
              <p className="text-xs text-slate-500">Loan Details</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {step === 1 ? "Entity Onboarding" : "Loan Parameters"}
            </h2>
            <p className="text-slate-500 mt-1">
              {step === 1 ? "Enter the primary demographic and registration details for the borrowing entity." : "Configure the requested facility and target parameters."}
            </p>
          </div>

          <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
            {step === 1 && (
              <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-left-4 fade-in duration-300">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                  <input required name="company_name" value={formData.company_name} onChange={handleChange} type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CIN</label>
                  <input required name="cin" value={formData.cin} onChange={handleChange} type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">PAN</label>
                  <input required name="pan" value={formData.pan} onChange={handleChange} type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white uppercase" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sector</label>
                  <select required name="sector" value={formData.sector} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white">
                    <option>Manufacturing</option>
                    <option>Technology</option>
                    <option>Retail</option>
                    <option>Healthcare</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sub-sector</label>
                  <input required name="sub_sector" value={formData.sub_sector} onChange={handleChange} type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Annual Turnover (INR)</label>
                  <input required name="annual_turnover" value={formData.annual_turnover} onChange={handleChange} type="number" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Incorporation Date</label>
                  <input required name="incorporation_date" value={formData.incorporation_date} onChange={handleChange} type="date" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-right-4 fade-in duration-300">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Facility Type</label>
                  <select required name="loan_type" value={formData.loan_type} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white">
                    <option>Term Loan</option>
                    <option>Working Capital</option>
                    <option>Overdraft</option>
                    <option>Trade Finance</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Requested Amount (INR)</label>
                  <input required name="loan_amount" value={formData.loan_amount} onChange={handleChange} type="number" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tenure (Months)</label>
                  <input required name="tenure" value={formData.tenure} onChange={handleChange} type="number" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expected Interest Rate (%)</label>
                  <input required name="interest_rate" value={formData.interest_rate} onChange={handleChange} step="0.1" type="number" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white" />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Use Purpose</label>
                  <input required name="purpose" value={formData.purpose} onChange={handleChange} type="text" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white" />
                </div>
              </div>
            )}

            <div className="mt-10 flex gap-4">
              {step === 2 && (
                <button type="button" onClick={handleBack} disabled={isSubmitting} className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-1/3">
                  Back
                </button>
              )}
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors ${step === 1 ? 'w-full' : ''}`}
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                ) : step === 1 ? (
                  <>Continue <ChevronRight className="w-5 h-5" /></>
                ) : (
                  <><CheckCircle2 className="w-5 h-5" /> Initialize Credit File</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
