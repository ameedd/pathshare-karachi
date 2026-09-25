import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  FileText,
  UserCheck,
  Building,
  CreditCard,
  AlertTriangle,
  ArrowLeft,
  Search,
  Filter,
  Eye,
  Clock,
  Phone,
  Mail,
  Car
} from 'lucide-react';
import { UserProfile } from '../types';

interface VerificationSubmission {
  id: string;
  userId: string;
  name: string;
  role: 'driver' | 'passenger';
  companyName: string;
  officeLocation: string;
  phone: string;
  email: string;
  cnicNumber: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  cardImageUrl?: string;
  vehicleModel?: string;
  plateNumber?: string;
}

const mockSubmissions: VerificationSubmission[] = [];

interface AdminReviewScreenProps {
  onBack: () => void;
  onToast: (msg: string) => void;
}

export function AdminReviewScreen({ onBack, onToast }: AdminReviewScreenProps) {
  const [submissions, setSubmissions] = useState<VerificationSubmission[]>(mockSubmissions);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSub, setSelectedSub] = useState<VerificationSubmission | null>(null);

  const handleApprove = (id: string) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'approved' } : s))
    );
    if (selectedSub?.id === id) {
      setSelectedSub((prev) => (prev ? { ...prev, status: 'approved' } : null));
    }
    onToast(`Verified & Approved badge for submission #${id}`);
  };

  const handleReject = (id: string) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'rejected' } : s))
    );
    if (selectedSub?.id === id) {
      setSelectedSub((prev) => (prev ? { ...prev, status: 'rejected' } : null));
    }
    onToast(`Rejected submission #${id}. Notification sent to user.`);
  };

  const filtered = submissions.filter((s) => {
    if (activeFilter !== 'all' && s.status !== activeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.companyName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.cnicNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = submissions.filter((s) => s.status === 'pending').length;

  return (
    <div className="pb-24 bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 min-h-screen text-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 border-b border-slate-800 p-4 sticky top-0 z-20 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-black tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              Admin Verification Console
            </h1>
            <p className="text-[11px] text-slate-400">Review CNIC, Corporate Badges & Vehicle Credentials</p>
          </div>
        </div>

        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
          {pendingCount} Pending
        </span>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Search & Filter Bar */}
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl space-y-3 shadow-md backdrop-blur-md">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, company/university, CNIC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl capitalize transition cursor-pointer shrink-0 ${
                  activeFilter === filter
                    ? 'bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 text-white shadow-xs border border-blue-600'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                {filter} {filter === 'pending' && pendingCount > 0 ? `(${pendingCount})` : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
              <UserCheck className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">No verification submissions found matching filters.</p>
            </div>
          ) : (
            filtered.map((sub) => (
              <div
                key={sub.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition shadow-md space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 border border-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      {sub.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{sub.name}</h3>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {sub.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Building className="w-3 h-3 text-blue-400" />
                        {sub.companyName}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full capitalize border ${
                      sub.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : sub.status === 'rejected'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>CNIC: <strong>{sub.cnicNumber}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{sub.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{sub.email}</span>
                  </div>
                </div>

                {sub.vehicleModel && (
                  <div className="text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 flex items-center gap-2">
                    <Car className="w-3.5 h-3.5 text-blue-400" />
                    <span>Vehicle: <strong>{sub.vehicleModel}</strong> ({sub.plateNumber})</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Submitted {sub.submittedAt}
                  </span>

                  <div className="flex items-center gap-2">
                    {sub.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleReject(sub.id)}
                          className="py-1.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900 text-rose-300 border border-rose-800/60 font-bold text-xs flex items-center gap-1 cursor-pointer transition"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(sub.id)}
                          className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition shadow-md border border-blue-900"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve & Verify
                        </button>
                      </>
                    )}
                    {sub.status === 'approved' && (
                      <button
                        type="button"
                        onClick={() => handleReject(sub.id)}
                        className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-[11px] font-medium transition cursor-pointer"
                      >
                        Revoke Badge
                      </button>
                    )}
                    {sub.status === 'rejected' && (
                      <button
                        type="button"
                        onClick={() => handleApprove(sub.id)}
                        className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 text-[11px] font-medium transition cursor-pointer"
                      >
                        Re-Approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
