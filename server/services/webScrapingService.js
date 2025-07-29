import axios from 'axios';
import { JSDOM } from 'jsdom';
import natural from 'natural';

export class WebScrapingService {
  
  // Main method to fetch and analyze web data
  static async fetchAndAnalyzeData(query, language = 'english') {
    try {
      console.log('Web scraping for query:', query);
      
      const searchTerms = this.extractSearchTerms(query);
      const scrapedData = await this.scrapeMultipleSources(searchTerms, query);
      const analyzedData = this.analyzeScrapedData(scrapedData, query, language);
      
      return {
        query: query,
        data: analyzedData,
        sources: Object.keys(scrapedData),
        timestamp: new Date().toISOString(),
        language: language
      };
      
    } catch (error) {
      console.error('Web scraping error:', error);
      return {
        query: query,
        data: {},
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Extract relevant search terms from query
  static extractSearchTerms(query) {
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(query.toLowerCase());
    
    // Filter out common words and keep relevant terms
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can'];
    
    return tokens.filter(token => 
      token.length > 2 && 
      !stopWords.includes(token) &&
      !/^\d+$/.test(token)
    ).slice(0, 5); // Limit to 5 terms
  }

  // Scrape multiple sources for data
  static async scrapeMultipleSources(searchTerms, query) {
    const data = {};
    const isFact = this.isFactQuery(query);
    const isHowTo = this.isHowToQuery(query);
    for (const term of searchTerms) {
      try {
        const sources = [
          (!isFact && !isHowTo) ? this.scrapePublicAPIs(term) : null,
          this.scrapeWikipedia(term, query),
          (!isFact && !isHowTo) ? this.scrapeNewsSites(term) : null,
          (!isFact && !isHowTo) ? this.scrapeGovernmentSites(term) : null
        ];
        const results = await Promise.allSettled(sources.filter(Boolean));
        results.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            const sourceName = ['apis', 'wikipedia', 'news', 'government'].filter((_, i) => (!isFact && !isHowTo) || i === 1)[index];
            if (!data[sourceName]) data[sourceName] = {};
            data[sourceName][term] = result.value;
          }
        });
      } catch (error) {
        console.log(`Failed to scrape data for term: ${term}`, error.message);
      }
    }
    return data;
  }

  // Scrape public APIs
  static async scrapePublicAPIs(term) {
    try {
      // Try public APIs that don't require keys
      const apis = [
        `https://api.publicapis.org/entries?title=${encodeURIComponent(term)}`,
        `https://api.github.com/search/repositories?q=${encodeURIComponent(term)}`,
        `https://jsonplaceholder.typicode.com/posts?title_like=${encodeURIComponent(term)}`
      ];
      
      for (const api of apis) {
        try {
          const response = await axios.get(api, { timeout: 5000 });
          if (response.data && (response.data.entries || response.data.items || response.data.length > 0)) {
            return {
              source: api,
              data: response.data,
              timestamp: new Date().toISOString()
            };
          }
        } catch (error) {
          continue;
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  // Helper: Scrape Wikipedia infobox for a property (e.g., CEO, founder)
  static async extractInfoboxFact(term, query) {
    try {
      // Get the HTML of the Wikipedia page
      const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(term)}`;
      const resp = await axios.get(url, { timeout: 7000 });
      const dom = new JSDOM(resp.data);
      const doc = dom.window.document;
      // Find the infobox table
      const infobox = doc.querySelector('.infobox');
      if (!infobox) return null;
      const q = query.toLowerCase();
      // Map query to infobox label
      let label = null;
      if (q.includes('ceo')) label = 'ceo';
      if (q.includes('founder')) label = 'founder';
      if (q.includes('president')) label = 'president';
      if (q.includes('chairman')) label = 'chairman';
      if (q.includes('director')) label = 'director';
      if (q.includes('owner')) label = 'owner';
      if (q.includes('leader')) label = 'leader';
      if (q.includes('capital')) label = 'capital';
      if (q.includes('population')) label = 'population';
      // Try to find the row with the label
      let value = null;
      infobox.querySelectorAll('tr').forEach(tr => {
        const th = tr.querySelector('th');
        const td = tr.querySelector('td');
        if (th && td && th.textContent && td.textContent) {
          const thText = th.textContent.trim().toLowerCase();
          if (label && thText.includes(label)) {
            // Prefer value labeled 'current', else first
            let text = td.textContent.trim().replace(/\[.*?\]/g, '').replace(/\n+/g, ' ');
            if (text.toLowerCase().includes('current')) {
              value = text;
            } else if (!value) {
              value = text;
            }
          }
        }
      });
      if (value) {
        // Clean up value (remove extra info, keep first name if comma-separated)
        value = value.split(',')[0].split(';')[0].split('\n')[0].trim();
        // Remove parenthetical info
        value = value.replace(/\(.*?\)/g, '').trim();
        return value;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // Helper: Search for secondary Wikipedia page for how-to queries
  static async fetchSecondaryHowToPage(term, query) {
    const variants = [
      `Cultivation of ${term}`,
      `Farming of ${term}`,
      `Growing ${term}`,
      `${term} cultivation`,
      `${term} farming`,
      `${term} production`,
      `${term} agriculture`
    ];
    for (const variant of variants) {
      try {
        const resp = await axios.get(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(variant)}&origin=*`, { timeout: 5000 });
        if (resp.data && resp.data.query && resp.data.query.pages) {
          const pages = resp.data.query.pages;
          const pageId = Object.keys(pages)[0];
          const page = pages[pageId];
          if (page && page.extract && page.extract.length > 50 && !page.extract.toLowerCase().includes('may refer to')) {
            return page.extract;
          }
        }
      } catch (e) { continue; }
    }
    return null;
  }

  // Update: scrapeWikipedia to use infobox and secondary page search
  static async scrapeWikipedia(term, query = '') {
    try {
      // 1. Fact queries: Try all Wikidata matches
      if (this.isFactQuery(query)) {
        // Search for up to 3 possible entities
        const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(term)}&language=en&format=json&origin=*`;
        const searchResp = await axios.get(searchUrl, { timeout: 5000 });
        if (searchResp.data && searchResp.data.search && searchResp.data.search.length > 0) {
          for (const entity of searchResp.data.search.slice(0, 3)) {
            const wikidataFact = await this.fetchFactFromWikidata(entity.label, query);
            if (wikidataFact) {
              return {
                source: 'wikidata',
                title: entity.label,
                extract: wikidataFact,
                timestamp: new Date().toISOString()
              };
            }
          }
        }
        // Fallback: Wikipedia infobox
        const infoboxFact = await this.extractInfoboxFact(term, query);
        if (infoboxFact) {
          return {
            source: 'wikipedia-infobox',
            title: term,
            extract: infoboxFact,
            timestamp: new Date().toISOString()
          };
        }
        // Fallback: Wikipedia extract and regex
        const response = await axios.get(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(term)}&origin=*`, { timeout: 5000 });
        if (response.data && response.data.query && response.data.query.pages) {
          const pages = response.data.query.pages;
          const pageId = Object.keys(pages)[0];
          const page = pages[pageId];
          if (page && page.extract) {
            // Try regex-based fact extraction
            const fact = this.extractFactByRegex(page.extract, query);
            if (fact) {
              return {
                source: 'wikipedia',
                title: page.title,
                extract: fact,
                timestamp: new Date().toISOString()
              };
            }
            // Try previous sentence extraction
            let factSentence = this.extractFactSentence(page.extract, query);
            if (factSentence) {
              return {
                source: 'wikipedia',
                title: page.title,
                extract: factSentence,
                timestamp: new Date().toISOString()
              };
            }
          }
        }
        // If all fail
        return {
          source: 'none',
          title: term,
          extract: 'Sorry, I could not find the answer to your question.',
          timestamp: new Date().toISOString()
        };
      }
      // 2. How-to/guidance queries: Extract relevant section or secondary page
      if (this.isHowToQuery(query)) {
        // Try to get the most relevant section
        const sectionText = await this.fetchWikipediaSection(term, query);
        if (sectionText && sectionText.length > 50) {
          return {
            source: 'wikipedia-section',
            title: term,
            extract: sectionText,
            timestamp: new Date().toISOString()
          };
        }
        // Try secondary page
        const secondary = await this.fetchSecondaryHowToPage(term, query);
        if (secondary) {
          return {
            source: 'wikipedia-secondary',
            title: term,
            extract: secondary,
            timestamp: new Date().toISOString()
          };
        }
        // Fallback: intro extract
        const response = await axios.get(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(term)}&origin=*`, { timeout: 5000 });
        if (response.data && response.data.query && response.data.query.pages) {
          const pages = response.data.query.pages;
          const pageId = Object.keys(pages)[0];
          const page = pages[pageId];
          if (page && page.extract) {
            return {
              source: 'wikipedia',
              title: page.title,
              extract: page.extract.substring(0, 800) + '...',
              timestamp: new Date().toISOString()
            };
          }
        }
        // If all fail
        return {
          source: 'none',
          title: term,
          extract: 'Sorry, I could not find a step-by-step guide for your question.',
          timestamp: new Date().toISOString()
        };
      }
      // 3. General/single-word queries: Always return Wikipedia intro/definition
      const response = await axios.get(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(term)}&origin=*`, { timeout: 5000 });
      if (response.data && response.data.query && response.data.query.pages) {
        const pages = response.data.query.pages;
        const pageId = Object.keys(pages)[0];
        const page = pages[pageId];
        if (page && page.extract) {
          return {
            source: 'wikipedia',
            title: page.title,
            extract: page.extract.substring(0, 800) + '...',
            timestamp: new Date().toISOString()
          };
        }
      }
      return {
        source: 'none',
        title: term,
        extract: 'Sorry, I could not find relevant information for your question.',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        source: 'none',
        title: term,
        extract: 'Sorry, I could not find relevant information for your question.',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Helper: Detect if query is a fact query (e.g., 'ceo of google', 'founder of apple')
  static isFactQuery(query) {
    if (!query) return false;
    const factKeywords = [
      'ceo', 'founder', 'president', 'head', 'chairman', 'director', 'owner',
      'capital of', 'population of', 'who is', 'what is', 'when was', 'where is', 'leader of', 'chief executive officer'
    ];
    const q = query.toLowerCase();
    return factKeywords.some(k => q.includes(k));
  }

  // Helper: Detect if query is a how-to/guidance query
  static isHowToQuery(query) {
    if (!query) return false;
    const howToKeywords = [
      'how to', 'how do i', 'how can i', 'steps to', 'grow', 'cultivate', 'plant', 'harvest', 'raise', 'produce', 'make', 'prepare', 'build', 'create', 'develop', 'improve', 'increase', 'reduce', 'control', 'manage', 'treat', 'prevent', 'care', 'guide', 'instructions', 'method', 'process', 'way to', 'tips for', 'best way', 'technique', 'procedure'
    ];
    const q = query.toLowerCase();
    return howToKeywords.some(k => q.includes(k));
  }

  // Helper: Extract the most relevant sentence from text for a fact query
  static extractFactSentence(text, query) {
    if (!text) return null;
    const q = query.toLowerCase();
    const keywords = [];
    if (q.includes('ceo')) keywords.push('ceo', 'chief executive officer');
    if (q.includes('founder')) keywords.push('founder', 'co-founder');
    if (q.includes('president')) keywords.push('president');
    if (q.includes('capital')) keywords.push('capital');
    if (q.includes('population')) keywords.push('population');
    if (q.includes('chairman')) keywords.push('chairman');
    if (q.includes('director')) keywords.push('director');
    if (q.includes('owner')) keywords.push('owner');
    if (q.includes('leader')) keywords.push('leader');
    // Always add the main subject
    const subject = q.split(' of ').pop().trim();
    // Split text into sentences
    const sentences = text.split(/(?<=[.!?])\s+/);
    // Try to find a sentence with the keyword and subject
    for (const kw of keywords) {
      for (const s of sentences) {
        if (s.toLowerCase().includes(kw) && (!subject || s.toLowerCase().includes(subject))) {
          return s.trim();
        }
      }
    }
    // Fallback: first sentence
    return sentences[0]?.trim() || null;
  }

  // Add: Helper to map fact keywords to Wikidata properties
  static getWikidataPropertyForFact(query) {
    const q = query.toLowerCase();
    if (q.includes('ceo') || q.includes('chief executive officer')) return 'P169';
    if (q.includes('founder') || q.includes('co-founder')) return 'P112';
    if (q.includes('president')) return 'P35';
    if (q.includes('capital')) return 'P36';
    if (q.includes('population')) return 'P1082';
    if (q.includes('chairman')) return 'P488';
    if (q.includes('director')) return 'P1037';
    if (q.includes('owner')) return 'P127';
    if (q.includes('leader')) return 'P6';
    return null;
  }

  // Add: Helper to fetch fact from Wikidata
  static async fetchFactFromWikidata(term, query) {
    const property = this.getWikidataPropertyForFact(query);
    if (!property) return null;
    try {
      // Step 1: Get Wikidata QID for the term
      const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(term)}&language=en&format=json&origin=*`;
      const searchResp = await axios.get(searchUrl, { timeout: 5000 });
      if (!searchResp.data || !searchResp.data.search || searchResp.data.search.length === 0) return null;
      const qid = searchResp.data.search[0].id;
      // Step 2: Get the property value
      const entityUrl = `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`;
      const entityResp = await axios.get(entityUrl, { timeout: 5000 });
      const entity = entityResp.data.entities[qid];
      if (!entity || !entity.claims || !entity.claims[property]) return null;
      // Get the value (handle string, item, or quantity types)
      const claim = entity.claims[property][0];
      if (claim.mainsnak.datavalue) {
        const dv = claim.mainsnak.datavalue;
        if (dv.type === 'wikibase-entityid') {
          // Need to resolve the entity id to a label
          const valueQid = dv.value.id;
          const label = entityResp.data.entities[valueQid]?.labels?.en?.value;
          if (label) return label;
          // Fallback: fetch label
          const labelUrl = `https://www.wikidata.org/wiki/Special:EntityData/${valueQid}.json`;
          const labelResp = await axios.get(labelUrl, { timeout: 5000 });
          return labelResp.data.entities[valueQid]?.labels?.en?.value || null;
        } else if (dv.type === 'string' || dv.type === 'monolingualtext') {
          return dv.value;
        } else if (dv.type === 'quantity') {
          return dv.value.amount;
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // Helper: Extract relevant section from Wikipedia page
  static async fetchWikipediaSection(term, query) {
    try {
      // Get all sections for the page
      const sectionResp = await axios.get(`https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(term)}&format=json&prop=sections&origin=*`, { timeout: 5000 });
      if (!sectionResp.data || !sectionResp.data.parse || !sectionResp.data.parse.sections) return null;
      const sections = sectionResp.data.parse.sections;
      // Find the most relevant section
      const sectionKeywords = ['cultivation', 'agriculture', 'growing', 'farming', 'propagation', 'production', 'harvest', 'care', 'management', 'preparation', 'processing', 'usage', 'application', 'treatment', 'prevention', 'control', 'method', 'technique', 'procedure', 'steps'];
      const q = query.toLowerCase();
      let bestSection = null;
      let bestScore = 0;
      for (const section of sections) {
        const title = section.line.toLowerCase();
        let score = 0;
        for (const kw of sectionKeywords) {
          if (title.includes(kw)) score++;
          if (q.includes(kw) && title.includes(kw)) score += 2;
        }
        if (score > bestScore) {
          bestScore = score;
          bestSection = section;
        }
      }
      if (!bestSection) return null;
      // Fetch the section text
      const sectionIndex = bestSection.index;
      const textResp = await axios.get(`https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(term)}&format=json&prop=text&section=${sectionIndex}&origin=*`, { timeout: 5000 });
      if (textResp.data && textResp.data.parse && textResp.data.parse.text) {
        // Extract plain text from HTML
        const html = textResp.data.parse.text['*'];
        const dom = new JSDOM(html);
        const plain = dom.window.document.body.textContent || '';
        return plain.trim().replace(/\n+/g, '\n');
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // Helper: Regex-based fact extraction from Wikipedia extract
  static extractFactByRegex(text, query) {
    if (!text) return null;
    const q = query.toLowerCase();
    let regex = null;
    if (q.includes('ceo')) regex = /ceo[^.]*?is ([^.]+)\./i;
    if (q.includes('founder')) regex = /founder[^.]*?is ([^.]+)\./i;
    if (q.includes('president')) regex = /president[^.]*?is ([^.]+)\./i;
    if (q.includes('capital')) regex = /capital[^.]*?is ([^.]+)\./i;
    if (q.includes('population')) regex = /population[^.]*?is ([^.]+)\./i;
    if (q.includes('chairman')) regex = /chairman[^.]*?is ([^.]+)\./i;
    if (q.includes('director')) regex = /director[^.]*?is ([^.]+)\./i;
    if (q.includes('owner')) regex = /owner[^.]*?is ([^.]+)\./i;
    if (q.includes('leader')) regex = /leader[^.]*?is ([^.]+)\./i;
    if (regex) {
      const match = text.match(regex);
      if (match && match[1]) return match[0].trim();
    }
    return null;
  }

  // Scrape news sites
  static async scrapeNewsSites(term) {
    try {
      // Try to get news from public RSS feeds or news APIs
      const newsSources = [
        'https://newsapi.org/v2/everything',
        'https://api.nytimes.com/svc/search/v2/articlesearch.json'
      ];
      
      for (const source of newsSources) {
        try {
          const response = await axios.get(`${source}?q=${encodeURIComponent(term)}&api-key=demo`, {
            timeout: 5000
          });
          
          if (response.data && response.data.articles) {
            return {
              source: 'news',
              articles: response.data.articles.slice(0, 3).map(article => ({
                title: article.title,
                description: article.description,
                url: article.url
              })),
              timestamp: new Date().toISOString()
            };
          }
        } catch (error) {
          continue;
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  // Scrape government sites for agricultural data
  static async scrapeGovernmentSites(term) {
    try {
      // Try to scrape public government data sources
      const govSources = [
        'https://data.gov.in/api/v1/datastore',
        'https://api.data.gov/agriculture'
      ];
      
      for (const source of govSources) {
        try {
          const response = await axios.get(`${source}?q=${encodeURIComponent(term)}`, {
            timeout: 5000
          });
          
          if (response.data && response.data.results) {
            return {
              source: 'government',
              data: response.data.results.slice(0, 5),
              timestamp: new Date().toISOString()
            };
          }
        } catch (error) {
          continue;
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  // Analyze scraped data and generate insights
  static analyzeScrapedData(scrapedData, originalQuery, language) {
    const analysis = {
      summary: '',
      keyInsights: [],
      relevantData: {},
      recommendations: [],
      confidence: 0.5
    };
    
    try {
      // Extract key information from different sources
      const allText = this.extractAllText(scrapedData);
      const insights = this.generateInsights(allText, originalQuery, language);
      
      analysis.summary = insights.summary;
      analysis.keyInsights = insights.keyInsights;
      analysis.relevantData = this.extractRelevantData(scrapedData, originalQuery);
      analysis.recommendations = insights.recommendations;
      analysis.confidence = insights.confidence;
      
    } catch (error) {
      console.error('Data analysis error:', error);
      analysis.summary = this.getDefaultSummary(language);
    }
    
    return analysis;
  }

  // Extract all text from scraped data
  static extractAllText(scrapedData) {
    let allText = '';
    Object.values(scrapedData).forEach(sourceData => {
      Object.values(sourceData).forEach(item => {
        if (typeof item === 'string') {
          allText += item + ' ';
        } else if (item && typeof item === 'object') {
          if (item.extract) allText += item.extract + ' ';
          if (item.title) allText += item.title + ' ';
          if (item.description) allText += item.description + ' ';
          if (item.data) allText += this.extractReadableFromAPIData(item.data) + ' ';
        }
      });
    });
    return allText;
  }

  // Helper to extract readable summaries from known API responses
  static extractReadableFromAPIData(data) {
    let text = '';
    // GitHub API
    if (data.items && Array.isArray(data.items)) {
      data.items.slice(0, 2).forEach(repo => {
        if (repo.name && repo.description) {
          text += `${repo.name}: ${repo.description}. `;
        } else if (repo.name) {
          text += `${repo.name}. `;
        }
      });
    }
    // publicapis.org
    if (data.entries && Array.isArray(data.entries)) {
      data.entries.slice(0, 2).forEach(entry => {
        if (entry.API && entry.Description) {
          text += `${entry.API}: ${entry.Description}. `;
        }
      });
    }
    // JSONPlaceholder posts
    if (Array.isArray(data) && data.length > 0 && data[0].title) {
      data.slice(0, 2).forEach(post => {
        text += `${post.title}. `;
      });
    }
    // Fallback: skip if not recognized
    return text;
  }

  // Generate insights from text data
  static generateInsights(text, query, language) {
    const insights = {
      summary: '',
      keyInsights: [],
      recommendations: [],
      confidence: 0.5
    };
    
    if (!text || text.length < 50) {
      insights.summary = this.getDefaultSummary(language);
      return insights;
    }
    
    // Analyze text using NLP techniques
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const words = text.toLowerCase().split(/\s+/);
    
    // Generate summary
    insights.summary = this.generateSummary(sentences, query, language);
    
    // Extract key insights
    insights.keyInsights = this.extractKeyInsights(sentences, query);
    
    // Generate recommendations
    insights.recommendations = this.generateRecommendations(words, query, language);
    
    // Calculate confidence based on data quality
    insights.confidence = this.calculateDataConfidence(text, sentences);
    
    return insights;
  }

  // Generate summary from sentences
  static generateSummary(sentences, query, language) {
    if (sentences.length === 0) {
      return this.getDefaultSummary(language);
    }
    
    // Select most relevant sentences
    const relevantSentences = sentences
      .map(sentence => ({
        sentence,
        relevance: this.calculateSentenceRelevance(sentence, query)
      }))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3)
      .map(item => item.sentence);
    
    return relevantSentences.join(' ');
  }

  // Calculate sentence relevance to query
  static calculateSentenceRelevance(sentence, query) {
    const queryWords = query.toLowerCase().split(/\s+/);
    const sentenceWords = sentence.toLowerCase().split(/\s+/);
    
    const matches = queryWords.filter(word => 
      sentenceWords.some(sWord => sWord.includes(word) || word.includes(sWord))
    );
    
    return matches.length / queryWords.length;
  }

  // Extract key insights from sentences
  static extractKeyInsights(sentences, query) {
    const insights = [];
    const queryWords = query.toLowerCase().split(/\s+/);
    
    sentences.forEach(sentence => {
      const relevance = this.calculateSentenceRelevance(sentence, query);
      if (relevance > 0.3 && sentence.length > 20) {
        insights.push(sentence.trim());
      }
    });
    
    return insights.slice(0, 5);
  }

  // Generate recommendations based on data
  static generateRecommendations(words, query, language) {
    const recommendations = [];
    const queryLower = query.toLowerCase();
    
    // Generate context-aware recommendations
    if (queryLower.includes('crop') || queryLower.includes('disease')) {
      recommendations.push(
        language === 'kannada' ? 'ಬೆಳೆ ಆರೋಗ್ಯವನ್ನು ನಿಗದಿತವಾಗಿ ಪರಿಶೀಲಿಸಿ' :
        language === 'hindi' ? 'फसल स्वास्थ्य की नियमित जांच करें' :
        'Regularly monitor crop health'
      );
    }
    
    if (queryLower.includes('price') || queryLower.includes('market')) {
      recommendations.push(
        language === 'kannada' ? 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳನ್ನು ನಿಗದಿತವಾಗಿ ಪರಿಶೀಲಿಸಿ' :
        language === 'hindi' ? 'बाजार की कीमतों की नियमित जांच करें' :
        'Regularly check market prices'
      );
    }
    
    if (queryLower.includes('scheme') || queryLower.includes('government')) {
      recommendations.push(
        language === 'kannada' ? 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಮಾಹಿತಿ ಪಡೆಯಿರಿ' :
        language === 'hindi' ? 'सरकारी योजनाओं के बारे में जानकारी प्राप्त करें' :
        'Stay informed about government schemes'
      );
    }
    
    return recommendations;
  }

  // Calculate data confidence
  static calculateDataConfidence(text, sentences) {
    if (!text || text.length < 100) return 0.3;
    if (sentences.length < 3) return 0.4;
    if (text.length > 500) return 0.8;
    return 0.6;
  }

  // Extract relevant data from scraped sources
  static extractRelevantData(scrapedData, query) {
    const relevantData = {};
    const queryWords = query.toLowerCase().split(/\s+/);
    
    Object.entries(scrapedData).forEach(([source, data]) => {
      Object.entries(data).forEach(([term, content]) => {
        if (queryWords.some(word => term.includes(word) || word.includes(term))) {
          relevantData[term] = {
            source,
            content: typeof content === 'string' ? content.substring(0, 200) : content,
            relevance: this.calculateRelevance(term, query)
          };
        }
      });
    });
    
    return relevantData;
  }

  // Calculate relevance between term and query
  static calculateRelevance(term, query) {
    const termWords = term.toLowerCase().split(/\s+/);
    const queryWords = query.toLowerCase().split(/\s+/);
    
    const matches = termWords.filter(tWord => 
      queryWords.some(qWord => tWord.includes(qWord) || qWord.includes(tWord))
    );
    
    return matches.length / Math.max(termWords.length, queryWords.length);
  }

  // Get default summary in specified language
  static getDefaultSummary(language) {
    const summaries = {
      english: 'Based on available data, I can provide general information and recommendations. For more specific details, please refine your query.',
      kannada: 'ಲಭ್ಯವಿರುವ ಡೇಟಾವನ್ನು ಆಧರಿಸಿ, ನಾನು ಸಾಮಾನ್ಯ ಮಾಹಿತಿ ಮತ್ತು ಶಿಫಾರಸುಗಳನ್ನು ನೀಡಬಹುದು. ಹೆಚ್ಚು ನಿರ್ದಿಷ್ಟ ವಿವರಗಳಿಗಾಗಿ, ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಸುಧಾರಿಸಿ.',
      hindi: 'उपलब्ध डेटा के आधार पर, मैं सामान्य जानकारी और सिफारिशें प्रदान कर सकता हूं। अधिक विशिष्ट विवरण के लिए, कृपया अपने प्रश्न को परिष्कृत करें।'
    };
    
    return summaries[language] || summaries.english;
  }

  // Fetch real-time market data
  static async fetchMarketData(commodity, location = '') {
    try {
      const searchTerm = `${commodity} price ${location}`.trim();
      const data = await this.fetchAndAnalyzeData(searchTerm);
      
      return {
        commodity,
        location,
        data: data.data,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Market data fetch error:', error);
      return {
        commodity,
        location,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Fetch agricultural news
  static async fetchAgriculturalNews(language = 'english') {
    try {
      const searchTerms = ['agriculture', 'farming', 'crop', 'farmer'];
      const newsData = {};
      
      for (const term of searchTerms) {
        const data = await this.fetchAndAnalyzeData(term, language);
        newsData[term] = data;
      }
      
      return {
        news: newsData,
        language,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Agricultural news fetch error:', error);
      return {
        news: {},
        language,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
} 