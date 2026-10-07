/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ClassificationVerdict = 'reliable' | 'unreliable' | 'suspicious';

export interface TokenWeight {
  word: string;
  weight: number; // Positive = pushes toward fake/unreliable, Negative = pushes toward real/reliable
  type: 'sensational' | 'factual' | 'uncertain' | 'attribution' | 'neutral';
  count: number;
}

export interface LinguisticMetrics {
  sensationalismScore: number; // 0 - 100
  objectivityScore: number; // 0 - 100
  attributionScore: number; // 0 - 100
  exaggerationScore: number; // 0 - 100
  clickbaitHeadlineScore: number; // 0 - 100
  capitalizationRatio: number; // 0 - 1
  exclamationCount: number;
  wordCount: number;
  readingEaseScore: number; // 0 - 100
  sentimentPolarity: number; // -1 to +1
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  headline: string;
  body: string;
  verdict: ClassificationVerdict;
  fakeProbability: number; // 0 to 1
  realProbability: number; // 0 to 1
  confidence: number; // 0 to 100
  reason?: string;
  relatedArticles?: {
    title: string;
    source: string;
    pubDate: string;
    link: string;
  }[];
  metrics: LinguisticMetrics;
  topContributingTokens: TokenWeight[];
  flaggedSentences: {
    text: string;
    risk: 'high' | 'medium' | 'low';
    reason: string;
  }[];
  modelName: string;
}

export interface PresetArticle {
  id: string;
  title: string;
  outlet: string;
  date: string;
  category: string;
  expectedVerdict: ClassificationVerdict;
  headline: string;
  body: string;
  context: string;
}

export interface KaggleParsedPipeline {
  librariesDetected: string[];
  preprocessingSteps: string[];
  vectorizer: {
    type: string;
    ngramRange?: string;
    maxFeatures?: number;
    stopWords?: string;
  } | null;
  classifier: {
    name: string;
    type: 'linear' | 'naive_bayes' | 'ensemble' | 'neural' | 'unknown';
    hyperparameters: Record<string, string>;
  } | null;
  evaluationMetrics: string[];
  exportSnippet: string;
  summary: string;
}
