/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AnalysisResult } from '../types';
import { History, ShieldCheck, ShieldAlert, AlertTriangle, ArrowRight, Download, Trash2 } from 'lucide-react';

interface ArticleHistoryProps {
  history: AnalysisResult[];
  onSelectArticle: (article: AnalysisResult) => void;
  onClearHistory: () => void;
}

export const ArticleHistory: React.FC<ArticleHistoryProps> = ({
  history,
  onSelectArticle,
  onClearHistory
}) => {
  if (history.length === 0) {
    return (
      <div className="bg-white border border-neutral-300 p-8 text-center shadow-xs">
        <History className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-neutral-900">No Saved Investigations</h3>
        <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
          Analyze news articles and click "Save to Dossier" to maintain a comparative forensic record.
        </p>
      </div>
    );
  }

  const exportAllJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `veritas_investigation_dossier_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-white border border-neutral-300 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-neutral-700" />
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
            Investigation Archive ({history.length})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportAllJson}
            className="text-xs px-2.5 py-1 text-neutral-700 hover:text-neutral-900 border border-neutral-300 hover:bg-neutral-50 flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3 h-3" />
            <span>Export Dossier (JSON)</span>
          </button>
          <button
            onClick={onClearHistory}
            className="text-xs text-neutral-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer px-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div className="divide-y divide-neutral-200">
        {history.map((item) => {
          const isReal = item.verdict === 'reliable';
          const isFake = item.verdict === 'unreliable';

          return (
            <div
              key={item.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50 px-2 transition-colors"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-500">
                  <span>{item.timestamp}</span>
                  <span aria-hidden="true">·</span>
                  <span className="uppercase font-semibold text-neutral-700">{item.modelName}</span>
                </div>
                <h4 className="text-sm font-serif font-bold text-neutral-900 truncate">
                  {item.headline || 'Untitled Article'}
                </h4>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  {isReal ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  ) : isFake ? (
                    <ShieldAlert className="w-4 h-4 text-rose-700" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                  )}
                  <span
                    className={`font-semibold uppercase ${
                      isReal ? 'text-emerald-700' : isFake ? 'text-rose-700' : 'text-amber-700'
                    }`}
                  >
                    {item.verdict}
                  </span>
                  <span className="text-neutral-400 tabular-nums">
                    ({(item.fakeProbability * 100).toFixed(0)}% fake)
                  </span>
                </div>

                <button
                  onClick={() => onSelectArticle(item)}
                  className="px-2.5 py-1 text-xs text-neutral-700 hover:text-neutral-900 border border-neutral-300 hover:bg-white flex items-center gap-1 cursor-pointer"
                >
                  <span>Inspect</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
