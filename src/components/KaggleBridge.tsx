/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { parseKagglePythonCode, USER_KAGGLE_CODE } from '../ml/kaggleParser';
import { KaggleParsedPipeline } from '../types';
import {
  Code2,
  FileCode,
  Download,
  Copy,
  Check,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Terminal,
  Upload,
  Cpu
} from 'lucide-react';

interface KaggleBridgeProps {
  onApplyCustomWeights?: (weights: Record<string, number>) => void;
}

export const KaggleBridge: React.FC<KaggleBridgeProps> = ({ onApplyCustomWeights }) => {
  const [code, setCode] = useState(USER_KAGGLE_CODE);
  const [parsed, setParsed] = useState<KaggleParsedPipeline>(() => parseKagglePythonCode(USER_KAGGLE_CODE));
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [weightsJson, setWeightsJson] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    const result = parseKagglePythonCode(newCode);
    setParsed(result);
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(parsed.exportSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleApplyJsonWeights = () => {
    try {
      const data = JSON.parse(weightsJson);
      const features = data.features || data;
      if (typeof features !== 'object' || Object.keys(features).length === 0) {
        setImportStatus('Error: JSON must contain a map of {"word": weight_float}.');
        return;
      }
      if (onApplyCustomWeights) {
        onApplyCustomWeights(features);
      }
      setImportStatus(`Success! Imported ${Object.keys(features).length} feature weights into live detector.`);
    } catch (e) {
      setImportStatus('Syntax Error: Please paste valid JSON.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Kicker Header */}
      <div className="border-b border-neutral-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 uppercase tracking-widest mb-1.5">
          <span>ML Pipeline Transpiler</span>
          <span aria-hidden="true">·</span>
          <span>Scikit-Learn / PyTorch to Live Web</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-neutral-900 tracking-tight">
          Kaggle Code & Model Bridge
        </h1>
        <p className="mt-2 text-sm text-neutral-600 max-w-3xl leading-relaxed">
          Paste your existing Kaggle Python script or Jupyter Notebook cells below.
          Veritas Lens inspects your model pipeline, detects hyperparameters, and shows you how to export or run it live.
        </p>
      </div>

      {/* Two Column Layout: Code Input & Parsed Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Code Paste Area (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-neutral-300 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-neutral-700" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-800">
                  Kaggle Python Script / Notebook Cells
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCodeChange(USER_KAGGLE_CODE)}
                  className="text-xs text-neutral-600 hover:text-neutral-900 underline font-mono cursor-pointer"
                >
                  Reset My Kaggle Code
                </button>
              </div>
            </div>

            <textarea
              rows={16}
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="Paste your Python Kaggle code here (e.g., pandas, TfidfVectorizer, PassiveAggressiveClassifier, LogisticRegression)..."
              className="w-full p-3 text-xs font-mono text-neutral-900 bg-neutral-950 text-neutral-100 border border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-400 leading-relaxed font-normal"
              spellCheck={false}
            />

            <div className="flex items-center justify-between text-xs text-neutral-500 font-mono mt-2 pt-2 border-t border-neutral-100">
              <span>{code.split('\n').length} lines of Python</span>
              <span>Parses in real-time</span>
            </div>
          </div>

          {/* Model Weight Exporter Box */}
          <div className="bg-white border border-neutral-300 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-neutral-700" />
                <span className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                  Generated Kaggle Export Script
                </span>
              </div>
              <button
                onClick={handleCopySnippet}
                className="text-xs px-2.5 py-1 bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSnippet ? 'Copied' : 'Copy Python Snippet'}</span>
              </button>
            </div>

            <p className="text-xs text-neutral-600 mb-3">
              Paste this block into the last cell of your Kaggle notebook after model training. It extracts the learned vocabulary and regression weights directly into a lightweight JSON file.
            </p>

            <pre className="p-3 bg-neutral-50 border border-neutral-200 text-[11px] font-mono text-neutral-800 overflow-x-auto leading-relaxed">
              {parsed.exportSnippet}
            </pre>
          </div>
        </div>

        {/* Right: Inspection & Integration Architecture (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Detected Pipeline Metadata */}
          <div className="bg-white border border-neutral-300 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-4">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-500">
                Pipeline Architecture Audit
              </span>
              <span className="text-xs font-mono text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Parsed
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
                  Identified Libraries
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {parsed.librariesDetected.length ? (
                    parsed.librariesDetected.map((lib) => (
                      <span
                        key={lib}
                        className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 text-neutral-800 font-mono text-[11px]"
                      >
                        {lib}
                      </span>
                    ))
                  ) : (
                    <span className="text-neutral-500 italic">No standard ML libraries identified</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
                  Classifier Algorithm
                </span>
                <div className="mt-1 font-serif text-sm font-bold text-neutral-900">
                  {parsed.classifier ? parsed.classifier.name : 'Custom / Unspecified Model'}
                </div>
                {parsed.classifier && (
                  <div className="mt-1 text-neutral-600 font-mono text-[11px]">
                    Type: <span className="uppercase font-semibold">{parsed.classifier.type}</span> · Params:{' '}
                    {Object.entries(parsed.classifier.hyperparameters)
                      .map(([k, v]) => `${k}=${v}`)
                      .join(', ')}
                  </div>
                )}
              </div>

              <div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
                  Feature Extraction Vectorizer
                </span>
                <div className="mt-1 text-neutral-900 font-medium">
                  {parsed.vectorizer ? parsed.vectorizer.type : 'Raw Text / Custom'}
                </div>
                {parsed.vectorizer?.ngramRange && (
                  <div className="text-neutral-500 font-mono text-[11px] mt-0.5">
                    N-Gram Range: {parsed.vectorizer.ngramRange}
                  </div>
                )}
              </div>

              <div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
                  Preprocessing Pipeline
                </span>
                <ul className="mt-1 space-y-1 text-neutral-700 font-mono text-[11px]">
                  {parsed.preprocessingSteps.length ? (
                    parsed.preprocessingSteps.map((step, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full" />
                        <span>{step}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-neutral-500 italic">Standard tokenization</li>
                  )}
                </ul>
              </div>

              <div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
                  Reported Metrics
                </span>
                <div className="mt-1 flex flex-wrap gap-1 text-[11px] font-mono text-neutral-600">
                  {parsed.evaluationMetrics.join(' · ') || 'Accuracy / Confusion Matrix'}
                </div>
              </div>
            </div>
          </div>

          {/* Direct JSON Weights Importer */}
          <div className="bg-white border border-neutral-300 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-neutral-700" />
                <span className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                  Test Live With Your Exported Weights
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-600 mb-3 leading-relaxed">
              Once you've run the export snippet in Kaggle, paste the contents of your exported JSON file below to immediately calibrate the live web detector with your exact trained model parameters.
            </p>

            <textarea
              rows={4}
              value={weightsJson}
              onChange={(e) => setWeightsJson(e.target.value)}
              placeholder='Paste JSON here: {"features": {"conspiracy": 2.4, "reuters": -2.1, ...}}'
              className="w-full p-2.5 text-xs font-mono text-neutral-800 bg-neutral-50 border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 mb-2.5"
            />

            <button
              onClick={handleApplyJsonWeights}
              className="w-full py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Load Model Weights into Detector</span>
            </button>

            {importStatus && (
              <div
                className={`mt-2.5 p-2 text-xs font-mono ${
                  importStatus.startsWith('Success')
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border border-rose-300'
                }`}
              >
                {importStatus}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
