/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AnalysisResult } from '../types';
import { Sliders, Shield, AlertOctagon, HelpCircle, BookOpen, Quote, FileSearch } from 'lucide-react';

interface LinguisticInspectorProps {
  analysis: AnalysisResult;
}

export const LinguisticInspector: React.FC<LinguisticInspectorProps> = ({ analysis }) => {
  const { metrics } = analysis;

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-neutral-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 uppercase tracking-widest mb-1.5">
          <span>Stylometric Forensics</span>
          <span aria-hidden="true">·</span>
          <span>Syntactic & Rhetorical Fingerprinting</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-neutral-900 tracking-tight">
          Linguistic & Stylistic Radar
        </h1>
        <p className="mt-2 text-sm text-neutral-600 max-w-3xl leading-relaxed">
          Disinformation and clickbait exhibit distinct rhetorical anomalies compared to peer-reviewed journalism:
          hyperbolic emotional valence, lack of passive attributive verbs, all-caps shouting, and evasive epistemic hedging.
        </p>
      </div>

      {/* 4-Card Forensic Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Sensationalism */}
        <div className="bg-white border border-neutral-300 p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-mono mb-2">
            <span>METRIC 01</span>
            <AlertOctagon className={`w-4 h-4 ${metrics.sensationalismScore > 35 ? 'text-rose-600' : 'text-neutral-400'}`} />
          </div>
          <div className="text-2xl font-serif font-bold text-neutral-900 tabular-nums">
            {metrics.sensationalismScore}
            <span className="text-xs font-sans font-normal text-neutral-500"> / 100</span>
          </div>
          <div className="text-xs font-semibold uppercase text-neutral-700 mt-1">
            Sensationalism Index
          </div>
          <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
            Frequency of manufactured urgency, conspiracy tropes, and emotional trigger words.
          </p>
        </div>

        {/* Card 2: Attribution */}
        <div className="bg-white border border-neutral-300 p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-mono mb-2">
            <span>METRIC 02</span>
            <Quote className={`w-4 h-4 ${metrics.attributionScore > 30 ? 'text-emerald-600' : 'text-neutral-400'}`} />
          </div>
          <div className="text-2xl font-serif font-bold text-neutral-900 tabular-nums">
            {metrics.attributionScore}
            <span className="text-xs font-sans font-normal text-neutral-500"> / 100</span>
          </div>
          <div className="text-xs font-semibold uppercase text-neutral-700 mt-1">
            Source Attribution
          </div>
          <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
            Density of direct quotation marks, verified news wire citations, and institutional affiliations.
          </p>
        </div>

        {/* Card 3: Objectivity */}
        <div className="bg-white border border-neutral-300 p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-mono mb-2">
            <span>METRIC 03</span>
            <Shield className={`w-4 h-4 ${metrics.objectivityScore > 60 ? 'text-blue-600' : 'text-neutral-400'}`} />
          </div>
          <div className="text-2xl font-serif font-bold text-neutral-900 tabular-nums">
            {metrics.objectivityScore}
            <span className="text-xs font-sans font-normal text-neutral-500"> / 100</span>
          </div>
          <div className="text-xs font-semibold uppercase text-neutral-700 mt-1">
            Objectivity & Balance
          </div>
          <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
            Measures neutral third-person reporting vs aggressive first/second-person audience manipulation.
          </p>
        </div>

        {/* Card 4: Flesch Reading Ease */}
        <div className="bg-white border border-neutral-300 p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-mono mb-2">
            <span>METRIC 04</span>
            <BookOpen className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-neutral-900 tabular-nums">
            {metrics.readingEaseScore}
            <span className="text-xs font-sans font-normal text-neutral-500"> / 100</span>
          </div>
          <div className="text-xs font-semibold uppercase text-neutral-700 mt-1">
            Reading Complexity
          </div>
          <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
            Flesch Reading Ease score. Highly complex or scientific journalism typically scores 25-50.
          </p>
        </div>

      </div>

      {/* Detailed Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left: Typographic & Structural Anomalies */}
        <div className="bg-white border border-neutral-300 p-6 shadow-xs space-y-5">
          <div className="border-b border-neutral-200 pb-3">
            <h2 className="text-base font-semibold text-neutral-900">
              Orthographic & Punctuation Audit
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Physical character patterns and typographic formatting in the provided text.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200">
              <div>
                <span className="font-semibold text-neutral-900 block">Capitalization Density</span>
                <span className="text-neutral-500">
                  {metrics.capitalizationRatio > 0.12 ? 'Elevated uppercase shouting detected' : 'Standard typographic casing'}
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-neutral-900 tabular-nums">
                {(metrics.capitalizationRatio * 100).toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200">
              <div>
                <span className="font-semibold text-neutral-900 block">Exclamation Mark Frequency</span>
                <span className="text-neutral-500">
                  {metrics.exclamationCount > 1 ? 'Sensational punctuation anomaly' : 'Acceptable journalistic restraint'}
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-neutral-900 tabular-nums">
                {metrics.exclamationCount} marks
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200">
              <div>
                <span className="font-semibold text-neutral-900 block">Clickbait Headline Rating</span>
                <span className="text-neutral-500">
                  Calculated from curiosity gaps, hyperbole, and all-caps markers
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-neutral-900 tabular-nums">
                {metrics.clickbaitHeadlineScore} / 100
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200">
              <div>
                <span className="font-semibold text-neutral-900 block">Aggregate Word Count</span>
                <span className="text-neutral-500">Full lexical length analyzed across corpus</span>
              </div>
              <span className="font-mono text-sm font-bold text-neutral-900 tabular-nums">
                {metrics.wordCount} words
              </span>
            </div>
          </div>
        </div>

        {/* Right: Forensic Journalistic Criteria Matrix */}
        <div className="bg-white border border-neutral-300 p-6 shadow-xs space-y-5">
          <div className="border-b border-neutral-200 pb-3">
            <h2 className="text-base font-semibold text-neutral-900">
              Journalistic Standards Checklist
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Evaluation against Reuters Handbook of Journalism & SPJ Code of Ethics.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 border border-neutral-200 bg-neutral-50/50">
              <div className="flex items-center justify-between font-semibold text-neutral-900 mb-1">
                <span>1. Direct Source Attribution</span>
                <span className={`font-mono text-[11px] ${metrics.attributionScore > 25 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {metrics.attributionScore > 25 ? 'PASS' : 'FLAGGED: LOW'}
                </span>
              </div>
              <p className="text-neutral-600 leading-relaxed">
                Credible reporting consistently attributes claims to named individuals, research papers, or verified institutions rather than anonymous "sources claim" or "insiders say".
              </p>
            </div>

            <div className="p-3.5 border border-neutral-200 bg-neutral-50/50">
              <div className="flex items-center justify-between font-semibold text-neutral-900 mb-1">
                <span>2. Emotional Non-Interference</span>
                <span className={`font-mono text-[11px] ${metrics.sensationalismScore < 30 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {metrics.sensationalismScore < 30 ? 'PASS' : 'FLAGGED: HIGH SENSATIONALISM'}
                </span>
              </div>
              <p className="text-neutral-600 leading-relaxed">
                Professional journalists avoid telling the reader how to feel ("You won't believe", "Shocking truth"). Information is presented dispassionately.
              </p>
            </div>

            <div className="p-3.5 border border-neutral-200 bg-neutral-50/50">
              <div className="flex items-center justify-between font-semibold text-neutral-900 mb-1">
                <span>3. Falsifiability & Nuanced Hedging</span>
                <span className={`font-mono text-[11px] ${analysis.verdict === 'reliable' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {analysis.verdict === 'reliable' ? 'PASS' : 'CAUTION'}
                </span>
              </div>
              <p className="text-neutral-600 leading-relaxed">
                Authentic scientific and political reporting includes caveats, margin of error, and opposing perspectives rather than claiming absolute conspiratorial certainty.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
