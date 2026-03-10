"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, Building, Loader2, Briefcase } from "lucide-react";
import Link from "next/link";

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    role: "Credit Analyst",
    password: "",
    confirm_password: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      alert("Passwords do not match");
      return;
    }
    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Failed to create account. Email might be in use.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 antialiased">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create an Account</h1>
          <p className="text-sm text-slate-500 mt-2">Join Intelli-Credit to automate your CAM Generation</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input required name="name" value={formData.name} onChange={handleChange} type="text" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white" />
            </div>
          </div>
          
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Business Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white" />
            </div>
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Organization</label>
            <div className="relative">
              <Building className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input required name="organization" value={formData.organization} onChange={handleChange} type="text" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white" />
            </div>
          </div>
          
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <select required name="role" value={formData.role} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white appearance-none">
                <option>Credit Analyst</option>
                <option>Risk Officer</option>
                <option>Credit Manager</option>
              </select>
            </div>
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input required name="password" value={formData.password} onChange={handleChange} type="password" minLength={8} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white" />
            </div>
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input required name="confirm_password" value={formData.confirm_password} onChange={handleChange} type="password" minLength={8} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white" />
            </div>
          </div>

          <div className="col-span-2 mt-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
