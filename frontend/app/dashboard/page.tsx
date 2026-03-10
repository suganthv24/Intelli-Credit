"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, FileText, Activity, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

export default function DashboardPage() {
  const [assessments, setAssessments] = useState([
    { id: "1024", company: "Acme Corp", date: "2024-03-01", status: "completed", riskScore: "Low Risk", decision: "Approve" },
    { id: "1025", company: "TechNova Inc", date: "2024-03-05", status: "processing", riskScore: "Pending", decision: "Pending" },
    { id: "1026", company: "RetailMax Group", date: "2024-02-28", status: "completed", riskScore: "High Risk", decision: "Reject" },
  ]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your entity credit assessments.</p>
        </div>
        <Link 
          href="/onboarding"
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Start New Entity Assessment
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Total Assessments</h3>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-lg"><FileText className="w-5 h-5"/></div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">124</p>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Ongoing Analyses</h3>
            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-lg"><Activity className="w-5 h-5"/></div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">3</p>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">High Risk Entities</h3>
            <div className="p-2 bg-red-100 dark:bg-red-900/40 text-red-600 rounded-lg"><AlertTriangle className="w-5 h-5"/></div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">14</p>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium">Approved Proposals</h3>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-lg"><CheckCircle2 className="w-5 h-5"/></div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">82</p>
        </div>
      </div>

      {/* Recents Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Assessments & CAM Reports</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4 font-medium">ID</th>
                <th className="p-4 font-medium">Company Name</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Risk Score</th>
                <th className="p-4 font-medium">Decision</th>
                <th className="p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-mono text-xs">{item.id}</td>
                  <td className="p-4 font-medium text-slate-900 dark:text-white">{item.company}</td>
                  <td className="p-4">{item.date}</td>
                  <td className="p-4">
                    {item.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5" /> Processing
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-semibold ${item.riskScore.includes('High') ? 'text-red-500' : item.riskScore.includes('Low') ? 'text-emerald-500' : 'text-slate-500'}`}>
                      {item.riskScore}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-slate-900 dark:text-white">{item.decision}</td>
                  <td className="p-4">
                    {item.status === 'completed' ? (
                       <Link href="/assessment" className="text-primary hover:underline font-medium text-sm">View Report</Link>
                    ) : (
                       <Link href="/processing" className="text-primary hover:underline font-medium text-sm">Continue</Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
