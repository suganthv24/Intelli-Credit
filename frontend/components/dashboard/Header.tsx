"use client";
import React, { useState } from "react";
import { PlayCircle, ShieldCheck, Bell, Zap, User, Settings, LogOut } from "lucide-react";

interface HeaderProps {
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
}

export default function Header({ onRunAnalysis, isAnalyzing }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Intelli-Credit</h1>
        </div>
        <div className="flex items-center gap-4 md:gap-6 relative">
          <div className="hidden md:flex items-center px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
            <span className="text-xs font-mono text-slate-500">ID: #CR-2024-8842</span>
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-background-dark"></span>
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                  <h4 className="text-sm font-bold">Notifications</h4>
                  <span className="text-[10px] text-slate-500">Mark all read</span>
                </div>
                <div className="p-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="py-2 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded cursor-pointer transition-colors">
                    <p className="font-medium text-slate-900 dark:text-white">Analysis Complete</p>
                    <p className="text-xs mt-1">Acme Corp data processed successfully.</p>
                    <p className="text-[10px] text-slate-400 mt-1">2 mins ago</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={onRunAnalysis}
            disabled={isAnalyzing}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed hidden sm:flex"
          >
            <Zap className="h-4 w-4" />
            {isAnalyzing ? "Analyzing..." : "Run AI Analysis"}
          </button>
          
          {/* Profile */}
          <div className="relative">
            <button 
              onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
              className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 overflow-hidden hover:ring-2 ring-primary transition-all focus:outline-none"
            >
              <img 
                className="w-full h-full object-cover" 
                alt="User profile avatar of a credit analyst" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzWGlRKkZEuMoDPgSXQ-c5QAjZkXFXq703SBOOig3VZaHa8so0i1opLmaYuSLWJqEy6PLr1wizej5bKWZQiQS-pVUIniBe-vXBp23Zaa2z2OmeTmOR0SQ3hvRtGWF3Ayt6aAwTBgTMfRUAhJ4647BYpvEua3rh0v8xs64ZXdsB4nGfySabTR8PFGGrLBdtP9pG7c5H-9XgVqGrW8nItga_glla5rI9-N73Qj_9zMqjYsVJA_din_owobk8gSXFeTFuK87SIsiQCpg" 
              />
            </button>
            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Alex Morgan</p>
                  <p className="text-xs text-slate-500">Senior Credit Analyst</p>
                </div>
                <div className="py-1">
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors">
                    <User className="h-4 w-4" /> Profile
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors">
                    <Settings className="h-4 w-4" /> Settings
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                  <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 transition-colors">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
