/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { analyzeNewsArticle } from './ml/classifier';
import { AnalysisResult } from './types';
import {
  Link as LinkIcon,
  ArrowRight,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Globe,
  ExternalLink
} from 'lucide-react';

const INITIAL_HEADLINE = "Trump says flydubai pilot 'a hero', plumber steadied plunging aircraft";

function isUrl(text: string): boolean {
  const trimmed = text.trim();
  // Any string with whitespace is a text headline, never a valid URL
  if (/\s/.test(trimmed)) return false;
  return (
    /^https?:\/\//i.test(trimmed) ||
    /^www\./i.test(trimmed) ||
    /^[a-zA-Z0-9-]+\.(com|org|net|gov|edu|io|co|in|uk|de|fr|ai|news|info)(\/.*)?$/i.test(trimmed)
  );
}

function safeGetHostname(input: string): string | undefined {
  try {
    const raw = input.trim();
    const withProto = raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`;
    return new URL(withProto).hostname;
  } catch {
    return undefined;
  }
}

export default function App() {
  const [urlOrTextInput, setUrlOrTextInput] = useState('');
  const [headline, setHeadline] = useState('');
  const [body, setBody] = useState('');
  const [hasScrapedLink, setHasScrapedLink] = useState(false);
  const [renderedWithJs, setRenderedWithJs] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleAnalyzeInput = async () => {
    const trimmed = urlOrTextInput.trim();
    if (!trimmed) {
      setScrapeError('Please enter a website link or text headline.');
      return;
    }

    setScrapeError(null);
    setIsProcessing(true);
    setAnalysis(null);
    setRenderedWithJs(false);

    // If input is a URL:
    if (isUrl(trimmed)) {
      try {
        const res = await fetch('/api/scrape-article', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: trimmed, renderJs: true })
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          setScrapeError(data.error || 'Failed to extract readable article from this link.');
          setIsProcessing(false);
          return;
        }

        const extractedTitle = data.title || 'Extracted Article';
        const extractedText = data.text || '';

        setHeadline(extractedTitle);
        setBody(extractedText);
        setHasScrapedLink(true); // Show headline & body text preview for scraped links
        setRenderedWithJs(data.renderedWith === 'javascript');

        // Try AI verification first, fallback to ML model
        try {
          const verifyRes = await fetch('/api/verify-headline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              headline: extractedTitle,
              body: extractedText,
              url: trimmed,
              domain: isUrl(trimmed) ? safeGetHostname(trimmed) : undefined,
              publishDate: data.publishDate
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            const localBase = analyzeNewsArticle(extractedTitle, extractedText, 0.50);
            setAnalysis({
              ...localBase,
              verdict: verifyData.verdict,
              confidence: verifyData.confidence,
              fakeProbability: verifyData.fakeProbability,
              realProbability: verifyData.realProbability,
              reason: verifyData.reason,
              relatedArticles: verifyData.relatedArticles
            });
            return;
          }
        } catch {
          // Ignore and proceed to local classifier
        }

        const result = analyzeNewsArticle(extractedTitle, extractedText, 0.50);
        setAnalysis(result);
      } catch (err: any) {
        setScrapeError(`Connection error: ${err.message || 'Scraper unreachable.'}`);
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Input is a text-only headline!
      setHasScrapedLink(false); // Hide the headline and body text fields
      setHeadline(trimmed);
      setBody('');

      try {
        const verifyRes = await fetch('/api/verify-headline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ headline: trimmed, body: '' })
        });
        const verifyData = await verifyRes.json();

        if (verifyData.success) {
          const localBase = analyzeNewsArticle(trimmed, '', 0.50);
          setAnalysis({
            ...localBase,
            verdict: verifyData.verdict,
            confidence: verifyData.confidence,
            fakeProbability: verifyData.fakeProbability,
            realProbability: verifyData.realProbability,
            reason: verifyData.reason,
            relatedArticles: verifyData.relatedArticles
          });
          setIsProcessing(false);
          return;
        }
      } catch (err) {
        console.warn('API verification error, using local engine:', err);
      }

      // Robust local fallback
      const result = analyzeNewsArticle(trimmed, '', 0.50);
      setAnalysis(result);
      setIsProcessing(false);
    }
  };

  const handleManualAnalyze = async (newHeadline: string, newBody: string) => {
    try {
      const verifyRes = await fetch('/api/verify-headline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline: newHeadline, body: newBody })
      });
      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        const localBase = analyzeNewsArticle(newHeadline, newBody, 0.50);
        setAnalysis({
          ...localBase,
          verdict: verifyData.verdict,
          confidence: verifyData.confidence,
          fakeProbability: verifyData.fakeProbability,
          realProbability: verifyData.realProbability,
          reason: verifyData.reason,
          relatedArticles: verifyData.relatedArticles
        });
        return;
      }
    } catch {}

    const result = analyzeNewsArticle(newHeadline, newBody, 0.50);
    setAnalysis(result);
  };

  const isReal = analysis ? analysis.realProbability >= analysis.fakeProbability : false;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] py-10 px-4 sm:px-6 flex flex-col items-center selection:bg-slate-200 selection:text-slate-900">
      <div className="w-full max-w-4xl space-y-6">

        {/* Top & Center Headline */}
        <div className="text-center pt-2 pb-1">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
            Fake News Detector
          </h1>
          <p className="text-xs font-mono text-slate-500 mt-1 uppercase tracking-wider">
            Investigative News Verification & Fact-Checking
          </p>
        </div>

        {/* Main Input Card */}
        <div className="bg-white border border-slate-200 p-5 sm:p-6 shadow-xs">
          
          {/* Section: Paste News Article Link or Headline */}
          <div>
            <label htmlFor="url-input" className="block text-xs font-mono font-bold text-slate-600 uppercase tracking-wider mb-2">
              Paste News Article Link or Headline
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="url-input"
                  type="text"
                  value={urlOrTextInput}
                  onChange={(e) => {
                    setUrlOrTextInput(e.target.value);
                    if (scrapeError) setScrapeError(null);
                  }}
                  placeholder="Paste article link (https://...) or enter a text headline..."
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm font-mono text-slate-900 bg-slate-50/70 border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 focus:bg-white placeholder:text-slate-400 transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAnalyzeInput();
                  }}
                />
              </div>
              <button
                onClick={handleAnalyzeInput}
                disabled={isProcessing}
                className="px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-xs"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {/* Error Message Only (In red, shown strictly on failure) */}
            {scrapeError && (
              <div className="mt-2.5 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono">
                {scrapeError}
              </div>
            )}
          </div>

          {/* Section: Shown ONLY when a link is pasted and scraped */}
          {hasScrapedLink && (
            <div className="mt-5 pt-5 border-t border-slate-200">
              
              {/* Headline from Link */}
              <div>
                <label htmlFor="headline-input" className="block text-xs font-mono font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Extracted Headline
                </label>
                <input
                  id="headline-input"
                  type="text"
                  value={headline}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHeadline(val);
                    handleManualAnalyze(val, body);
                  }}
                  placeholder="Extracted headline..."
                  className="w-full px-3.5 py-2.5 text-sm sm:text-base font-serif text-slate-900 bg-slate-50/70 border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 focus:bg-white placeholder:text-slate-400"
                />
              </div>

            </div>
          )}

        </div>

        {/* Analyzing Progress State */}
        {isProcessing && (
          <div className="p-6 border border-slate-200 bg-white flex items-center justify-center gap-3 text-slate-600 font-mono text-xs shadow-xs">
            <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
            <span>Fact-checking news against recent articles on the web & verifying credibility...</span>
          </div>
        )}

        {/* Verdict Card: Revealed strictly when analyzing is completed */}
        {!isProcessing && analysis && (
          <div
            className={`p-6 border transition-all shadow-xs ${
              isReal
                ? 'bg-emerald-50/85 border-emerald-300'
                : 'bg-rose-50/85 border-rose-300'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="mt-0.5 shrink-0">
                {isReal ? (
                  <ShieldCheck className="w-7 h-7 text-emerald-600" />
                ) : (
                  <ShieldAlert className="w-7 h-7 text-rose-600" />
                )}
              </div>
              <div className="space-y-1.5 flex-1">
                <div
                  className={`text-xs font-mono font-bold uppercase tracking-wider ${
                    isReal ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {isReal ? 'VERDICT: REAL NEWS' : 'VERDICT: FAKE NEWS'}
                </div>

                <h2
                  className={`text-2xl sm:text-3xl font-serif font-bold tracking-tight ${
                    isReal ? 'text-emerald-950' : 'text-rose-950'
                  }`}
                >
                  {isReal ? 'Verified Real News' : 'Flagged as Fake News'}
                </h2>

                {analysis.reason && (
                  <p
                    className={`text-sm font-sans pt-1 leading-relaxed max-w-2xl ${
                      isReal ? 'text-emerald-900/90' : 'text-rose-900/90'
                    }`}
                  >
                    {analysis.reason}
                  </p>
                )}

                {/* Recent Web Articles Section (Fact-Checking Ground Truth) */}
                {analysis.relatedArticles && analysis.relatedArticles.length > 0 && (
                  <div
                    className={`mt-4 pt-3.5 border-t space-y-2 ${
                      isReal ? 'border-emerald-200' : 'border-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                      <Globe className="w-3.5 h-3.5 text-slate-500" />
                      <span>Recent Corroborating Articles on the Web</span>
                    </div>
                    <div className="space-y-1.5">
                      {analysis.relatedArticles.map((art, idx) => (
                        <a
                          key={idx}
                          href={art.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start justify-between gap-3 p-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors group text-left rounded-xs shadow-2xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-serif font-medium text-slate-900 group-hover:text-black leading-snug line-clamp-2">
                              {art.title}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2 mt-1">
                              <span className="text-slate-700 font-semibold">{art.source}</span>
                              {art.pubDate && (
                                <span>• {art.pubDate.split(' ').slice(0, 4).join(' ')}</span>
                              )}
                            </div>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 shrink-0 mt-0.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
