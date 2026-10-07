/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Newspaper, Code2, Sliders, BarChart3, BookOpen } from 'lucide-react';

interface HeaderProps {
  activeTab: 'detector' | 'kaggle' | 'linguistics' | 'benchmark' | 'architecture';
  setActiveTab: (tab: 'detector' | 'kaggle' | 'linguistics' | 'benchmark' | 'architecture') => void;
  onOpenPreset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenPreset }) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FBFBF9]/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveTab('detector'); }}
            className="text-xl font-serif font-bold tracking-tight text-neutral-900 flex items-center gap-2 hover:opacity-85 transition-opacity"
          >
            <span className="font-serif tracking-normal text-2xl font-bold">VERITAS</span>
            <span className="text-xs font-mono font-medium tracking-widest uppercase px-1.5 py-0.5 border border-neutral-300 text-neutral-700 bg-neutral-100">
              LENS
            </span>
          </a>
        </div>

        {/* Zone 2: Navigation Links (Text with clean hover indicator) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-600">
          <button
            onClick={() => setActiveTab('detector')}
            className={`flex items-center gap-1.5 py-1 transition-colors relative ${
              activeTab === 'detector' ? 'text-neutral-900 font-semibold' : 'hover:text-neutral-900'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>Detector Studio</span>
            {activeTab === 'detector' && (
              <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-neutral-900" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('kaggle')}
            className={`flex items-center gap-1.5 py-1 transition-colors relative ${
              activeTab === 'kaggle' ? 'text-neutral-900 font-semibold' : 'hover:text-neutral-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Kaggle Bridge</span>
            {activeTab === 'kaggle' && (
              <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-neutral-900" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('linguistics')}
            className={`flex items-center gap-1.5 py-1 transition-colors relative ${
              activeTab === 'linguistics' ? 'text-neutral-900 font-semibold' : 'hover:text-neutral-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Linguistic Radar</span>
            {activeTab === 'linguistics' && (
              <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-neutral-900" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('benchmark')}
            className={`flex items-center gap-1.5 py-1 transition-colors relative ${
              activeTab === 'benchmark' ? 'text-neutral-900 font-semibold' : 'hover:text-neutral-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Metrics & Matrix</span>
            {activeTab === 'benchmark' && (
              <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-neutral-900" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-1.5 py-1 transition-colors relative ${
              activeTab === 'architecture' ? 'text-neutral-900 font-semibold' : 'hover:text-neutral-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Deployment Guide</span>
            {activeTab === 'architecture' && (
              <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-neutral-900" />
            )}
          </button>
        </nav>

        {/* Zone 3: Primary Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPreset}
            className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 transition-colors whitespace-nowrap cursor-pointer"
          >
            Load Case Studies
          </button>
          <button
            onClick={() => setActiveTab('kaggle')}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 transition-colors whitespace-nowrap cursor-pointer"
          >
            Paste Kaggle Code
          </button>
        </div>

      </div>
    </header>
  );
};
