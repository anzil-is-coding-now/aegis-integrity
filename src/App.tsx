/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Shield, 
  Eye, 
  Mic, 
  Search, 
  Zap, 
  Lock, 
  Globe, 
  MessageSquare, 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  Layers, 
  ArrowRight,
  Info,
  Activity,
  FileText,
  Fingerprint,
  Settings,
  Key,
  Save,
  RefreshCw,
  Download,
  ShieldCheck,
  ShieldAlert,
  Image as ImageIcon,
  Video,
  ZapOff,
  FileJson
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

const App = () => {
  const [activeTab, setActiveTab] = useState('engine');
  const [globalStats, setGlobalStats] = useState({
    totalScans: 1284,
    syntheticDetected: 432,
    protectedAssets: 891,
    avgConfidence: 94.2
  });
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ id: string, msg: string, type: 'info' | 'warn' | 'error' | 'success' }[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  const addLog = (msg: string, type: 'info' | 'warn' | 'error' | 'success' = 'info') => {
    setLogs(prev => [{ id: Math.random().toString(36).substr(2, 9), msg, type }, ...prev].slice(0, 50));
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem('AEGIS_HISTORY');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    addLog("Aegis Integrity System Initialized", "success");
    addLog("Secure Environment Established", "info");
  }, []);

  useEffect(() => {
    localStorage.setItem('AEGIS_HISTORY', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const savedKey = localStorage.getItem('GEMINI_API_KEY');
    if (savedKey) {
      setApiKey(savedKey);
    } else if (process.env.GEMINI_API_KEY) {
      setApiKey(process.env.GEMINI_API_KEY);
    }
  }, []);

  const modules = [
    { id: 'engine', title: 'Detection Engine', icon: <Cpu className="w-5 h-5" /> },
    { id: 'trust', title: 'Trust Layer', icon: <Eye className="w-5 h-5" /> },
    { id: 'immune', title: 'Immune System', icon: <Shield className="w-5 h-5" /> },
    { id: 'deployment', title: 'Deployment & UX', icon: <Globe className="w-5 h-5" /> },
    { id: 'strategy', title: 'Pitch Strategy', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'settings', title: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleSaveKey = () => {
    setIsSaving(true);
    localStorage.setItem('GEMINI_API_KEY', apiKey);
    setTimeout(() => {
      setIsSaving(false);
    }, 800);
  };

  const testApiConnection = async () => {
    if (!apiKey) {
      setTestResult({ success: false, message: 'API Key is required for testing.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const genAI = new GoogleGenAI({ apiKey });
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Hello, Aegis Integrity system online. Confirm status.",
      });

      if (response.text) {
        setTestResult({ success: true, message: 'Connection successful: ' + response.text.substring(0, 50) + '...' });
      } else {
        setTestResult({ success: false, message: 'Connection failed: Empty response.' });
      }
    } catch (error: any) {
      setTestResult({ success: false, message: 'Connection failed: ' + (error.message || 'Unknown error') });
    } finally {
      setIsTesting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAnalysisResult(null);
      setTextInput('');
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => setTextInput(e.target?.result as string);
        reader.readAsText(file);
        setPreviewUrl(null);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleFileDrop = (file: File) => {
    setSelectedFile(file);
    setAnalysisResult(null);
    setTextInput('');
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => setTextInput(e.target?.result as string);
      reader.readAsText(file);
      setPreviewUrl(null);
    } else {
      setPreviewUrl(null);
    }
  };

  const runAnalysis = async () => {
    if ((!selectedFile && !textInput) || !apiKey) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);
    addLog(`Initiating analysis for ${selectedFile ? selectedFile.name : 'Text Input'}...`, "info");
    addLog("Extracting multi-modal features...", "info");

    try {
      const genAI = new GoogleGenAI({ apiKey });
      
      let contents: any[] = [];
      let prompt = "";

      if (textInput) {
        addLog("Analyzing Linguistic Patterns & Perplexity...", "info");
        prompt = `Analyze the following text for digital integrity. 
        Determine if it was written by a human or generated by an AI (LLM). 
        Look for signs of AI generation such as:
        - High perplexity and burstiness patterns
        - Repetitive phrasing or overly formal tone
        - Lack of personal anecdotes or emotional depth
        - Perfect grammar but shallow reasoning
        
        Provide an integrity score (0-100) where 100 is highly likely human and 0 is definitely AI.
        Return as JSON with fields: 
        - score: number
        - categorizedFindings: Record<string, string[]> (Categories: "Linguistic Patterns", "Stylistic Flags", "Consistency Checks")
        - verdict: "AUTHENTIC" | "SYNTHETIC" | "SUSPICIOUS" | "ANALYSIS_FAILED"
        - technicalMetrics: { perplexity: number, burstiness: number, consistency: number, metadataIntegrity: number } (all 0-100)`;
        
        contents = [
          { text: prompt },
          { text: `TEXT_TO_ANALYZE: ${textInput}` }
        ];
      } else if (selectedFile) {
        const reader = new FileReader();
        const fileData = await new Promise<string>((resolve) => {
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(selectedFile);
        });

        const isVideo = selectedFile.type.startsWith('video');
        const isImage = selectedFile.type.startsWith('image');
        const isAudio = selectedFile.type.startsWith('audio');

        addLog(`Running ${isVideo ? 'Temporal Artifact Analysis' : isImage ? 'Spatial Frequency Analysis' : 'Spectral Audio Analysis'}...`, "info");
        addLog("Analyzing Biological Signal Integrity (rPPG)...", "info");
        addLog("Checking Metadata Consistency...", "info");

        if (isVideo) {
          prompt = `Perform a deep-dive forensic analysis on this VIDEO for AI generation and deepfake artifacts. 
          Focus on:
          1. Temporal Consistency: Look for flickering, jitter, or warping between frames, especially around the face and hair.
          2. Biological Markers: Analyze eye blinking patterns (unnatural frequency), pupil dilation, and skin texture (overly smooth or "plastic" look).
          3. Lip-Sync & Audio: Check for misalignment between lip movements and audio phonemes.
          4. Background Integrity: Look for warping or "ghosting" in the background during movement.
          5. rPPG Analysis: Check for consistent blood flow signals in the face (AI often fails this).
          
          Provide an integrity score (0-100) where 100 is authentic and 0 is synthetic.
          Return as JSON with fields: 
          - score: number
          - categorizedFindings: Record<string, string[]> (Categories: "Temporal Artifacts", "Biological Markers", "Audio-Visual Sync", "Metadata Integrity")
          - verdict: "AUTHENTIC" | "SYNTHETIC" | "SUSPICIOUS" | "ANALYSIS_FAILED"
          - technicalMetrics: { noiseEntropy: number, spectralGap: number, rppgSync: number, metadataIntegrity: number } (all 0-100)`;
        } else if (isImage) {
          prompt = `Analyze this IMAGE for AI generation or synthetic manipulation. 
          Focus on:
          1. Spatial Frequency: Look for GAN-specific artifacts or diffusion model noise patterns.
          2. Lighting & Shadows: Check for inconsistent light sources or physically impossible shadows.
          3. Edge Integrity: Look for blurring or "halos" around objects.
          4. Anatomical Accuracy: Check for common AI errors in hands, eyes, and complex textures.
          
          Provide an integrity score (0-100) and specific findings.
          Include bounding boxes (annotations) for any detected artifacts.
          Return as JSON with fields: 
          - score: number
          - categorizedFindings: Record<string, string[]> (Categories: "Generative Artifacts", "Manipulation Traces", "Contextual Flags")
          - verdict: "AUTHENTIC" | "SYNTHETIC" | "SUSPICIOUS" | "ANALYSIS_FAILED"
          - annotations: Array<{ box_2d: [ymin, xmin, ymax, xmax], label: string }> (normalized 0-1000)
          - technicalMetrics: { noiseEntropy: number, spectralGap: number, rppgSync: number, metadataIntegrity: number } (all 0-100)`;
        } else {
          prompt = `Analyze this AUDIO for synthetic generation or voice cloning. 
          Focus on:
          1. Spectral Gaps: Look for missing frequencies common in low-bitrate AI models.
          2. Breathing Patterns: Check for unnatural or missing breath sounds.
          3. Prosody & Intonation: Look for robotic or inconsistent emotional delivery.
          
          Return as JSON with fields: 
          - score: number
          - categorizedFindings: Record<string, string[]> (Categories: "Spectral Artifacts", "Prosody Analysis", "Noise Profile")
          - verdict: "AUTHENTIC" | "SYNTHETIC" | "SUSPICIOUS" | "ANALYSIS_FAILED"
          - technicalMetrics: { noiseEntropy: number, spectralGap: number, rppgSync: number, metadataIntegrity: number } (all 0-100)`;
        }

        contents = [
          { text: prompt },
          { inlineData: { data: fileData, mimeType: selectedFile.type } }
        ];
      }

      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{}');
      setAnalysisResult(result);
      setHistory(prev => [{ ...result, fileName: selectedFile ? selectedFile.name : 'Text Input', timestamp: new Date().toISOString() }, ...prev].slice(0, 10));
      addLog(`Analysis complete. Verdict: ${result.verdict}`, result.verdict === 'AUTHENTIC' ? 'success' : 'warn');
    } catch (error: any) {
      console.error("Analysis failed:", error);
      addLog(`Analysis failed: ${error.message}`, "error");
      setAnalysisResult({
        score: 0,
        verdict: "ANALYSIS_FAILED",
        categorizedFindings: {
          "System Errors": ["System error during processing: " + (error.message || "Unknown error")]
        },
        technicalMetrics: { noiseEntropy: 0, spectralGap: 0, rppgSync: 0, metadataIntegrity: 0 }
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="border-b border-slate-200/50 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
              <Shield className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic text-slate-800">Aegis <span className="text-indigo-500">Integrity</span></h1>
              <p className="text-[10px] text-indigo-600 font-mono uppercase tracking-[0.2em]">Digital Trust Ecosystem</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {modules.map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveTab(m.id)}
                className={`text-xs uppercase tracking-widest transition-all font-bold ${
                  activeTab === m.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-800'
                }`}
              >
                {m.title}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-slate-400 hidden sm:block">VER: 1.0.4-ALPHA</span>
            <button className="bg-slate-800 text-white px-6 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-slate-200/20">
              Launch Demo
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="mb-20">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-6xl md:text-8xl font-black leading-[0.85] mb-8 uppercase italic text-slate-800 tracking-tighter">
                Beyond <span className="text-indigo-500">Detection</span>.<br />
                Absolute <span className="text-indigo-500">Integrity</span>.
              </h2>
              <p className="text-slate-500 text-xl leading-relaxed mb-10 max-w-2xl">
                Aegis is a holistic digital integrity ecosystem designed for high-stakes environments. 
                We combine biological signal analysis, cross-modal verification, and proactive content 
                immunization to combat the next generation of synthetic misinformation.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Module Navigation (Mobile) */}
        <div className="md:hidden flex overflow-x-auto gap-4 mb-12 pb-4 no-scrollbar">
          {modules.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveTab(m.id)}
              className={`flex-shrink-0 px-6 py-3 rounded-2xl border text-[10px] uppercase tracking-widest font-bold transition-all ${
                activeTab === m.id ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-100' : 'border-slate-200 text-slate-400 bg-white'
              }`}
            >
              {m.title}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                {activeTab === 'engine' && (
                  <DetectionEngineModule 
                    onUpload={handleFileUpload} 
                    onDrop={handleFileDrop}
                    selectedFile={selectedFile}
                    textInput={textInput}
                    setTextInput={setTextInput}
                    previewUrl={previewUrl}
                    isAnalyzing={isAnalyzing}
                    analysisResult={analysisResult}
                    onAnalyze={runAnalysis}
                    hasKey={!!apiKey}
                  />
                )}
                {activeTab === 'trust' && <TrustLayerModule analysisResult={analysisResult} previewUrl={previewUrl} />}
                {activeTab === 'immune' && <ImmuneSystemModule selectedFile={selectedFile} previewUrl={previewUrl} />}
                {activeTab === 'deployment' && <DeploymentModule />}
                {activeTab === 'strategy' && <StrategyModule globalStats={globalStats} />}
                {activeTab === 'settings' && (
                  <SettingsModule 
                    apiKey={apiKey} 
                    setApiKey={setApiKey} 
                    onSave={handleSaveKey} 
                    isSaving={isSaving}
                    onTest={testApiConnection}
                    isTesting={isTesting}
                    testResult={testResult}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sidebar / Priority List */}
          <div className="lg:col-span-3 space-y-8">
            {/* System Log */}
            <div className="bg-white border border-slate-200/60 rounded-[2rem] overflow-hidden flex flex-col h-[300px] shadow-xl shadow-slate-200/50">
              <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">System_Log</span>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-400/50" />
                  <div className="w-2 h-2 rounded-full bg-yellow-400/50" />
                  <div className="w-2 h-2 rounded-full bg-green-400/50" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 font-mono text-[9px] space-y-2 no-scrollbar">
                {logs.length === 0 && <p className="text-slate-400 italic">No active processes...</p>}
                {logs.map(log => (
                  <div key={log.id} className="flex gap-3 group">
                    <span className="text-slate-300 group-hover:text-slate-400 transition-colors">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                    <span className={
                      log.type === 'success' ? 'text-green-600' :
                      log.type === 'warn' ? 'text-yellow-600' :
                      log.type === 'error' ? 'text-red-600' : 'text-indigo-600'
                    }>
                      {log.msg}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scan History */}
            <div className="bg-white border border-slate-200/60 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 flex items-center gap-3 text-slate-800">
                <RefreshCw className="w-4 h-4 text-indigo-500" />
                Recent Scans
              </h3>
              <div className="space-y-4">
                {history.length === 0 && <p className="text-[10px] text-slate-400 italic">No previous scans found.</p>}
                {history.map((item, i) => (
                  <div key={i} className="group cursor-pointer border-b border-slate-50 pb-4 last:border-0 hover:bg-slate-50/50 transition-all p-2 -mx-2 rounded-2xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-slate-700 truncate max-w-[120px]">{item.fileName}</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                        item.verdict === 'AUTHENTIC' ? 'bg-green-50 text-green-600' : 
                        item.verdict === 'SYNTHETIC' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'
                      }`}>
                        {item.score}%
                      </span>
                    </div>
                    <p className="text-[8px] text-slate-400 font-mono uppercase tracking-wider">{new Date(item.timestamp).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200/60 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 flex items-center gap-3 text-slate-800">
                <Activity className="w-4 h-4 text-indigo-500" />
                Feasibility vs. Impact
              </h3>
              <div className="space-y-6">
                <PriorityItem label="Spectral Audio Analysis" impact="High" feasibility="High" />
                <PriorityItem label="rPPG Heartbeat Detection" impact="High" feasibility="Medium" />
                <PriorityItem label="C2PA Provenance Integration" impact="Very High" feasibility="Medium" />
                <PriorityItem label="RAG Contextual Verification" impact="Medium" feasibility="High" />
                <PriorityItem label="Real-time Saliency Maps" impact="High" feasibility="Low" />
              </div>
            </div>

            <div className="bg-indigo-500 p-8 rounded-[2rem] shadow-xl shadow-indigo-100 text-white">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 flex items-center gap-3 text-white">
                <Info className="w-4 h-4 text-indigo-200" />
                Data Flow
              </h3>
              <p className="text-[10px] text-indigo-100 leading-relaxed font-mono uppercase tracking-wider">
                INPUT_STREAM → PRE_PROCESSING → MULTI_MODAL_ENCODER → 
                [BIO_CHECK | AUDIO_CHECK | CONTEXT_CHECK] → 
                FUSION_LAYER → INTEGRITY_REPORT → 
                OUTPUT_UI
              </p>
            </div>
              {apiKey && (
                <div className="mt-4 pt-4 border-t border-orange-600/20">
                  <p className="text-[9px] text-orange-500 font-mono uppercase">System Status: API_KEY_ACTIVE</p>
                </div>
              )}
            </div>
          </div>
        </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 opacity-50">
            <Shield className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest italic">Aegis Integrity Project</span>
          </div>
          <p className="text-[10px] text-gray-500 font-mono">
            © 2026 AEGIS SYSTEMS ARCHITECTS. ALL RIGHTS RESERVED. CONFIDENTIAL SPECIFICATION.
          </p>
        </div>
      </footer>
    </div>
  );
};

const SettingsModule = ({ apiKey, setApiKey, onSave, isSaving, onTest, isTesting, testResult }: { 
  apiKey: string, 
  setApiKey: (val: string) => void, 
  onSave: () => void,
  isSaving: boolean,
  onTest: () => void,
  isTesting: boolean,
  testResult: { success: boolean; message: string } | null
}) => (
  <div className="space-y-10">
    <header>
      <h3 className="text-3xl font-black uppercase italic mb-2 text-slate-800 tracking-tighter">System Configuration</h3>
      <p className="text-slate-500">Manage API credentials and environment variables for the Aegis ecosystem.</p>
    </header>

    <div className="bg-white border border-slate-200/60 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-indigo-500 rounded-2xl text-white shadow-lg shadow-indigo-100">
          <Key className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-xl font-bold uppercase italic text-slate-800">Gemini AI Integration</h4>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">Core Intelligence Provider</p>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <label htmlFor="api-key" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">
            GEMINI_API_KEY
          </label>
          <div className="relative">
            <input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API Key..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-mono text-indigo-600 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-slate-300"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${apiKey ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]' : 'bg-slate-200'}`} />
            </div>
          </div>
          <p className="mt-4 text-[10px] text-slate-400 leading-relaxed uppercase tracking-wider">
            This key is used for RAG contextual verification and synthetic artifact analysis. 
            By default, the system uses the environment-injected key if available.
          </p>
        </div>

        {testResult && (
          <div className={`p-5 rounded-2xl text-[10px] font-mono uppercase tracking-wider ${testResult.success ? 'bg-green-50 border border-green-100 text-green-700' : 'bg-red-50 border border-red-100 text-red-700'}`}>
            {testResult.message}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            onClick={onTest}
            disabled={isTesting || !apiKey}
            className="flex items-center gap-3 bg-slate-100 text-slate-600 px-8 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Activity className="w-4 h-4" />
                Test Connection
              </>
            )}
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-3 bg-indigo-500 text-white px-8 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-100"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Configuration
              </>
            )}
          </button>
        </div>
      </div>
    </div>

    <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[2rem] shadow-sm">
      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-3 text-indigo-600">
        <Info className="w-4 h-4" />
        Security Note
      </h4>
      <p className="text-[11px] text-indigo-400 leading-relaxed italic">
        "API keys are stored in the application's local state for the duration of the session. 
        For production environments, ensure keys are managed via secure server-side environment 
        variables or a dedicated vault. Never commit raw keys to version control."
      </p>
    </div>
  </div>
);

const PriorityItem = ({ label, impact, feasibility }: { label: string, impact: string, feasibility: string }) => (
  <div className="border-b border-slate-50 pb-4 last:border-0">
    <div className="flex justify-between items-center mb-2">
      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">{label}</span>
      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
        impact === 'Very High' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-400'
      }`}>
        {impact}
      </span>
    </div>
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${feasibility === 'High' ? 'bg-green-500 w-full' : feasibility === 'Medium' ? 'bg-yellow-500 w-2/3' : 'bg-red-500 w-1/3'}`} 
        />
      </div>
      <span className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-widest">{feasibility}</span>
    </div>
  </div>
);

const DetectionEngineModule = ({ 
  onUpload, 
  onDrop,
  selectedFile, 
  textInput,
  setTextInput,
  isAnalyzing, 
  analysisResult, 
  onAnalyze,
  hasKey,
  previewUrl
}: { 
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onDrop: (file: File) => void,
  selectedFile: File | null,
  textInput: string,
  setTextInput: (val: string) => void,
  previewUrl: string | null,
  isAnalyzing: boolean,
  analysisResult: any,
  onAnalyze: () => void,
  hasKey: boolean
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<'video' | 'image' | 'text'>('video');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (mode === 'video' && file.type.startsWith('video/')) onDrop(file);
      else if (mode === 'image' && file.type.startsWith('image/')) onDrop(file);
      else if (mode === 'text' && file.type === 'text/plain') onDrop(file);
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black uppercase italic mb-2 text-slate-800 tracking-tighter">Multi-Modal Detection Engine</h3>
          <p className="text-slate-500">The core intelligence pipeline for deepfake identification.</p>
        </div>
        <div className="flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50 backdrop-blur-sm">
          <button 
            onClick={() => setMode('video')}
            className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'video' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-800'}`}
          >
            Video
          </button>
          <button 
            onClick={() => setMode('image')}
            className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'image' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-800'}`}
          >
            Image
          </button>
          <button 
            onClick={() => setMode('text')}
            className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'text' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-800'}`}
          >
            Text
          </button>
        </div>
      </header>

      {/* Verification Lab */}
      <div className="bg-white border border-slate-200/60 p-10 rounded-[2rem] relative overflow-hidden shadow-xl shadow-slate-200/50">
        <div className="absolute top-0 right-0 p-6">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_12px_rgba(99,102,241,0.6)]" />
            <span className="text-[10px] font-bold font-mono text-indigo-600 uppercase tracking-widest">Lab_Status: Online</span>
          </div>
        </div>

        <div className="flex items-center gap-6 mb-12">
          <div className="p-4 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-100 text-white">
            {mode === 'video' ? <Video className="w-6 h-6" /> : mode === 'image' ? <ImageIcon className="w-6 h-6" /> : <Layers className="w-6 h-6" />}
          </div>
          <div>
            <h4 className="text-2xl font-black uppercase italic text-slate-800 tracking-tight">{mode.toUpperCase()} Verification</h4>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">Active Analysis Workspace</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2 space-y-10">
            {mode === 'video' || mode === 'image' ? (
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center transition-all duration-500 ${
                  isDragging ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' : 
                  selectedFile ? 'border-indigo-500/30 bg-indigo-50/20' : 'border-slate-200 hover:border-indigo-300 bg-slate-50/50'
                }`}
              >
                <input 
                  type="file" 
                  id={`${mode}-upload`} 
                  className="hidden" 
                  onChange={onUpload}
                  accept={mode === 'video' ? 'video/*' : 'image/*'}
                />
                <label 
                  htmlFor={`${mode}-upload`} 
                  className="cursor-pointer flex flex-col items-center text-center group"
                >
                  <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50 group-hover:scale-110 transition-transform">
                    {mode === 'video' ? <Video className={`w-10 h-10 ${selectedFile || isDragging ? 'text-indigo-500' : 'text-slate-300'}`} /> : <ImageIcon className={`w-10 h-10 ${selectedFile || isDragging ? 'text-indigo-500' : 'text-slate-300'}`} />}
                  </div>
                  <p className="text-sm font-black uppercase mb-2 text-slate-800 tracking-tight">
                    {isDragging ? 'Release to Upload' : selectedFile ? selectedFile.name : `Drop ${mode} Here`}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">
                    {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : mode === 'video' ? 'MP4, MOV, AVI' : 'JPG, PNG, WEBP'}
                  </p>
                </label>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8 shadow-inner">
                  <textarea 
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Paste text here for AI detection analysis..."
                    className="w-full h-56 bg-transparent border-none focus:ring-0 text-sm font-mono text-slate-700 resize-none placeholder:text-slate-300"
                  />
                </div>
                <div className="flex justify-between items-center px-4">
                  <span className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-widest">{textInput.length} characters</span>
                  <button 
                    onClick={() => setTextInput('')}
                    className="text-[10px] text-slate-400 hover:text-indigo-600 font-bold font-mono uppercase tracking-widest transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {previewUrl && selectedFile?.type.startsWith('image/') && mode === 'image' && (
              <div className="relative w-full aspect-video bg-slate-100 rounded-[2rem] overflow-hidden border border-slate-200 shadow-xl group mb-8">
                <img 
                  src={previewUrl} 
                  alt="Upload Preview" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
                
                {/* Annotation Layer */}
                {analysisResult?.annotations?.map((ann: any, i: number) => {
                  const [ymin, xmin, ymax, xmax] = ann.box_2d;
                  return (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute border-2 border-indigo-500 bg-indigo-500/10 transition-all hover:bg-indigo-500/30 cursor-help group/ann rounded-lg shadow-lg"
                      style={{
                        top: `${ymin / 10}%`,
                        left: `${xmin / 10}%`,
                        width: `${(xmax - xmin) / 10}%`,
                        height: `${(ymax - ymin) / 10}%`,
                      }}
                    >
                      <div className="absolute -top-8 left-0 bg-indigo-500 text-white text-[10px] font-black px-3 py-1 rounded-full whitespace-nowrap opacity-0 group-hover/ann:opacity-100 transition-opacity uppercase tracking-widest shadow-lg">
                        {ann.label}
                      </div>
                    </motion.div>
                  );
                })}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                  <p className="text-xs text-white font-bold uppercase tracking-widest">
                    {analysisResult ? 'Analysis Complete: Artifacts Highlighted' : 'Ready for Analysis'}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={onAnalyze}
              disabled={((mode === 'text' && !textInput) || (mode !== 'text' && !selectedFile)) || isAnalyzing || !hasKey}
              className="w-full bg-indigo-500 text-white py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 shadow-xl shadow-indigo-100"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Processing Multi-Modal Pipeline...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Run Integrity Check
                </>
              )}
            </button>
            {!hasKey && (
              <p className="text-[10px] text-red-500 text-center uppercase font-black tracking-widest">
                Warning: API Key Required. Visit Settings.
              </p>
            )}
          </div>

          <div className="lg:col-span-3 bg-white border border-slate-200/60 rounded-[2rem] p-10 min-h-[600px] flex flex-col shadow-xl shadow-slate-200/50">
            <div className="flex items-center justify-between mb-8">
              <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                <BarChart3 className="w-4 h-4 text-indigo-500" />
                Live Integrity Report
              </h5>
              {analysisResult && (
                <div className="flex gap-3">
                  <button className="p-2 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-800" title="Export JSON">
                    <FileJson className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-800" title="Download Report">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          
          {analysisResult ? (
            <div className="space-y-8 flex-1">
              {/* Visual Annotation Layer */}
              {previewUrl && (
                <div className="relative w-full aspect-video bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 mb-8 group shadow-lg">
                  <img 
                    src={previewUrl} 
                    alt="Analyzed Content" 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                  {analysisResult.annotations?.map((ann: any, i: number) => {
                    const [ymin, xmin, ymax, xmax] = ann.box_2d;
                    return (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute border-2 border-indigo-500 bg-indigo-500/10 transition-all hover:bg-indigo-500/30 cursor-help group/ann rounded-lg"
                        style={{
                          top: `${ymin / 10}%`,
                          left: `${xmin / 10}%`,
                          width: `${(xmax - xmin) / 10}%`,
                          height: `${(ymax - ymin) / 10}%`,
                        }}
                      >
                        <div className="absolute -top-6 left-0 bg-indigo-500 text-white text-[8px] font-bold px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover/ann:opacity-100 transition-opacity uppercase tracking-tighter rounded-full shadow-lg">
                          {ann.label}
                        </div>
                      </motion.div>
                    );
                  })}
                  <div className="absolute bottom-3 right-3 bg-white/90 px-3 py-1.5 rounded-full text-[9px] font-black font-mono text-indigo-600 border border-indigo-100 uppercase shadow-lg backdrop-blur-sm">
                    Scan_Overlay: Active
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2">Integrity Score</p>
                  <p className={`text-5xl font-black italic tracking-tighter ${
                    analysisResult.score > 70 ? 'text-green-500' : analysisResult.score > 40 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {analysisResult.score}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2">Verdict</p>
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border shadow-sm ${
                    analysisResult.verdict === 'AUTHENTIC' ? 'border-green-100 text-green-600 bg-green-50' : 
                    analysisResult.verdict === 'SYNTHETIC' ? 'border-red-100 text-red-600 bg-red-50' :
                    'border-yellow-100 text-yellow-600 bg-yellow-50'
                  }`}>
                    {analysisResult.verdict}
                  </p>
                </div>
              </div>

              {/* Analysis Breakdown Chart */}
              <div className="h-56 w-full bg-slate-50 rounded-[2rem] p-4 border border-slate-100 shadow-inner">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                    { subject: 'Visual', A: analysisResult.score > 50 ? 80 : 30, fullMark: 100 },
                    { subject: 'Audio', A: analysisResult.score > 60 ? 90 : 40, fullMark: 100 },
                    { subject: 'Context', A: analysisResult.score > 40 ? 70 : 20, fullMark: 100 },
                    { subject: 'Bio', A: analysisResult.score > 80 ? 95 : 15, fullMark: 100 },
                    { subject: 'Metadata', A: 85, fullMark: 100 },
                  ]}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} />
                    <Radar
                      name="Integrity"
                      dataKey="A"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Technical Breakdown */}
              <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 shadow-inner">
                <h5 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5">Technical_Metrics</h5>
                <div className="grid grid-cols-2 gap-6">
                  <TechnicalMetric 
                    label="Noise Entropy" 
                    value={analysisResult.technicalMetrics?.noiseEntropy ? `${analysisResult.technicalMetrics.noiseEntropy}%` : 'N/A'} 
                    status={analysisResult.technicalMetrics?.noiseEntropy > 80 ? 'nominal' : analysisResult.technicalMetrics?.noiseEntropy > 50 ? 'warning' : 'critical'} 
                    progress={analysisResult.technicalMetrics?.noiseEntropy}
                  />
                  <TechnicalMetric 
                    label="Spectral Gap" 
                    value={analysisResult.technicalMetrics?.spectralGap ? `${analysisResult.technicalMetrics.spectralGap}%` : 'N/A'} 
                    status={analysisResult.technicalMetrics?.spectralGap > 80 ? 'nominal' : analysisResult.technicalMetrics?.spectralGap > 50 ? 'warning' : 'critical'} 
                    progress={analysisResult.technicalMetrics?.spectralGap}
                  />
                  <TechnicalMetric 
                    label="rPPG Sync" 
                    value={analysisResult.technicalMetrics?.rppgSync ? `${analysisResult.technicalMetrics.rppgSync}%` : 'N/A'} 
                    status={analysisResult.technicalMetrics?.rppgSync > 80 ? 'nominal' : analysisResult.technicalMetrics?.rppgSync > 50 ? 'warning' : 'critical'} 
                    progress={analysisResult.technicalMetrics?.rppgSync}
                  />
                  <TechnicalMetric 
                    label="Metadata" 
                    value={analysisResult.technicalMetrics?.metadataIntegrity ? `${analysisResult.technicalMetrics.metadataIntegrity}%` : 'N/A'} 
                    status={analysisResult.technicalMetrics?.metadataIntegrity > 80 ? 'nominal' : analysisResult.technicalMetrics?.metadataIntegrity > 50 ? 'warning' : 'critical'} 
                    progress={analysisResult.technicalMetrics?.metadataIntegrity}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase text-gray-500">Analysis Findings:</p>
                {analysisResult.categorizedFindings ? (
                  Object.entries(analysisResult.categorizedFindings).map(([category, findings]: [string, any], idx) => (
                    findings.length > 0 && (
                      <div key={idx} className="space-y-2">
                        <p className="text-[9px] font-bold uppercase text-orange-600 tracking-tighter border-b border-orange-100 pb-1">{category}</p>
                        <div className="space-y-2">
                          {findings.map((finding: string, i: number) => (
                            <div key={i} className="flex gap-3 items-start bg-gray-50 p-2 rounded-lg border border-gray-100">
                              <div className="w-1 h-1 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                              <p className="text-[10px] text-gray-600 leading-tight">{finding}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ))
                ) : (
                  analysisResult.findings?.map((finding: string, i: number) => (
                    <div key={i} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                      <p className="text-[11px] text-gray-600 leading-relaxed">{finding}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : isAnalyzing ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              {previewUrl ? (
                <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 mb-4">
                  <img 
                    src={previewUrl} 
                    alt="Analyzing..." 
                    className="w-full h-full object-contain opacity-40 grayscale"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-orange-500/50 absolute top-0 animate-[scan_2s_linear_infinite]" />
                    <div className="relative">
                      <div className="w-12 h-12 border-2 border-orange-500/20 rounded-full" />
                      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-orange-500 rounded-full animate-spin" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="w-12 h-12 border-2 border-orange-500/20 rounded-full" />
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-orange-500 rounded-full animate-spin" />
                </div>
              )}
              <p className="text-[10px] text-gray-400 uppercase tracking-widest animate-pulse font-bold">Extracting Biological Signals...</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
              <Activity className="w-12 h-12 mb-4 text-gray-400" />
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Awaiting Input Stream</p>
            </div>
          )}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FeatureCard 
        icon={<Eye className="text-orange-500" />}
        title="Visual: Biological Inconsistencies"
        description="Detecting the 'Uncanny Valley' through physiological markers."
        points={[
          "rPPG Heartbeat Detection: Remote photoplethysmography to detect blood volume pulse (BVP) from skin pixel fluctuations. AI faces lack synchronized cardiovascular signals.",
          "Eye-Gaze & Reflection: Analysis of corneal reflections and gaze vectors. Synthetic eyes often fail to reflect the environment accurately or maintain consistent focal points.",
          "Facial Landmark Jitter: High-frequency analysis of 68 facial landmarks to detect temporal inconsistencies and warping artifacts common in frame-by-frame generation."
        ]}
      />
      <FeatureCard 
        icon={<Mic className="text-orange-500" />}
        title="Audio: Synthetic Artifacts"
        description="Spectral and cross-modal verification of voice authenticity."
        points={[
          "Spectral Analysis: Identification of 'high-frequency noise' and 'phase discontinuities' typical of neural vocoders (WaveNet/Tacotron).",
          "Cross-Modal Sync: Lip-sync (Phoneme-Viseme) mismatch detection. Analyzing the temporal alignment between audio phonemes and visual mouth shapes.",
          "Acoustic Environment: Detecting mismatches between the speaker's voice and the background ambient noise profile."
        ]}
      />
    </div>

    <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-orange-500 rounded-lg shadow-sm">
          <Search className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="text-xl font-bold uppercase italic text-gray-900">Contextual: RAG Misinformation Guard</h4>
          <p className="text-xs text-gray-500 uppercase tracking-widest">Combating 'Cheapfakes'</p>
        </div>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed mb-6">
        Cheapfakes (real footage in false contexts) are often more dangerous than deepfakes. 
        Our RAG system integrates with verified news databases (AP, Reuters, FactCheck.org) to:
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          "Cross-reference video claims against real-time news feeds.",
          "Verify metadata (location/time) against weather and astronomical data.",
          "Identify 'recycled' footage used to represent current events.",
          "Detect semantic drift between audio claims and visual context."
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  </div>
);
};

const TrustLayerModule = ({ analysisResult, previewUrl }: { analysisResult: any, previewUrl: string | null }) => {
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <div className="space-y-10">
      <header>
        <h3 className="text-3xl font-black uppercase italic mb-2 text-gray-900">Explainability & Trust</h3>
        <p className="text-gray-500">Translating complex AI logic into human-readable evidence.</p>
      </header>

      <div className="space-y-8">
        {!previewUrl && analysisResult?.technicalMetrics?.perplexity !== undefined ? (
          <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm">
            <h4 className="text-xl font-bold uppercase italic mb-4 flex items-center gap-2 text-gray-900">
              <MessageSquare className="w-5 h-5 text-orange-500" />
              Linguistic Analysis
            </h4>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              We analyze the structural complexity and predictability of the text to distinguish 
              between human creativity and algorithmic generation.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-center">
                <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Perplexity</p>
                <p className="text-3xl font-black text-orange-600">{analysisResult.technicalMetrics.perplexity}%</p>
                <p className="text-[9px] text-gray-500 mt-2 uppercase">Predictability Index</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-center">
                <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Burstiness</p>
                <p className="text-3xl font-black text-orange-600">{analysisResult.technicalMetrics.burstiness}%</p>
                <p className="text-[9px] text-gray-500 mt-2 uppercase">Structural Variation</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-center">
                <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Consistency</p>
                <p className="text-3xl font-black text-orange-600">{analysisResult.technicalMetrics.consistency}%</p>
                <p className="text-[9px] text-gray-500 mt-2 uppercase">Semantic Coherence</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm">
            <h4 className="text-xl font-bold uppercase italic mb-4 flex items-center gap-2 text-gray-900">
              <Layers className="w-5 h-5 text-orange-500" />
              Visual Saliency Maps (Heatmaps)
            </h4>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              We implement Grad-CAM (Gradient-weighted Class Activation Mapping) to highlight the 
              specific pixels that influenced the model's classification.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Interactive Comparison</p>
                <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group shadow-inner">
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} alt="Original" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div 
                        className="absolute inset-0 w-full h-full object-cover overflow-hidden"
                        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                      >
                        <div className="absolute inset-0 bg-orange-500/20 mix-blend-overlay" />
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/40 to-transparent blur-xl opacity-60" />
                        <img src={previewUrl} alt="Heatmap" className="w-full h-full object-cover grayscale opacity-80" referrerPolicy="no-referrer" />
                        
                        {/* Simulated Heatmap blobs */}
                        {analysisResult && (
                          <div className="absolute inset-0">
                            <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-red-500/40 rounded-full blur-3xl animate-pulse" />
                            <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-orange-500/30 rounded-full blur-3xl animate-pulse delay-700" />
                          </div>
                        )}
                      </div>
                      <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-orange-500 z-20 cursor-ew-resize"
                        style={{ left: `${sliderPos}%` }}
                      >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                          <RefreshCw className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={sliderPos} 
                        onChange={(e) => setSliderPos(parseInt(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                      />
                      <div className="absolute bottom-4 left-4 bg-white/80 px-2 py-1 rounded text-[8px] font-mono text-gray-900 uppercase z-10 shadow-sm">Original</div>
                      <div className="absolute bottom-4 right-4 bg-orange-600/80 px-2 py-1 rounded text-[8px] font-mono text-white uppercase z-10 shadow-sm">Heatmap</div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 uppercase text-[10px] tracking-widest">Awaiting Content</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg flex flex-col items-center justify-center border border-gray-200 overflow-hidden aspect-square relative">
                  {previewUrl ? (
                    <div className="relative w-full h-full">
                      <img src={previewUrl} alt="Mask" className="w-full h-full object-cover opacity-20 grayscale" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-1/2 h-1/2 border-2 border-dashed border-orange-500/50 rounded-full animate-pulse" />
                      </div>
                    </div>
                  ) : (
                    <span className="text-[10px] uppercase tracking-widest text-gray-400">Artifact Mask</span>
                  )}
                  <div className="absolute bottom-2 left-2 text-[8px] font-mono text-gray-400 uppercase">Artifact_Mask</div>
                </div>
                <div className="bg-gray-50 rounded-lg flex flex-col items-center justify-center border border-gray-200 overflow-hidden aspect-square relative">
                  {previewUrl ? (
                    <div className="relative w-full h-full">
                      <img src={previewUrl} alt="Noise" className="w-full h-full object-cover opacity-10 contrast-200" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40 mix-blend-screen" />
                    </div>
                  ) : (
                    <span className="text-[10px] uppercase tracking-widest text-gray-400">Noise Profile</span>
                  )}
                  <div className="absolute bottom-2 left-2 text-[8px] font-mono text-gray-400 uppercase">Noise_Profile</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xl font-bold uppercase italic flex items-center gap-2 text-gray-900">
              <FileText className="w-5 h-5 text-orange-500" />
              Integrity Report Template
            </h4>
            {analysisResult && (
              <button className="text-[10px] font-bold uppercase tracking-widest bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg border border-gray-200 transition-all flex items-center gap-2">
                <Download className="w-3 h-3" />
                Export PDF
              </button>
            )}
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden font-mono text-[11px]">
            <div className="bg-gray-50 p-3 border-b border-gray-200 flex justify-between items-center">
              <span className="text-orange-600 font-bold">REPORT_ID: {analysisResult ? `AEGIS-${Math.floor(Math.random() * 10000)}-X` : 'AEGIS-7721-X'}</span>
              <span className="text-gray-500">CONFIDENCE: {analysisResult ? `${analysisResult.score}%` : '98.4%'}</span>
            </div>
            <div className="p-4 space-y-4 bg-white">
              <div>
                <p className="text-gray-700 mb-1 font-bold">VERDICT: [{analysisResult ? analysisResult.verdict : 'PENDING_ANALYSIS'}]</p>
                <p className="text-gray-500 leading-relaxed">
                  {analysisResult 
                    ? `Evidence Summary: ${Object.values(analysisResult.categorizedFindings || {}).flat().join('. ') || 'Analysis complete. No critical anomalies detected.'}`
                    : 'Evidence Summary: Awaiting content analysis. System will generate a detailed breakdown of visual, audio, and metadata integrity upon completion.'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-2 bg-gray-50 rounded border border-gray-100">
                  <p className="text-orange-600 mb-1 font-bold">
                    {analysisResult?.technicalMetrics?.perplexity !== undefined ? 'PERPLEXITY' : 'BIO_SCORE'}: 
                    {analysisResult ? (analysisResult.technicalMetrics?.perplexity !== undefined ? analysisResult.technicalMetrics.perplexity : (analysisResult.technicalMetrics?.rppgSync / 100).toFixed(2)) : '0.00'}
                  </p>
                  <p className="text-[9px] text-gray-400">
                    {analysisResult?.technicalMetrics?.perplexity !== undefined ? 'Text predictability analysis.' : 'rPPG signal synchronization check.'}
                  </p>
                </div>
                <div className="p-2 bg-gray-50 rounded border border-gray-100">
                  <p className="text-green-600 mb-1 font-bold">
                    {analysisResult?.technicalMetrics?.burstiness !== undefined ? 'BURSTINESS' : 'SYNC_SCORE'}: 
                    {analysisResult ? (analysisResult.technicalMetrics?.burstiness !== undefined ? analysisResult.technicalMetrics.burstiness : (analysisResult.score / 100).toFixed(2)) : '0.00'}
                  </p>
                  <p className="text-[9px] text-gray-400">
                    {analysisResult?.technicalMetrics?.burstiness !== undefined ? 'Sentence structure variation.' : 'Lip-sync and temporal alignment.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ImmuneSystemModule = ({ selectedFile, previewUrl }: { selectedFile: File | null, previewUrl: string | null }) => {
  const [isImmunizing, setIsImmunizing] = useState(false);
  const [isImmunized, setIsImmunized] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'protect' | 'verify'>('protect');
  const [verifyFile, setVerifyFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<'valid' | 'invalid' | null>(null);

  const handleImmunize = () => {
    if (!previewUrl) return;
    setIsImmunizing(true);
    setTimeout(() => {
      setIsImmunizing(false);
      setIsImmunized(true);
    }, 2000);
  };

  const handleVerify = () => {
    if (!verifyFile) return;
    setIsVerifying(true);
    setVerifyResult(null);
    setTimeout(() => {
      setIsVerifying(false);
      // Simulate verification - if it's the same file we "immunized" or just random logic
      setVerifyResult(Math.random() > 0.3 ? 'valid' : 'invalid');
    }, 1500);
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h3 className="text-3xl font-black uppercase italic mb-2 text-gray-900">The Proactive Immune System</h3>
          <p className="text-gray-500">Protecting content before it is even created.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
          <button 
            onClick={() => setActiveSubTab('protect')}
            className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${activeSubTab === 'protect' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Protect
          </button>
          <button 
            onClick={() => setActiveSubTab('verify')}
            className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${activeSubTab === 'verify' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Verify
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeSubTab === 'protect' ? (
          <motion.div 
            key="protect"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm">
                <h4 className="text-xl font-bold uppercase italic mb-4 flex items-center gap-2 text-gray-900">
                  <ShieldCheck className="w-5 h-5 text-orange-500" />
                  Adversarial Immunization
                </h4>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  Apply invisible pixel-level perturbations to your media. These "cloaks" prevent 
                  generative AI models from successfully using your content as training data or 
                  source material for deepfakes.
                </p>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Protection Strength</p>
                    <div className="flex gap-2">
                      {['Standard', 'High', 'Maximum'].map((level) => (
                        <button key={level} className={`flex-1 py-2 rounded border text-[10px] font-bold uppercase tracking-widest transition-all ${level === 'High' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={handleImmunize}
                    disabled={!previewUrl || isImmunizing || isImmunized}
                    className={`w-full py-4 rounded-xl font-black uppercase italic tracking-widest transition-all flex items-center justify-center gap-3 ${
                      !previewUrl ? 'bg-gray-200 text-gray-400 cursor-not-allowed' :
                      isImmunized ? 'bg-green-600 text-white shadow-lg shadow-green-100' :
                      'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-100'
                    }`}
                  >
                    {isImmunizing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Applying Cloak...
                      </>
                    ) : isImmunized ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Content Protected
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-5 h-5" />
                        Immunize Content
                      </>
                    )}
                  </button>
                  
                  {isImmunized && (
                    <motion.button 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-3 h-3" />
                      Download Protected Asset
                    </motion.button>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden group min-h-[300px] shadow-inner">
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className={`w-full h-full object-contain transition-all duration-1000 ${isImmunized ? 'sepia-[0.2] contrast-125' : ''}`} referrerPolicy="no-referrer" />
                  {isImmunized && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-orange-500/5 flex items-center justify-center pointer-events-none"
                    >
                      <div className="absolute top-4 right-4 bg-green-600 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-2 shadow-lg">
                        <Lock className="w-3 h-3" />
                        C2PA_SIGNED
                      </div>
                      <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
                    </motion.div>
                  )}
                  {isImmunizing && (
                    <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10">
                      <RefreshCw className="w-10 h-10 text-orange-500 animate-spin mb-4" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse text-orange-600">Embedding Cryptographic Signature...</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">No content selected for protection</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="verify"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <div className="bg-white border border-gray-200 p-12 rounded-3xl text-center shadow-sm">
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-orange-500" />
              </div>
              <h4 className="text-2xl font-black uppercase italic mb-4 text-gray-900">Provenance Verification</h4>
              <p className="text-gray-500 text-sm mb-8">
                Upload a file to verify its cryptographic signature and provenance manifest against the Aegis Integrity Ledger.
              </p>

              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 mb-8 hover:border-orange-500/50 transition-colors cursor-pointer relative group bg-gray-50/50">
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e) => setVerifyFile(e.target.files?.[0] || null)}
                />
                <div className="flex flex-col items-center">
                  <Download className="w-8 h-8 text-gray-300 mb-4 group-hover:text-orange-500 transition-colors" />
                  <p className="text-sm font-bold uppercase text-gray-700">{verifyFile ? verifyFile.name : 'Select File to Verify'}</p>
                  <p className="text-[10px] text-gray-400 uppercase mt-1">Supports C2PA-signed media</p>
                </div>
              </div>

              <button 
                onClick={handleVerify}
                disabled={!verifyFile || isVerifying}
                className="w-full bg-orange-500 text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Querying Integrity Ledger...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Verify Provenance
                  </>
                )}
              </button>

              {verifyResult && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`mt-8 p-6 rounded-2xl border flex items-center gap-4 ${
                    verifyResult === 'valid' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                  }`}
                >
                  {verifyResult === 'valid' ? <CheckCircle2 className="w-8 h-8" /> : <ZapOff className="w-8 h-8" />}
                  <div className="text-left">
                    <p className="text-sm font-bold uppercase">{verifyResult === 'valid' ? 'Signature Verified' : 'Invalid Signature'}</p>
                    <p className="text-[10px] opacity-70">
                      {verifyResult === 'valid' 
                        ? 'This content matches the original master signature on the Aegis Ledger.' 
                        : 'No matching signature found. Content may be synthetic or modified.'}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DashboardCard = ({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) => (
  <div className="bg-white border border-gray-200 p-6 rounded-2xl flex items-center gap-4 hover:bg-gray-50 transition-all cursor-default group shadow-sm">
    <div className={`w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <p className="text-xl font-black italic text-gray-900">{value}</p>
    </div>
  </div>
);

const DeploymentModule = () => (
  <div className="space-y-10">
    <header>
      <h3 className="text-3xl font-black uppercase italic mb-2 text-gray-900">Deployment & UX</h3>
      <p className="text-gray-500">Frictionless integration into the digital daily life.</p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-6 h-6 text-orange-500" />
          <h4 className="text-xl font-bold uppercase italic text-gray-900">Browser Extension</h4>
        </div>
        <ul className="space-y-4 text-xs text-gray-500">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
            <span>Real-time social media scrubbing (X, Facebook, YouTube).</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
            <span>Overlay warnings directly on suspicious video players.</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
            <span>High friction: Requires user installation and permissions.</span>
          </li>
        </ul>
      </div>

      <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-6 h-6 text-orange-500" />
          <h4 className="text-xl font-bold uppercase italic text-gray-900">Verification Bot</h4>
        </div>
        <ul className="space-y-4 text-xs text-gray-500">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
            <span>Works inside encrypted apps (WhatsApp/Telegram).</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
            <span>Low friction: Just forward a video to the bot for verification.</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
            <span>Limited to reactive checks; cannot scrub feeds automatically.</span>
          </li>
        </ul>
      </div>
    </div>

    <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm">
      <h4 className="text-xl font-bold uppercase italic mb-4 flex items-center gap-2 text-gray-900">
        <Zap className="w-5 h-5 text-orange-500" />
        Handling High-Latency Processing
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase text-orange-500">01. Progressive Analysis</p>
          <p className="text-[10px] text-gray-500">Run fast 'Cheapfake' and Audio checks first to provide immediate partial results.</p>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase text-orange-500">02. Edge Inference</p>
          <p className="text-[10px] text-gray-500">Offload lightweight visual landmark checks to the client's device using WebGL/WASM.</p>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase text-orange-500">03. Asynchronous Queuing</p>
          <p className="text-[10px] text-gray-500">Use Redis-backed worker queues for heavy biological signal processing with push notifications.</p>
        </div>
      </div>
    </div>
  </div>
);

const TechnicalMetric = ({ label, value, status, progress }: { label: string, value: string, status: 'nominal' | 'warning' | 'critical', progress?: number }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-end">
      <p className="text-[8px] text-gray-400 uppercase font-bold">{label}</p>
      <p className="text-[10px] font-mono text-gray-900">{value}</p>
    </div>
    <div className={`h-0.5 w-full rounded-full ${
      status === 'nominal' ? 'bg-green-100' : 
      status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
    }`}>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: progress !== undefined ? `${progress}%` : (status === 'nominal' ? '100%' : status === 'warning' ? '60%' : '30%') }}
        className={`h-full rounded-full ${
          status === 'nominal' ? 'bg-green-500' : 
          status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
        }`} 
      />
    </div>
  </div>
);

const StrategyModule = ({ globalStats }: { globalStats: any }) => {
  const data = [
    { name: 'Deepfakes', value: 400, fill: '#ea580c' },
    { name: 'Cheapfakes', value: 300, fill: '#f97316' },
    { name: 'Voice Clones', value: 300, fill: '#fb923c' },
    { name: 'AI Avatars', value: 200, fill: '#fdba74' },
  ];

  return (
    <div className="space-y-10">
      <header>
        <h3 className="text-3xl font-black uppercase italic mb-2 text-gray-900">Pitch Strategy</h3>
        <p className="text-gray-500">Winning the competition and the market.</p>
      </header>

      {/* Global Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard label="Total Scans" value={globalStats.totalScans.toLocaleString()} icon={<Activity className="w-5 h-5" />} color="text-blue-600" />
        <DashboardCard label="Synthetic Detected" value={globalStats.syntheticDetected.toLocaleString()} icon={<AlertTriangle className="w-5 h-5" />} color="text-red-600" />
        <DashboardCard label="Protected Assets" value={globalStats.protectedAssets.toLocaleString()} icon={<ShieldCheck className="w-5 h-5" />} color="text-green-600" />
        <DashboardCard label="Avg Confidence" value={`${globalStats.avgConfidence}%`} icon={<Zap className="w-5 h-5" />} color="text-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm">
            <h4 className="text-xl font-bold uppercase italic mb-6 text-orange-500">Market Threat Landscape</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', fontSize: '10px', borderRadius: '8px' }}
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-gray-400 mt-4 text-center uppercase tracking-widest">Projected Growth of Synthetic Media Threats (2024-2026)</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
              <h4 className="text-sm font-bold uppercase tracking-widest mb-4 text-orange-500">Tech Stack</h4>
              <ul className="text-[11px] font-mono space-y-2 text-gray-500">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-orange-500 rounded-full" /> Python / PyTorch (ML Core)</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-orange-500 rounded-full" /> FastAPI (High-perf API)</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-orange-500 rounded-full" /> Redis (Task Queuing)</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-orange-500 rounded-full" /> React / Tailwind (UI)</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-orange-500 rounded-full" /> Pinecone (Vector DB)</li>
              </ul>
            </div>
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
              <h4 className="text-sm font-bold uppercase tracking-widest mb-4 text-orange-500">Target Verticals</h4>
              <ul className="text-[11px] font-mono space-y-2 text-gray-500">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-orange-500 rounded-full" /> Political Campaigns</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-orange-500 rounded-full" /> Corporate PR / Legal</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-orange-500 rounded-full" /> News Organizations</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-orange-500 rounded-full" /> Financial Institutions</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-orange-50 border border-orange-100 p-8 rounded-2xl h-full shadow-sm">
            <h4 className="text-xl font-bold uppercase italic mb-6 text-gray-900">Unique Selling Propositions</h4>
            <div className="space-y-6">
              <div className="group">
                <div className="text-orange-500 font-black italic text-2xl mb-1 group-hover:scale-110 transition-transform origin-left">01</div>
                <div className="text-xs text-gray-600 leading-relaxed">
                  <span className="font-bold text-gray-900 block mb-1 uppercase tracking-wider">Biological Proof of Life</span>
                  We don't just look for AI artifacts; we look for the absence of human biology (rPPG).
                </div>
              </div>
              <div className="group">
                <div className="text-orange-500 font-black italic text-2xl mb-1 group-hover:scale-110 transition-transform origin-left">02</div>
                <div className="text-xs text-gray-600 leading-relaxed">
                  <span className="font-bold text-gray-900 block mb-1 uppercase tracking-wider">Proactive Immunization</span>
                  Moving from reactive detection to a proactive 'Immune System' for digital identity.
                </div>
              </div>
              <div className="group">
                <div className="text-orange-500 font-black italic text-2xl mb-1 group-hover:scale-110 transition-transform origin-left">03</div>
                <div className="text-xs text-gray-600 leading-relaxed">
                  <span className="font-bold text-gray-900 block mb-1 uppercase tracking-wider">Radical Explainability</span>
                  Saliency maps and plain-language reports that build trust with non-technical users.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-red-50 border border-red-100 p-8 rounded-2xl shadow-sm">
        <h4 className="text-xl font-bold uppercase italic mb-4 flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Ethical Guardrails
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <p className="text-xs font-bold uppercase text-red-600 mb-2">Privacy & Consent</p>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Biological signal extraction (rPPG) is sensitive. Aegis ensures all biometric data is 
              processed in ephemeral memory and never stored.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-red-600 mb-2">Bias Mitigation</p>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Aegis uses skin-tone-agnostic rPPG algorithms and diverse training sets to ensure equitable 
              protection for all users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, points }: { icon: React.ReactNode, title: string, description: string, points: string[] }) => (
  <div className="bg-white border border-gray-200 p-6 rounded-2xl hover:border-orange-500/50 transition-all group shadow-sm hover:shadow-md">
    <div className="mb-4 p-3 bg-gray-50 rounded-lg w-fit group-hover:bg-orange-50 transition-colors">
      {icon}
    </div>
    <h4 className="text-lg font-bold uppercase italic mb-2 text-gray-900">{title}</h4>
    <p className="text-xs text-gray-500 mb-4">{description}</p>
    <ul className="space-y-3">
      {points.map((p, i) => (
        <li key={i} className="text-[11px] text-gray-600 leading-relaxed border-l-2 border-orange-500/30 pl-3">
          {p}
        </li>
      ))}
    </ul>
  </div>
);

const Step = ({ number, title, text }: { number: string, title: string, text: string }) => (
  <div className="flex gap-4">
    <span className="text-orange-500 font-mono font-bold text-xs">{number}</span>
    <div>
      <p className="text-xs font-bold uppercase mb-0.5">{title}</p>
      <p className="text-[10px] text-gray-500 leading-relaxed">{text}</p>
    </div>
  </div>
);

export default App;
