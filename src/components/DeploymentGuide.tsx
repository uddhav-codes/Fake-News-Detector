/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, Server, Globe, Cpu, CheckCircle2, Copy, Check } from 'lucide-react';

export const DeploymentGuide: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fastapiSnippet = `# 1. app.py - Production FastAPI inference server
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib

app = FastAPI(title="Fake News Inference API")

# Load model and vectorizer saved from Kaggle
vectorizer = joblib.load("tfidf_vectorizer.joblib")
model = joblib.load("passive_aggressive_model.joblib")

class NewsRequest(BaseModel):
    title: str
    body: str

@app.post("/api/predict")
def predict_news(request: NewsRequest):
    combined_text = f"{request.title} {request.body}"
    tfidf_vector = vectorizer.transform([combined_text])
    prediction = int(model.predict(tfidf_vector)[0])
    
    # Calculate decision function or probability
    score = float(model.decision_function(tfidf_vector)[0])
    prob_fake = 1 / (1 + 2.71828 ** (-score))
    
    return {
        "verdict": "unreliable" if prediction == 1 else "reliable",
        "fake_probability": round(prob_fake, 4),
        "real_probability": round(1 - prob_fake, 4)
    }
`;

  const clientFetchSnippet = `// 2. Frontend React / JS fetch request
async function verifyArticle(headline: string, body: string) {
  const response = await fetch('https://your-api.com/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: headline, body: body })
  });
  const data = await response.json();
  console.log("Prediction result:", data);
  return data;
}
`;

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-neutral-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 uppercase tracking-widest mb-1.5">
          <span>Engineering Manual</span>
          <span aria-hidden="true">·</span>
          <span>From Kaggle Notebook to Live Web</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-neutral-900 tracking-tight">
          Deployment Architecture & Integration Guide
        </h1>
        <p className="mt-2 text-sm text-neutral-600 max-w-3xl leading-relaxed">
          How to turn any Kaggle fake news detector notebook into a high-performance, production-grade web application.
          Choose the architectural strategy that best matches your model's computational footprint.
        </p>
      </div>

      {/* 3 Architecture Patterns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Pattern 1 */}
        <div className="bg-white border border-neutral-300 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mb-2">
              <Globe className="w-4 h-4 text-emerald-700" />
              <span>PATTERN A (RECOMMENDED)</span>
            </div>
            <h2 className="text-base font-serif font-bold text-neutral-900">
              Pure Client-Side In-Browser Inference
            </h2>
            <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
              Ideal for TF-IDF + Linear models (PassiveAggressive, Logistic Regression, Naive Bayes).
              Export model vocabulary and weights to JSON (100–500 KB). Runs entirely in JavaScript with 0ms latency and $0 server hosting bills.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 text-xs font-mono text-emerald-800">
            ✓ Currently active in Veritas Lens
          </div>
        </div>

        {/* Pattern 2 */}
        <div className="bg-white border border-neutral-300 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mb-2">
              <Server className="w-4 h-4 text-blue-700" />
              <span>PATTERN B (STANDARD REST)</span>
            </div>
            <h2 className="text-base font-serif font-bold text-neutral-900">
              Python Microservice (FastAPI / Express)
            </h2>
            <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
              Save model artifacts using <code className="bg-neutral-100 px-1 py-0.5 font-mono">joblib.dump()</code> or pickle.
              Deploy a lightweight Python container (Cloud Run, Render, or Railway) that serves JSON predictions to your HTML/CSS/JS frontend.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 text-xs font-mono text-blue-800">
            ✓ Best for complex Python pipelines
          </div>
        </div>

        {/* Pattern 3 */}
        <div className="bg-white border border-neutral-300 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mb-2">
              <Cpu className="w-4 h-4 text-purple-700" />
              <span>PATTERN C (DEEP LEARNING)</span>
            </div>
            <h2 className="text-base font-serif font-bold text-neutral-900">
              ONNX Web & Transformers.js
            </h2>
            <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
              For BERT, RoBERTa, or LSTM models. Convert PyTorch weights to ONNX format.
              Execute in the browser via WebAssembly (Wasm) or WebGPU without needing dedicated GPU servers.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 text-xs font-mono text-purple-800">
            ✓ Best for neural network weights
          </div>
        </div>

      </div>

      {/* Code Snippets Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Python Backend Snippet */}
        <div className="bg-white border border-neutral-300 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
            <span className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
              1. Python Backend Service (app.py)
            </span>
            <button
              onClick={() => copyCode(fastapiSnippet, 'fastapi')}
              className="text-xs font-medium text-neutral-700 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
            >
              {copiedId === 'fastapi' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === 'fastapi' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-3 bg-neutral-950 text-neutral-100 text-[11px] font-mono overflow-x-auto leading-relaxed">
            {fastapiSnippet}
          </pre>
        </div>

        {/* Frontend Connection Snippet */}
        <div className="bg-white border border-neutral-300 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
            <span className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
              2. Frontend Fetch Handler (App.tsx / main.js)
            </span>
            <button
              onClick={() => copyCode(clientFetchSnippet, 'client')}
              className="text-xs font-medium text-neutral-700 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
            >
              {copiedId === 'client' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId === 'client' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-3 bg-neutral-950 text-neutral-100 text-[11px] font-mono overflow-x-auto leading-relaxed">
            {clientFetchSnippet}
          </pre>
        </div>

      </div>

      {/* 5-Step Kaggle-to-Web Checklist */}
      <div className="bg-white border border-neutral-300 p-6 shadow-xs">
        <h2 className="text-base font-semibold text-neutral-900 border-b border-neutral-200 pb-3 mb-4">
          Checklist: Taking Your Kaggle Code to Production
        </h2>
        <div className="space-y-3 text-xs text-neutral-700">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-900">Step 1: Inspect Your Feature Extraction</strong>
              <p className="text-neutral-500 mt-0.5">Identify whether your model uses TF-IDF, CountVectorizer, Word2Vec, or subword tokens. Match the same tokenizer logic on your web interface.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-900">Step 2: Export Model Weights or Serialize</strong>
              <p className="text-neutral-500 mt-0.5">Use joblib/pickle for Python servers, or export JSON feature coefficients using our generator snippet in the "Kaggle Bridge" tab.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-900">Step 3: Build Non-Generic UI with Transparent Explainability</strong>
              <p className="text-neutral-500 mt-0.5">Avoid generic red/green boxes. Give users word-level attributions, Flesch reading complexity, quoting density, and sensationalism metrics.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-900">Step 4: Calibrate Decision Boundary</strong>
              <p className="text-neutral-500 mt-0.5">Do not rely on a blind 0.5 threshold. Use the dynamic threshold slider to balance False Positives (credibility defamation) against False Negatives.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
