import React, { useState } from 'react';
import { Shield, FileText, Lock, Users, ArrowLeft, CheckCircle2, AlertTriangle, Scale } from 'lucide-react';

interface LegalScreenProps {
  onBack: () => void;
  defaultTab?: 'terms' | 'privacy' | 'community' | 'safety';
}

export function LegalScreen({ onBack, defaultTab = 'safety' }: LegalScreenProps) {
  const [activeTab, setActiveTab] = useState<'safety' | 'terms' | 'privacy' | 'community'>(defaultTab);

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
              <Scale className="w-5 h-5 text-blue-400" />
              PathShare Legal & Safety Center
            </h1>
            <p className="text-[11px] text-slate-400">Karachi City Commuter Standards & Regulatory Terms</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-4">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveTab('safety')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'safety'
                ? 'bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 text-white shadow-md border border-blue-600'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Safety First
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('community')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'community'
                ? 'bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 text-white shadow-md border border-blue-600'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Community
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 text-white shadow-md border border-blue-600'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Terms
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 text-white shadow-md border border-blue-600'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> Privacy
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
          {activeTab === 'safety' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm font-black text-white">Karachi Commute Safety Standards</h2>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1.5">
                  <h3 className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 1. Verified Corporate & University ID Mandatory
                  </h3>
                  <p className="text-slate-400">
                    All drivers and passengers must upload their valid National Identity Card (CNIC) along with their official University or Corporate badge before booking or posting rides.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1.5">
                  <h3 className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 2. Safe Pickup Hotspots
                  </h3>
                  <p className="text-slate-400">
                    Pickups and drop-offs are strictly recommended at designated, well-lit, and CCTV-monitored public hotspots (e.g., IBA Main Campus Gate, FAST National University Gate, Boat Basin Shell Pump, Korangi Creek Signal).
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1.5">
                  <h3 className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 3. 3-Minute Departure Rule
                  </h3>
                  <p className="text-slate-400">
                    To prevent traffic obstruction and maintain prompt schedules on Karachi thoroughfares, drivers trigger an arrival beacon granting a strict 3-minute boarding window.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1.5">
                  <h3 className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 4. Emergency SOS & In-Cabin Audio
                  </h3>
                  <p className="text-slate-400">
                    1-tap emergency SOS broadcasts your live GPS link to your trusted WhatsApp contacts, Karachi Police Helpline (15), and the PathShare Safety Ops desk.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'community' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Users className="w-5 h-5 text-blue-400" />
                <h2 className="text-sm font-black text-white">PathShare Community Guidelines</h2>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>
                  PathShare is a community-driven carpool platform designed to ease traffic congestion, reduce carbon emissions, and provide affordable, secure daily mobility across Karachi.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-400">
                  <li><strong>Respectful Conduct:</strong> Maintain courteous, respectful communication in person and in-app chat at all times.</li>
                  <li><strong>Non-Commercial Carpool:</strong> Fares are purely cost-sharing contributions calculated to cover fuel, maintenance, and toll expenses.</li>
                  <li><strong>Punctuality:</strong> Arrive at your designated pickup hotspot 2 minutes ahead of the scheduled departure time.</li>
                  <li><strong>Zero Tolerance Policy:</strong> Any harassment, discrimination, or reckless driving will result in permanent account deactivation and referral to civil authorities.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <FileText className="w-5 h-5 text-amber-400" />
                <h2 className="text-sm font-black text-white">Terms of Service</h2>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>
                  By registering with PathShare Carpool, you agree to comply with all transport and traffic regulations in Sindh, Pakistan.
                </p>
                <p className="text-slate-400">
                  <strong>Fare Settlements:</strong> All ride payments made through EasyPaisa, JazzCash, or integrated cards are held securely until ride completion. In case of route disputes, PathShare mediation reserves the right to review trip logs and audio recordings.
                </p>
                <p className="text-slate-400">
                  <strong>Driver Vehicle Liability:</strong> Drivers verify that their motor vehicles possess valid registration, fitness certificates, and third-party insurance as required by Sindh Motor Vehicles Rules.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Lock className="w-5 h-5 text-rose-400" />
                <h2 className="text-sm font-black text-white">Privacy & Data Security Policy</h2>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>
                  Your privacy is protected by end-to-end cloud encryption and strict role-based access control.
                </p>
                <p className="text-slate-400">
                  <strong>Identity Documents:</strong> CNIC images and university/office cards are stored in isolated encrypted cloud storage and are only accessible by authorized compliance officers for verification.
                </p>
                <p className="text-slate-400">
                  <strong>Location Privacy:</strong> Live GPS coordinates are only broadcast during active scheduled rides to your verified driver and emergency contacts.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
