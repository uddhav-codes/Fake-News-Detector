/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

app.use(express.json({ limit: '10mb' }));

// Headless Chromium rendering with bot evasion
async function scrapeWithPuppeteer(targetUrl: string): Promise<{ title: string; articleText: string; publishDate?: string; metaDescription?: string }> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-extensions',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  try {
    const page = await browser.newPage();

    // Mask Puppeteer navigator.webdriver
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    await page.setRequestInterception(true);
    page.on('request', (req) => {
      try {
        const type = req.resourceType();
        if (['image', 'media', 'font'].includes(type)) {
          req.abort().catch(() => {});
        } else {
          req.continue().catch(() => {});
        }
      } catch {}
    });

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    );
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    await new Promise((r) => setTimeout(r, 1200));

    const data = await page.evaluate(() => {
      const noise = document.querySelectorAll(
        'script, style, nav, footer, header, aside, .advertisement, .ad, .social-share, noscript, iframe, .cookie-banner, #cookie-consent'
      );
      noise.forEach((n) => n.remove());

      const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
      const twTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
      const h1 = document.querySelector('h1')?.innerText?.trim();
      const docTitle = document.title?.trim();
      let extractedTitle = ogTitle || twTitle || h1 || docTitle || '';
      extractedTitle = extractedTitle.replace(/\s*([|–—-])\s*(Reuters|BBC News|CNN|The New York Times|Fox News|AP News|The Guardian).*$/i, '').trim();

      const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
      const twDesc = document.querySelector('meta[name="twitter:description"]')?.getAttribute('content');
      const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content');
      const metaDescription = ogDesc || twDesc || metaDesc || '';

      const pubMeta = document.querySelector(
        'meta[property="article:published_time"], meta[name="pubdate"], meta[name="publishdate"], meta[name="date"], meta[property="og:article:published_time"]'
      )?.getAttribute('content');
      const timeEl = document.querySelector('time[datetime]')?.getAttribute('datetime') || document.querySelector('time')?.innerText?.trim();
      const publishDate = pubMeta || timeEl || '';

      // Paragraph extraction
      const articleEl = document.querySelector('article, [itemprop="articleBody"], .article-body, .story-body, .post-content, main');
      const container = articleEl || document.body;
      const paragraphs: string[] = [];

      if (container) {
        const pEls = container.querySelectorAll('p');
        pEls.forEach((p) => {
          const text = (p.innerText || '').trim();
          if (
            text.length > 25 &&
            !text.toLowerCase().includes('cookie') &&
            !text.toLowerCase().includes('privacy policy') &&
            !text.toLowerCase().includes('all rights reserved')
          ) {
            paragraphs.push(text);
          }
        });
      }

      let text = paragraphs.join('\n\n');
      return { title: extractedTitle, articleText: text, publishDate, metaDescription };
    });

    return data;
  } finally {
    await browser.close().catch(() => {});
  }
}

// Scraper endpoint with multi-tier fallback
app.post('/api/scrape-article', async (req: Request, res: Response): Promise<void> => {
  try {
    const { url, renderJs } = req.body;

    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'Please provide a valid URL string.' });
      return;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      res.status(400).json({ error: 'Invalid URL format. Include http:// or https://' });
      return;
    }

    let articleText = '';
    let title = '';
    let publishDate = '';
    let metaDescription = '';
    let renderedWith = 'static';

    // Tier 1: Fast Static Extraction + JSON-LD Schema
    try {
      const response = await fetch(parsedUrl.href, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (response.ok) {
        const html = await response.text();
        const $ = cheerio.load(html);

        title = $('meta[property="og:title"]').attr('content') ||
                $('meta[name="twitter:title"]').attr('content') ||
                $('h1').first().text().trim() \vert{}\vert{}$('title').text().trim() || '';
        title = title.replace(/\s*([|–—-])\s*(Reuters|BBC News|CNN|The New York Times|Fox News|AP News|The Guardian).*$/i, '').trim();

        metaDescription = $('meta[property="og:description"]').attr('content') ||
                          $('meta[name="twitter:description"]').attr('content') ||
                          $('meta[name="description"]').attr('content') || '';

        publishDate = $('meta[property="article:published_time"]').attr('content') ||
                      $('meta[name="pubdate"]').attr('content') ||
                      $('time[datetime]').first().attr('datetime') \vert{}\vert{}$('time').first().text().trim() || '';

        // Extract structured JSON-LD (often bypasses paywalls)
        $('script[type="application/ld+json"]').each((_, el) => {
          try {
            const raw = $(el).html();
            if (raw) {
              const data = JSON.parse(raw);
              const target = Array.isArray(data) ? data[0] : (data['@graph'] ? data['@graph'].find((item: any) => item.articleBody || item.description) : data);
              if (target?.articleBody && typeof target.articleBody === 'string' && target.articleBody.length > articleText.length) {
                articleText = target.articleBody;
              }
              if (!metaDescription && target?.description) {
                metaDescription = target.description;
              }
            }
          } catch {}
        });

        // Fallback to DOM paragraphs if JSON-LD had no full body
        if (!articleText || articleText.length < 120) {
          const articleContainer = $('article, [itemprop="articleBody"], .article-body, .story-body, .post-content, main');
          const targetEl = articleContainer.length > 0 ? articleContainer : $('body');
          const paragraphs: string[] = [];

          targetEl.find('p').each((_, el) => {
            const text = $(el).text().trim();
            if (text.length > 25 && !text.includes('cookie') && !text.includes('privacy policy') && !text.includes('All rights reserved')) {
              paragraphs.push(text);
            }
          });
          if (paragraphs.length > 0) {
            articleText = paragraphs.join('\n\n');
          }
        }
      }
    } catch (staticErr: any) {
      console.warn(`[Scraper] Fast fetch error:`, staticErr.message);
    }

    // Tier 2: Headless Browser Fallback
    if (!articleText || articleText.length < 120) {
      try {
        const rendered = await scrapeWithPuppeteer(parsedUrl.href);
        if (rendered.articleText && rendered.articleText.length >= 50) {
          articleText = rendered.articleText;
          renderedWith = 'javascript';
        }
        if (rendered.title && !title) title = rendered.title;
        if (rendered.publishDate && !publishDate) publishDate = rendered.publishDate;
        if (rendered.metaDescription && !metaDescription) metaDescription = rendered.metaDescription;
      } catch (jsErr: any) {
        console.warn(`[Scraper] Headless browser fallback error:`, jsErr.message);
      }
    }

    // Tier 3: Metadata Fallback (prevents 422 errors on paywalled links)
    if (!articleText || articleText.length < 50) {
      if (metaDescription || title) {
        articleText = [title, metaDescription].filter(Boolean).join('\n\n');
        renderedWith = 'metadata-summary';
      } else {
        res.status(422).json({
          error: 'Could not extract article content or metadata from this webpage. Try testing in Headline / Text mode instead.',
        });
        return;
      }
    }

    const snippet = articleText.length > 300 ? `${articleText.slice(0, 300)}...` : articleText;

    res.json({
      success: true,
      url: parsedUrl.href,
      title: title || 'Extracted Article',
      text: articleText,
      snippet,
      publishDate,
      renderedWith,
      wordCount: articleText.split(/\s+/).filter(Boolean).length,
    });
  } catch (err: any) {
    res.status(500).json({
      error: `Scraping error: ${err.message || 'Unable to fetch webpage.'}`,
    });
  }
});

// Known satirical and parody publications
const KNOWN_SATIRE_DOMAINS = [
  'theonion.com',
  'babylonbee.com',
  'clickhole.com',
  'thehardtimes.net',
  'waterfordwhispersnews.com',
  'duffelblog.com',
  'worldnewsdailyreport.com',
  'borowitzreport.com',
  'thebeaverton.com',
  'satirewire.com',
  'chaser.com.au',
  'betootaadvocate.com',
  'reductress.com',
  'newslo.com',
  'empirenews.net',
  'huzlers.com',
  'nationalreport.net'
];

function extractCleanDomain(urlOrDomain?: string): string {
  if (!urlOrDomain) return '';
  try {
    const raw = urlOrDomain.startsWith('http') ? new URL(urlOrDomain).hostname : urlOrDomain;
    return raw.toLowerCase().replace(/^www\./, '').trim();
  } catch {
    return urlOrDomain.toLowerCase().replace(/^www\./, '').trim();
  }
}

interface WebNewsArticle {
  title: string;
  source: string;
  pubDate: string;
  link: string;
}

// Live web search using Google News RSS
async function searchRecentNewsOnWeb(queryText: string): Promise<WebNewsArticle[]> {
  try {
    const cleanQuery = queryText
      .replace(/[^\w\s]/gi, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2)
      .slice(0, 10)
      .join(' ')
      .trim();

    if (!cleanQuery) return [];

    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(cleanQuery)}&hl=en-US&gl=US&ceid=US:en`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) return [];

    const xml = await response.text();
    const $ = cheerio.load(xml, { xmlMode: true });
    const articles: WebNewsArticle[] = [];

    $('item').slice(0, 5).each((_, el) => {
      const rawTitle = $(el).find('title').text().trim();
      const link = $(el).find('link').text().trim();
      const pubDate = $(el).find('pubDate').text().trim();
      const source = $(el).find('source').text().trim() || 'News Publication';

      if (rawTitle) {
        articles.push({
          title: rawTitle,
          source,
          pubDate,
          link
        });
      }
    });

    return articles;
  } catch (err: any) {
    console.warn('[Web News Search Error]', err.message);
    return [];
  }
}

// News Verification Endpoint with Gemini
app.post('/api/verify-headline', async (req: Request, res: Response): Promise<void> => {
  try {
    const { headline, body, url, domain, publishDate } = req.body;
    if (!headline || typeof headline !== 'string') {
      res.status(400).json({ error: 'Headline is required.' });
      return;
    }

    const cleanDomain = extractCleanDomain(domain || url);

    if (cleanDomain && KNOWN_SATIRE_DOMAINS.some(d => cleanDomain.endsWith(d))) {
      res.json({
        success: true,
        isReal: false,
        verdict: 'unreliable',
        confidence: 99.9,
        fakeProbability: 0.999,
        realProbability: 0.001,
        reason: `Published by ${cleanDomain}, an established satirical publication that publishes fictional parody.`,
        relatedArticles: []
      });
      return;
    }

    const recentWebArticles = await searchRecentNewsOnWeb(headline);

    if (ai) {
      const now = new Date();
      const currentDateStr = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const currentYear = now.getFullYear();

      const prompt = `You are an elite news verification and journalistic fact-checking intelligence system.

CURRENT REAL-WORLD DATE TODAY: ${currentDateStr} (Year: ${currentYear}).

LIVE RECENT ARTICLES FOUND ON THE WEB:
${
  recentWebArticles.length > 0
    ? recentWebArticles
        .map((a, i) => `${i + 1}.: "${a.title}"`)
        .join('\n')
    : 'No directly matching news wire articles retrieved from the web for this exact query.'
}

ARTICLE UNDER EVALUATION:
Headline: "${headline}"
${cleanDomain ? `Source Domain: "${cleanDomain}"` : ''}
${publishDate ? `Article Publication Date: "${publishDate}"` : ''}
${body ? `Article Content / Summary: "${body.slice(0, 3500)}"` : ''}

VERIFICATION PROTOCOL:
1. If the headline/content matches real events corroborated by reliable sources or reputable reporting, classify as REAL (isReal: true).
2. If the headline asserts major events (death hoaxes, war declarations, impossible claims) with zero corroboration, classify as FAKE (isReal: false).
3. Do not reject real historical or recent events due to training cutoffs.

Respond strictly in valid JSON format:
{
  "isReal": boolean,
  "confidence": number,
  "verdict": "reliable" | "unreliable",
  "reason": "1 concise, factual sentence explaining the veracity determination with accurate date/temporal context and web cross-reference"
}`;

      // Try primary model (gemini-3.8-flash), fall back to 1.5 if needed
      const modelsToTry = ['gemini-3.8-flash', 'gemini-1.5-flash'];
      for (const modelName of modelsToTry) {
        try {
          const aiRes = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: 'application/json'
            }
          });

          const rawText = aiRes.text?.trim() || '{}';
          const cleanJson = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
          const parsed = JSON.parse(cleanJson);
          const isReal = Boolean(parsed.isReal);
          const rawConf = typeof parsed.confidence === 'number' ? parsed.confidence : 98.5;
          const confidence = Math.min(99.9, Math.max(85.0, rawConf));
          const fakeProb = isReal ? (100 - confidence) / 100 : confidence / 100;
          const realProb = 1 - fakeProb;

          res.json({
            success: true,
            isReal,
            verdict: isReal ? 'reliable' : 'unreliable',
            confidence: Math.round(confidence * 100) / 100,
            fakeProbability: Math.round(fakeProb * 1000) / 1000,
            realProbability: Math.round(realProb * 1000) / 1000,
            reason: parsed.reason || '',
            relatedArticles: recentWebArticles.slice(0, 4)
          });
          return;
        } catch (geminiErr: any) {
          console.warn(`[Model ${modelName} Verification Error, attempting next]`, geminiErr.message);
        }
      }
    }

    res.json({
      success: false,
      fallback: true,
      relatedArticles: recentWebArticles.slice(0, 4)
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Static and SPA server
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT} (Node env: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer();
