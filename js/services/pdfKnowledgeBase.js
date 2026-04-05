// PDF Knowledge Base Loader
// Extracts text from PDFs for searching

const PDFKnowledgeBase = {
  // PDF.js library reference
  pdfjsLib: null,
  
  // Loaded documents cache
  loadedDocs: {},
  
  // Text index for searching
  textIndex: {},
  
  // Configuration
  config: {
    maxPagesToExtract: 50,
    chunkSize: 1000,
    overlapSize: 200
  },

  // Initialize PDF.js
  async init() {
    // Load PDF.js from CDN if not already loaded
    if (typeof pdfjsLib === 'undefined') {
      await this.loadPDFJS();
    }
    this.pdfjsLib = window.pdfjsLib;
    if (this.pdfjsLib) {
      this.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
    console.log('[PDFKnowledgeBase] Initialized');
  },

  // Load PDF.js library dynamically
  loadPDFJS() {
    return new Promise((resolve, reject) => {
      if (window.pdfjsLib) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        console.log('[PDFKnowledgeBase] PDF.js loaded');
        resolve();
      };
      script.onerror = () => {
        console.error('[PDFKnowledgeBase] Failed to load PDF.js');
        reject(new Error('Failed to load PDF.js'));
      };
      document.head.appendChild(script);
    });
  },

  // Load a PDF from URL
  async loadPDF(url, name = null) {
    if (!this.pdfjsLib) {
      await this.init();
    }

    const docName = name || url.split('/').pop();
    
    try {
      console.log(`[PDFKnowledgeBase] Loading: ${url}`);
      const loadingTask = this.pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      
      const textContent = [];
      const numPages = Math.min(pdf.numPages, this.config.maxPagesToExtract);
      
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ');
        textContent.push({
          page: i,
          text: pageText
        });
      }

      this.loadedDocs[docName] = {
        url,
        pages: textContent,
        loadedAt: new Date().toISOString()
      };

      // Index the text for searching
      this.indexDocument(docName, textContent);
      
      console.log(`[PDFKnowledgeBase] Loaded: ${docName} (${numPages} pages)`);
      return { success: true, name: docName, pages: numPages };
    } catch (error) {
      console.error(`[PDFKnowledgeBase] Error loading ${url}:`, error);
      return { success: false, error: error.message };
    }
  },

  // Load PDF from ArrayBuffer (for uploaded files)
  async loadPDFFromArrayBuffer(arrayBuffer, name) {
    if (!this.pdfjsLib) {
      await this.init();
    }

    try {
      const loadingTask = this.pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      const textContent = [];
      const numPages = Math.min(pdf.numPages, this.config.maxPagesToExtract);
      
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ');
        textContent.push({
          page: i,
          text: pageText
        });
      }

      this.loadedDocs[name] = {
        pages: textContent,
        loadedAt: new Date().toISOString()
      };

      this.indexDocument(name, textContent);
      
      console.log(`[PDFKnowledgeBase] Loaded from buffer: ${name} (${numPages} pages)`);
      return { success: true, name, pages: numPages };
    } catch (error) {
      console.error(`[PDFKnowledgeBase] Error loading buffer:`, error);
      return { success: false, error: error.message };
    }
  },

  // Index document text for searching
  indexDocument(docName, pages) {
    const chunks = [];
    
    pages.forEach(pageData => {
      const text = pageData.text;
      // Create overlapping chunks
      for (let i = 0; i < text.length; i += this.config.chunkSize - this.config.overlapSize) {
        const chunk = text.substring(i, i + this.config.chunkSize);
        if (chunk.trim().length > 50) {
          chunks.push({
            docName,
            page: pageData.page,
            text: chunk,
            startIndex: i
          });
        }
      }
    });

    this.textIndex[docName] = chunks;
  },

  // Search across all loaded documents
  search(query, options = {}) {
    const results = [];
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
    
    const maxResults = options.maxResults || 10;
    const fuzzyMatch = options.fuzzyMatch !== false;

    for (const [docName, chunks] of Object.entries(this.textIndex)) {
      for (const chunk of chunks) {
        const chunkLower = chunk.text.toLowerCase();
        
        // Calculate relevance score
        let score = 0;
        
        // Exact phrase match
        if (chunkLower.includes(queryLower)) {
          score += 10;
        }
        
        // Word matches
        for (const word of queryWords) {
          if (chunkLower.includes(word)) {
            score += 2;
          }
        }

        if (score > 0) {
          results.push({
            docName,
            page: chunk.page,
            text: chunk.text,
            score,
            excerpt: this.extractExcerpt(chunk.text, queryLower, 200)
          });
        }
      }
    }

    // Sort by score and return top results
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, maxResults);
  },

  // Extract excerpt around search term
  extractExcerpt(text, query, length = 200) {
    const textLower = text.toLowerCase();
    const index = textLower.indexOf(query);
    
    if (index === -1) {
      return text.substring(0, length) + '...';
    }
    
    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + length);
    
    let excerpt = text.substring(start, end);
    if (start > 0) excerpt = '...' + excerpt;
    if (end < text.length) excerpt = excerpt + '...';
    
    return excerpt;
  },

  // Get list of loaded documents
  getLoadedDocuments() {
    return Object.keys(this.loadedDocs).map(name => ({
      name,
      pages: this.loadedDocs[name].pages?.length || 0,
      loadedAt: this.loadedDocs[name].loadedAt
    }));
  },

  // Clear all loaded documents
  clearAll() {
    this.loadedDocs = {};
    this.textIndex = {};
  },

  // Export text for a document
  exportText(docName) {
    const doc = this.loadedDocs[docName];
    if (!doc) return null;
    
    return doc.pages.map(p => `--- Page ${p.page} ---\n${p.text}`).join('\n\n');
  },

  // Get statistics
  getStats() {
    const docs = Object.keys(this.loadedDocs).length;
    let totalPages = 0;
    let totalChunks = 0;
    
    for (const doc of Object.values(this.loadedDocs)) {
      totalPages += doc.pages?.length || 0;
    }
    
    for (const chunks of Object.values(this.textIndex)) {
      totalChunks += chunks.length;
    }
    
    return { documents: docs, totalPages, totalChunks };
  }
};

// Railway Manual Loader - Pre-configured PDF sources
const RailwayManualLoader = {
  // Default PDF sources (relative to project)
  defaultSources: [
    { name: 'SS01-Main-Power', path: './uploads/SS01.pdf', category: 'TSD' },
    { name: 'SS02-Traction-Bogie-1', path: './uploads/SS02.pdf', category: 'TSD' },
    { name: 'SS03-Traction-Bogie-2', path: './uploads/SS03.pdf', category: 'TSD' },
    { name: 'TSD-WAG9-Series', path: './uploads/three phase 9000 series wag9.pdf', category: 'Manual' },
    { name: 'Troubleshooting-Guide', path: './uploads/Trouble shooting guide WAG9x and WAP7x CCU.pdf', category: 'Manual' },
    { name: 'WAG12-Manual', path: './uploads/WAG 12 DATA.pdf', category: 'Manual' },
    { name: 'Vande-Bharat-T18', path: './uploads/Vande Bharat - Book - T-18 - 2025.pdf', category: 'Manual' },
    { name: '3-Phase-General', path: './uploads/3 phase general guidance.pdf', category: 'Guide' },
    { name: 'Traffic-Book', path: './uploads/traffic Book 2019 (1).pdf', category: 'Rules' },

    // Locomotive manuals under uploads/locomotive
    { name: '3PHASE-TSD', path: './uploads/locomotive/3 PHASE LOCO TSD.pdf', category: 'TSD' },
    { name: '3PHASE-TSD-BRC', path: './uploads/locomotive/3 phase TSD brc.pdf', category: 'TSD' },
    { name: '3PHASE-Memo', path: './uploads/locomotive/3 phase memo.pdf', category: 'Guide' },
    { name: '3PHASE-Loco-Book', path: './uploads/locomotive/3 Phase Locomotive Book.pdf', category: 'Manual' },
    { name: 'Vande-Bharat-T18-2025', path: './uploads/locomotive/Vande Bharat - Book - T-18  - 2025 - 17 x 23 cm.pdf', category: 'Manual' },
    { name: 'Pocket-Book-WAG12-Hindi', path: './uploads/locomotive/Pocket Book WAG12 - Hindi.pdf', category: 'Manual' },
    { name: 'RB-Auto-Flasher', path: './uploads/locomotive/RB,Auto flasher.pdf', category: 'Rules' },
    { name: '3PHASE-TSD-Updated-2023', path: './uploads/locomotive/3 phase TSD manual updated July 2023.pdf', category: 'TSD' },
    { name: 'Diesel-TroubleShooting-Guide', path: './uploads/locomotive/DIESEL LOCO TROUBLE SHOOTING GUIDE.pdf', category: 'Manual' },
    { name: 'Conventional-TSD', path: './uploads/locomotive/conventional TSD Book.pdf', category: 'Manual' },
    { name: 'Conventional-TSD-1', path: './uploads/locomotive/conventional TSD Book 1.pdf', category: 'Manual' },
    { name: 'Amrit-Bharat-Hindi', path: './uploads/locomotive/Amrit Bharat hindi - Final.pdf', category: 'Guide' },
    { name: 'Traffic-Book-2019-Loco', path: './uploads/locomotive/traffic Book 2019 (1).pdf', category: 'Rules' }
  ],

  loadedCategories: {},

  // Initialize and load default sources
  async init(sources = null) {
    const sourcesToLoad = sources || this.defaultSources;
    const results = [];

    for (const source of sourcesToLoad) {
      try {
        const result = await PDFKnowledgeBase.loadPDF(source.path, source.name);
        if (result.success) {
          this.loadedCategories[source.category] = this.loadedCategories[source.category] || [];
          this.loadedCategories[source.category].push(source.name);
          results.push(result);
        }
      } catch (error) {
        console.warn(`[RailwayManualLoader] Could not load ${source.name}:`, error);
      }
    }

    console.log(`[RailwayManualLoader] Loaded ${results.length} documents`);
    return results;
  },

  // Search within a category
  searchInCategory(query, category, options = {}) {
    const allResults = PDFKnowledgeBase.search(query, { maxResults: 50, ...options });
    return allResults.filter(r => this.loadedCategories[category]?.includes(r.docName));
  },

  // Get available categories
  getCategories() {
    return Object.keys(this.loadedCategories).map(cat => ({
      name: cat,
      documents: this.loadedCategories[cat]
    }));
  }
};

// Export
window.PDFKnowledgeBase = PDFKnowledgeBase;
window.RailwayManualLoader = RailwayManualLoader;
