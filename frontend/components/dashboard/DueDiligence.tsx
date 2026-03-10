"use client";
import React from "react";

interface DueDiligenceProps {
  dueDiligenceNotes: any;
  setDueDiligenceNotes: React.Dispatch<React.SetStateAction<any>>;
}

export default function DueDiligence({ dueDiligenceNotes, setDueDiligenceNotes }: DueDiligenceProps) {
  return (
    <section className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 space-y-8">
      <h3 className="text-lg font-bold border-b border-slate-100 dark:border-slate-800 pb-4">On-site Due Diligence</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Factory Utilization (%)</label>
              <span className="text-sm font-bold text-primary">{dueDiligenceNotes.utilization}%</span>
            </div>
            <input 
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" 
              type="range" 
              min="0"
              max="100"
              value={dueDiligenceNotes.utilization}
              onChange={(e) => setDueDiligenceNotes({...dueDiligenceNotes, utilization: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-3">Inventory Status</label>
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {['Slow', 'Normal', 'Fast'].map(status => (
                <button 
                  key={status}
                  onClick={() => setDueDiligenceNotes({...dueDiligenceNotes, inventory: status})}
                  className={`flex-1 py-1.5 text-xs rounded-md shadow-sm transition-all ${
                    dueDiligenceNotes.inventory === status 
                      ? 'font-bold bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                      : 'font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 shadow-none'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium block">Site Visit Notes</label>
          <textarea 
            className="w-full h-32 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:ring-primary focus:border-primary outline-none transition-all" 
            placeholder="Enter observations from the factory visit..."
            value={dueDiligenceNotes.notes}
            onChange={(e) => setDueDiligenceNotes({...dueDiligenceNotes, notes: e.target.value})}
          ></textarea>
        </div>
      </div>
    </section>
  );
}
