/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AnalysisResult, PresetArticle, TokenWeight } from '../types';
import { PRESET_ARTICLES } from '../data/presets';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Info,
  ArrowRight,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Globe,
  Loader2,
  FileText,
  Link as LinkIcon
} from 'lucide-react';

interface DetectorStudioProps {
  analysis: AnalysisResult;
  onAnalyze: (headline: string, body: string, threshold: number) => void;
  onSelectPreset: (preset: PresetArticle) => void;
  threshold: number;
  setThreshold: (val: number) => void;
  onSaveReport: (analysis: AnalysisResult) => void;
}

export const DetectorStudio: React.FC<DetectorStudioProps> = ({
  analysis,
  onAnalyze,
  onSelectPreset,
  threshold,
  setThreshold,
  onSaveReport
}) => {
  const [inputMode, setInputMode] = useState<'url' | 'manual'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [headline, setHeadline] = useState(analysis.headline);
  const [body, setBody] = useState(analysis.body);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [lastScrapedSnippet, setLastScrapedSnippet] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<TokenWeight | null>(null);
  const [copied, setCopied] = useState(false);
  const [showFlaggedSentences, setShowFlaggedSentences] = useState(true);

  const handleRunManual = () => {
    onAnalyze(headline, body, threshold);
  };

  const handleScrapeAndCheck = async (targetUrl?: string) => {
    const url = targetUrl || urlInput;
    if (!url.trim()) {
      setScrapeError('Please enter a valid website URL.');
      return;
    }

    setIsScraping(true);
    setScrapeError(null);
    setLastScrapedSnippet(null);

    try {
      const res = await fetch('/api/scrape-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setScrapeError(data.error || 'Failed to extract article.');
        setIsScraping(false);
        return;
      }

      setHeadline(data.title);
      setBody(data.text);
      setLastScrapedSnippet(data.snippet || data.text.slice(0, 300));
      onAnalyze(data.title, data.text, threshold);
    } catch (err: any) {
      setScrapeError(`Connection error: ${err.message || 'Scraper unreachable.'}`);
    } finally {
      setIsScraping(false);
    }
  };

  const handlePresetClick = (p: PresetArticle) => {
    setHeadline(p.headline);
    setBody(p.body);
    setLastScrapedSnippet(null);
    setInputMode('manual');
    onSelectPreset(p);
  };

  const handleCopyReport = () => {
    const report = `VERITAS LENS - KAGGLE CLASSIFIER REPORT
Pipeline: TfidfVectorizer + LogisticRegression (Clément Bisaillon Dataset)
Verdict: ${analysis.verdict === 'reliable' ? 'REAL NEWS' : 'FAKE NEWS'}
Confidence: ${analysis.confidence}%
Real Probability: ${(analysis.realProbability * 100).toFixed(2)}%
Fake Probability: ${(analysis.fakeProbability * 100).toFixed(2)}%
Headline: ${analysis.headline}`;

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isRealVerdict = analysis.realProbability >= analysis.fakeProbability;

  return (
    <div className="space-y-8">
      {/* Editorial Kicker & Intro */}
      <div className="border-b border-neutral-200 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 uppercase tracking-widest mb-1.5">
              <span>Pipeline: Scikit-learn Pipeline</span>
              <span aria-hidden="true">·</span>
              <span>TfidfVectorizer(max_df=0.7)</span>
              <span aria-hidden="true">·</span>
              <span>LogisticRegression(max_iter=1000)</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-900 tracking-tight">
              Kaggle News Verification & Live URL Analyzer
            </h1>
            <p className="mt-2 text-sm sm:text-base text-neutral-600 max-w-3xl leading-relaxed">
              Trained on Clément Bisaillon's benchmark Fake & Real News corpus.
              Supports live web link scraping (equivalent to your <code className="bg-neutral-100 px-1 py-0.5 font-mono text-xs">trafilatura.fetch_url</code> function) or direct text pasting.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onSaveReport(analysis)}
              className="px-3.5 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Save to Dossier
            </button>
            <button
              onClick={handleCopyReport}
              className="px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Export Kaggle Result'}</span>
            </button>
          </div>
        </div>

        {/* Quick Benchmark Presets */}
        <div className="mt-6 pt-5 border-t border-neutral-200">
          <div className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2.5">
            Preloaded Benchmark News Articles:
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {PRESET_ARTICLES.map((preset) => {
              const active = analysis.headline === preset.headline;
              return (
                <button
                  key={preset.id}
                  onClick={() => handlePresetClick(preset)}
                  className={`text-xs px-3 py-1.5 border transition-all text-left cursor-pointer ${
                    active
                      ? 'border-neutral-900 bg-neutral-900 text-white font-medium shadow-xs'
                      : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50'
                  }`}
                >
                  <span className="font-semibold block sm:inline">{preset.outlet}:</span>{' '}
                  <span className="opacity-90">{preset.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Input Buffer (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white border border-neutral-300 p-5 sm:p-6 shadow-xs">
            
            {/* Input Mode Selector (URL Link vs Manual Text) */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-5">
              <div className="flex items-center gap-1 bg-neutral-100 p-1">
                <button
                  onClick={() => setInputMode('url')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    inputMode === 'url'
                      ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>check_news_link (URL Extractor)</span>
                </button>
                <button
                  onClick={() => setInputMode('manual')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    inputMode === 'manual'
                      ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Manual Text Buffer</span>
                </button>
              </div>

              <span className="text-xs text-neutral-500 font-mono tabular-nums">
                {headline.trim().split(/\s+/).filter(Boolean).length + body.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            {/* Mode 1: URL Web Scraper Input (matches check_news_link in Kaggle) */}
            {inputMode === 'url' && (
              <div className="space-y-4 mb-5">
                <div>
                  <label htmlFor="url-input" className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-1.5">
                    Live News Article Web Link
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                      <input
                        id="url-input"
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://www.reuters.com/world/... or any news article link"
                        className="w-full pl-9 pr-3.5 py-2.5 text-sm font-mono text-neutral-900 bg-neutral-50 border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleScrapeAndCheck();
                        }}
                      />
                    </div>
                    <button
                      onClick={() => handleScrapeAndCheck()}
                      disabled={isScraping}
                      className="px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-500 transition-colors flex items-center gap-2 cursor-pointer shrink-0"
                    >
                      {isScraping ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Scraping DOM...</span>
                        </>
                      ) : (
                        <>
                          <span>Analyze Link</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Scraper Error display */}
                {scrapeError && (
                  <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-mono">
                    {scrapeError}
                  </div>
                )}

                {/* Scraped Article Snippet Preview (matching Kaggle printout: Article Snippet: ...) */}
                {lastScrapedSnippet && (
                  <div className="p-3.5 bg-neutral-50 border border-neutral-200">
                    <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
                      📝 Extracted Article Snippet (Trafilatura Engine)
                    </div>
                    <p className="text-xs font-serif text-neutral-800 italic leading-relaxed">
                      "{lastScrapedSnippet}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Mode 2: Manual Text buffer */}
            <div className="space-y-4">
              <div>
                <label htmlFor="headline-field" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Headline / Title
                </label>
                <input
                  id="headline-field"
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Paste news headline here..."
                  className="w-full px-3.5 py-2 text-sm font-serif text-neutral-900 bg-neutral-50/50 border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="body-field" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Article Body Text
                </label>
                <textarea
                  id="body-field"
                  rows={8}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Paste the full article body text for LogisticRegression TF-IDF classification..."
                  className="w-full px-3.5 py-2.5 text-xs font-sans text-neutral-800 bg-neutral-50/50 border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white leading-relaxed resize-y"
                />
              </div>
            </div>

            {/* Decision Threshold Slider */}
            <div className="p-3.5 bg-neutral-50 border border-neutral-200 my-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-neutral-700">Classification Cutoff Threshold:</span>
                <span className="font-mono font-semibold text-neutral-900 tabular-nums">
                  {threshold.toFixed(2)} (Fake cut-off)
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.8"
                step="0.05"
                value={threshold}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setThreshold(val);
                  onAnalyze(headline, body, val);
                }}
                className="w-full accent-neutral-900 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-neutral-500 font-mono mt-1">
                <span>0.20 (Conservative)</span>
                <span>0.50 (Standard predict_proba)</span>
                <span>0.80 (Lenient)</span>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => {
                  setHeadline('');
                  setBody('');
                  setUrlInput('');
                  setLastScrapedSnippet(null);
                }}
                className="text-xs text-neutral-600 hover:text-neutral-900 flex items-center gap-1 cursor-pointer py-1 px-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Buffer</span>
              </button>

              <button
                onClick={handleRunManual}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Run Model Prediction</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lexicon Attribution Inspector */}
          <div className="bg-white border border-neutral-300 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">
                  Logistic Regression Feature Coefficients
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Vocabulary tokens driving <code className="bg-neutral-100 px-1 py-0.5 font-mono">classifier.coef_</code>. Green tokens indicate Real News; Red indicate Fake News.
                </p>
              </div>
              <span className="text-xs font-mono text-neutral-500">
                {analysis.topContributingTokens.length} active tokens
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 my-3">
              {analysis.topContributingTokens.length === 0 ? (
                <div className="text-xs text-neutral-500 py-3 italic">
                  No polarized vocabulary triggers found in current text.
                </div>
              ) : (
                analysis.topContributingTokens.map((tok) => {
                  const isFakePull = tok.weight > 0;
                  const isSelected = selectedToken?.word === tok.word;
                  return (
                    <button
                      key={tok.word}
                      onClick={() => setSelectedToken(tok)}
                      className={`text-xs px-2.5 py-1 font-mono transition-all border cursor-pointer ${
                        isSelected ? 'ring-2 ring-neutral-900 font-bold' : ''
                      } ${
                        isFakePull
                          ? 'bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                      }`}
                    >
                      <span>{tok.word}</span>{' '}
                      <span className="opacity-75 tabular-nums text-[10px]">
                        {tok.weight > 0 ? `+${tok.weight.toFixed(1)}` : tok.weight.toFixed(1)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {selectedToken && (
              <div className="mt-4 p-3 bg-neutral-50 border border-neutral-300 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-neutral-900">
                    Token Inspection: <span className="font-mono text-neutral-800">"{selectedToken.word}"</span>
                  </span>
                  <button
                    onClick={() => setSelectedToken(null)}
                    className="text-neutral-500 hover:text-neutral-900 font-mono text-[11px]"
                  >
                    Close ×
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-neutral-600 mt-2 font-mono">
                  <div>
                    <span className="text-[10px] text-neutral-500 block">COEFFICIENT</span>
                    <span className={`font-bold ${selectedToken.weight > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                      {selectedToken.weight > 0 ? `+${selectedToken.weight}` : selectedToken.weight}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 block">FREQUENCY</span>
                    <span className="font-bold text-neutral-900">{selectedToken.count}x in text</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 block">CATEGORY</span>
                    <span className="uppercase text-neutral-800 font-semibold">{selectedToken.type}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Kaggle Execution Dossier (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Main Verdict Card matching your Kaggle console output */}
          <div className="bg-white border border-neutral-300 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-4">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-500">
                Pipeline Prediction Output
              </span>
              <span className="text-xs font-mono text-neutral-600 tabular-nums">
                Pipeline(tfidf, LogisticRegression)
              </span>
            </div>

            {/* Verdict Hero Banner matching Kaggle print statement */}
            <div
              className={`p-4 border mb-5 ${
                isRealVerdict
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50/80 border-rose-300 text-rose-950'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {isRealVerdict ? (
                    <ShieldCheck className="w-6 h-6 text-emerald-700" />
                  ) : (
                    <ShieldAlert className="w-6 h-6 text-rose-700" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-mono font-bold uppercase tracking-wider opacity-85">
                    {isRealVerdict ? 'VERDICT: REAL NEWS' : 'VERDICT: FAKE NEWS'}
                  </div>
                  <h2 className="text-2xl font-serif font-bold mt-0.5">
                    {isRealVerdict ? 'Verified Real News' : 'Flagged as Fake News'}
                  </h2>
                  <div className="font-mono text-xs font-semibold mt-1">
                    Confidence: {analysis.confidence.toFixed(2)}%
                  </div>
                  <p className="text-xs mt-1.5 leading-relaxed opacity-90">
                    {isRealVerdict
                      ? 'Text aligns with verifiable Reuters reporting standards in Clément Bisaillon\'s dataset.'
                      : 'Text exhibits lexical and stylistic patterns typical of fabricated news in Clément Bisaillon\'s dataset.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Probabilities Breakdown (matching predict_proba) */}
            <div className="space-y-3 mb-5">
              <div>
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="font-medium text-neutral-700">P(Real News) [Label 1]</span>
                  <span className="font-bold text-emerald-700 tabular-nums">
                    {(analysis.realProbability * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-neutral-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-300"
                    style={{ width: `${analysis.realProbability * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="font-medium text-neutral-700">P(Fake News) [Label 0]</span>
                  <span className="font-bold text-rose-700 tabular-nums">
                    {(analysis.fakeProbability * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-neutral-100 overflow-hidden">
                  <div
                    className="h-full bg-rose-600 transition-all duration-300"
                    style={{ width: `${analysis.fakeProbability * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Linguistic Indices Matrix */}
            <div className="border-t border-neutral-200 pt-4">
              <div className="text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-3">
                Linguistic Indices
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Sensationalism Score</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-neutral-100 overflow-hidden">
                      <div
                        className="h-full bg-amber-600"
                        style={{ width: `${analysis.metrics.sensationalismScore}%` }}
                      />
                    </div>
                    <span className="font-mono tabular-nums text-neutral-900 w-8 text-right font-medium">
                      {analysis.metrics.sensationalismScore}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Source Attribution Score</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-neutral-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-600"
                        style={{ width: `${analysis.metrics.attributionScore}%` }}
                      />
                    </div>
                    <span className="font-mono tabular-nums text-neutral-900 w-8 text-right font-medium">
                      {analysis.metrics.attributionScore}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Objectivity Score</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-neutral-100 overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{ width: `${analysis.metrics.objectivityScore}%` }}
                      />
                    </div>
                    <span className="font-mono tabular-nums text-neutral-900 w-8 text-right font-medium">
                      {analysis.metrics.objectivityScore}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Clickbait Headline Rating</span>
                  <span className="font-mono tabular-nums text-neutral-900 font-medium">
                    {analysis.metrics.clickbaitHeadlineScore} / 100
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Flagged Sentences Critique */}
          <div className="bg-white border border-neutral-300 p-5 shadow-xs">
            <button
              onClick={() => setShowFlaggedSentences(!showFlaggedSentences)}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                  Flagged Suspicious Passages
                </span>
                <span className="text-xs font-mono px-1.5 py-0.2 bg-neutral-100 text-neutral-700 border border-neutral-300">
                  {analysis.flaggedSentences.length}
                </span>
              </div>
              {showFlaggedSentences ? (
                <ChevronUp className="w-4 h-4 text-neutral-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-neutral-500" />
              )}
            </button>

            {showFlaggedSentences && (
              <div className="mt-3 pt-3 border-t border-neutral-200 space-y-3">
                {analysis.flaggedSentences.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic py-1">
                    No high-risk sensationalist or manipulative clauses detected.
                  </p>
                ) : (
                  analysis.flaggedSentences.map((flag, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-neutral-50 border-l-3 border-rose-500 text-xs space-y-1"
                    >
                      <p className="font-serif text-neutral-900 italic">"{flag.text}"</p>
                      <div className="flex items-center gap-1.5 text-neutral-500 text-[11px] font-mono">
                        <Info className="w-3 h-3 text-rose-600" />
                        <span>{flag.reason}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
