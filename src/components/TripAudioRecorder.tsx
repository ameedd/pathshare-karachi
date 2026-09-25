import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, ShieldCheck, AlertOctagon, Volume2, Info, CheckCircle2, Lock, CloudUpload } from 'lucide-react';
import { uploadTripAudio, EncryptionResult } from '../lib/storage';

interface TripAudioRecorderProps {
  rideId: number | string;
  driverName?: string;
  onAudioRecorded?: (audioUrl: string, durationSeconds: number) => void;
  onSosTriggered?: () => void;
}

export function TripAudioRecorder({
  rideId,
  driverName = 'Driver',
  onAudioRecorded,
  onSosTriggered
}: TripAudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptionDetails, setEncryptionDetails] = useState<EncryptionResult | null>(null);
  const [cloudStorageUrl, setCloudStorageUrl] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    setPermissionError(null);
    setEncryptionDetails(null);
    setCloudStorageUrl(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionError('Microphone access is not supported by this browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const rawBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const localAudioUrl = URL.createObjectURL(rawBlob);
        setRecordedAudioUrl(localAudioUrl);

        // Perform authentic client-side AES-256-GCM encryption & Firebase Storage upload
        setIsEncrypting(true);
        try {
          const uploadResult = await uploadTripAudio(rideId, rawBlob, true);
          if (uploadResult.encryption) {
            setEncryptionDetails(uploadResult.encryption);
          }
          if (uploadResult.downloadUrl) {
            setCloudStorageUrl(uploadResult.downloadUrl);
          }
          if (onAudioRecorded) {
            onAudioRecorded(uploadResult.downloadUrl, recordingTime);
          }
        } catch (encErr) {
          console.error('[TripAudioRecorder] Encryption/Upload note:', encErr);
          if (onAudioRecorded) {
            onAudioRecorded(localAudioUrl, recordingTime);
          }
        } finally {
          setIsEncrypting(false);
        }

        // Stop all tracks to release mic
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone permission request:', err);
      setPermissionError('Microphone permission denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 text-slate-100 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-950/80 border border-blue-800 text-blue-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              Trip Audio Safety Recorder
              <span className="text-[9px] bg-blue-900/60 text-blue-300 font-semibold px-1.5 py-0.5 rounded border border-blue-700/40">
                AES-256
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">Encrypted in-cabin audio backup for ride #{rideId}</p>
          </div>
        </div>

        {isRecording && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/10 border border-rose-500/30 rounded-full">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-[10px] font-mono font-bold text-rose-400">{formatTime(recordingTime)}</span>
          </div>
        )}
      </div>

      {permissionError && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>{permissionError}</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2 pt-1">
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer border border-blue-900"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Start Trip Audio Recording</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer border border-rose-700 animate-pulse"
          >
            <Square className="w-3.5 h-3.5" />
            <span>Stop & Encrypt Recording</span>
          </button>
        )}

        {onSosTriggered && (
          <button
            type="button"
            onClick={onSosTriggered}
            className="py-2.5 px-3 rounded-xl bg-rose-950/60 border border-rose-800/80 hover:bg-rose-900 text-rose-300 font-bold text-xs flex items-center gap-1 cursor-pointer transition"
            title="Emergency SOS Broadcast"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            <span>SOS</span>
          </button>
        )}
      </div>

      {isEncrypting && (
        <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center gap-2 animate-pulse">
          <Lock className="w-4 h-4 shrink-0 animate-spin" />
          <span>Executing W3C SubtleCrypto AES-256-GCM encryption and uploading to Firebase Storage...</span>
        </div>
      )}

      {recordedAudioUrl && !isRecording && (
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Audio Safely Captured
            </span>
            <span className="text-slate-500 font-mono text-[10px]">{formatTime(recordingTime)}</span>
          </div>

          {encryptionDetails && (
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-[10px] space-y-1 font-mono text-slate-400">
              <div className="flex items-center justify-between text-slate-200">
                <span className="flex items-center gap-1 font-semibold text-blue-400">
                  <Lock className="w-3 h-3" /> {encryptionDetails.algorithm}
                </span>
                <span className="text-emerald-400 flex items-center gap-1 font-sans">
                  <CloudUpload className="w-3 h-3" /> Firebase Storage Ready
                </span>
              </div>
              <p className="truncate text-slate-500">IV Nonce: {encryptionDetails.ivHex}</p>
              <p className="text-slate-500">Payload: {encryptionDetails.encryptedBytes} bytes (auth-tagged)</p>
            </div>
          )}

          <audio controls src={recordedAudioUrl} className="w-full h-8" />
        </div>
      )}

      <div className="flex items-center gap-1 text-[10px] text-slate-500">
        <Info className="w-3 h-3 shrink-0" />
        <span>Audio recordings undergo true client-side AES-256-GCM encryption prior to upload. Only decrypted upon official safety dispute or SOS investigation.</span>
      </div>
    </div>
  );
}
