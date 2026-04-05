// Quiz Results Service
// Manages storage and retrieval of quiz results

const QuizResultsService = {
  api: null, // Will be set after ApiService is loaded
  
  // Initialize service
  init() {
    console.log('✓ Quiz Results service initialized');
  },
  
  // Save quiz result
  saveResult(quizData) {
    const results = this.getAllResults();
    
    const newResult = {
      id: this.generateId(),
      cmsId: quizData.cmsId,
      crewName: quizData.crewName,
      divisionId: quizData.divisionId,
      divisionName: quizData.divisionName,
      lobbyId: quizData.lobbyId,
      lobbyName: quizData.lobbyName,
      score: quizData.score,
      total: quizData.total,
      percentage: ((quizData.score / quizData.total) * 100).toFixed(1),
      category: quizData.category || 'mixed',
      answers: quizData.answers || [],
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-GB')
    };
    
    results.push(newResult);
    localStorage.setItem('quizResults', JSON.stringify(results));
    
    return newResult;
  },

  // Get all quiz results
  getAllResults() {
    const results = localStorage.getItem('quizResults');
    return results ? JSON.parse(results) : [];
  },

  // Get results by division (for Division Admin)
  getResultsByDivision(divisionId) {
    const allResults = this.getAllResults();
    return allResults.filter(result => result.divisionId === divisionId);
  },

  // Get results by lobby (for Lobby Admin)
  getResultsByLobby(lobbyId) {
    const allResults = this.getAllResults();
    return allResults.filter(result => result.lobbyId === lobbyId);
  },

  // Get results by crew CMS ID
  getResultsByCrew(cmsId) {
    const allResults = this.getAllResults();
    return allResults.filter(result => result.cmsId === cmsId);
  },

  // Get results filtered by user role
  async getResultsForUser(userRole, userData) {
    // First, get results from server API if available
    let serverResults = [];
    if (this.api) {
      try {
        const response = await this.api.getAllQuizResults(userRole, userData);
        if (response && response.success) {
          serverResults = response.results || [];
        }
      } catch (error) {
        console.error('Error fetching server quiz results:', error);
      }
    } else {
      console.warn('API service not available for quiz results');
    }
    
    // Then get local results
    const localResults = this.getAllResults();
    
    // Combine server and local results, prioritizing server results
    const allResults = [...serverResults, ...localResults];
    
    console.log('Filtering quiz results for role:', userRole, 'User data:', userData);
    console.log('All results (server + local):', allResults);
    
    switch(userRole) {
      case 'super':
      case 'superadmin':
        // Super Admin sees all results
        return allResults;
      
      case 'division':
      case 'divisionadmin':
        // Division Admin sees only their division's crew results
        const divResults = allResults.filter(result => 
          result.divisionId === userData.divisionId || 
          result.divisionId === userData.division
        );
        console.log('Division filtered results:', divResults);
        return divResults;
      
      case 'lobby':
      case 'lobbyadmin':
        // Lobby Admin sees only their lobby's crew results
        const lobbyResults = allResults.filter(result => 
          result.lobbyId === userData.lobbyId || 
          result.lobbyId === userData.hq
        );
        console.log('Lobby filtered results:', lobbyResults);
        return lobbyResults;
      
      case 'crew':
        // Crew sees only their own results
        return allResults.filter(result => 
          result.cmsId === userData.cmsId || 
          result.cmsId === userData.cms
        );
      
      default:
        console.warn('Unknown role:', userRole);
        return [];
    }
  },

  // Generate unique ID
  generateId() {
    return 'quiz_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  // Delete a result (admin only)
  async deleteResult(resultId) {
    const results = this.getAllResults();
    
    // Find the result to get CMS ID before deleting
    // It might be in local storage or just passed as an ID for server deletion
    let resultToDelete = results.find(r => r.id === resultId);
    
    console.log('Attempting to delete result:', resultId);
    
    // If we have API access, try to delete from server first
    if (this.api && resultId.toString().startsWith('server_')) {
      try {
        const response = await this.api.deleteQuizResult(resultId);
        if (response && response.success) {
           console.log('✅ Deleted from server:', resultId);
        } else {
           console.error('Failed to delete from server:', response);
           // If server delete fails, we might still want to remove from UI/local if it exists there
        }
      } catch (error) {
        console.error('Error deleting from server:', error);
      }
    }

    if (resultToDelete) {
      // Delete from QuizResults storage (Admin Panel)
      const filtered = results.filter(r => r.id !== resultId);
      localStorage.setItem('quizResults', JSON.stringify(filtered));
      console.log('Deleted from admin storage');
      
      // Also delete from crew profile storage (legacy format)
      const quizAttempts = Storage.load(APP_CONFIG.storage.quizAttempts, true) || {};
      const cmsId = resultToDelete.cmsId;
      
      console.log('Checking crew profile storage for CMS ID:', cmsId);
      console.log('All quiz attempts:', quizAttempts);
      
      if (quizAttempts[cmsId] && Array.isArray(quizAttempts[cmsId])) {
        console.log('Found attempts for crew:', quizAttempts[cmsId]);
        
        // Match by timestamp (within 2 seconds) and score and topic
        const resultTimestamp = new Date(resultToDelete.timestamp).getTime();
        const beforeCount = quizAttempts[cmsId].length;
        
        quizAttempts[cmsId] = quizAttempts[cmsId].filter(attempt => {
          const attemptTimestamp = new Date(attempt.date).getTime();
          const timeDiff = Math.abs(attemptTimestamp - resultTimestamp);
          const scoreMatch = attempt.score === resultToDelete.score;
          const topicMatch = attempt.topic === resultToDelete.category;
          
          console.log('Checking attempt:', {
            attemptDate: attempt.date,
            attemptScore: attempt.score,
            attemptTopic: attempt.topic,
            resultTimestamp: new Date(resultToDelete.timestamp).toISOString(),
            timeDiff: timeDiff,
            scoreMatch: scoreMatch,
            topicMatch: topicMatch
          });
          
          // Keep if it doesn't match (return true)
          // Remove if it matches (return false)
          const shouldKeep = !(timeDiff < 2000 && scoreMatch && topicMatch);
          return shouldKeep;
        });
        
        const afterCount = quizAttempts[cmsId].length;
        console.log(`Filtered crew attempts: ${beforeCount} -> ${afterCount}`);
        
        // Save updated attempts
        Storage.save(APP_CONFIG.storage.quizAttempts, quizAttempts);
        console.log('Saved updated crew profile storage');
      } else {
        console.log('No attempts found for this crew member');
      }
      
      console.log('✅ Quiz result deleted from both storages:', resultId);
      
      // Dispatch event for real-time UI updates
      window.dispatchEvent(new CustomEvent('quizResultDeleted', { detail: { id: resultId } }));
      
      return true;
    }
    
    // If it wasn't in local storage but we attempted server delete
    if (resultId.toString().startsWith('server_')) {
        return true;
    }
    
    console.log('❌ Result not found:', resultId);
    return false;
  },

  // Clear all results (super admin only)
  clearAllResults() {
    localStorage.removeItem('quizResults');
    return true;
  },

  // Get statistics
  getStatistics(results) {
    if (!results || results.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passRate: 0
      };
    }

    const scores = results.map(r => parseFloat(r.percentage));
    const passThreshold = 60;
    const passed = scores.filter(s => s >= passThreshold).length;

    return {
      totalAttempts: results.length,
      averageScore: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1),
      highestScore: Math.max(...scores).toFixed(1),
      lowestScore: Math.min(...scores).toFixed(1),
      passRate: ((passed / results.length) * 100).toFixed(1)
    };
  },

  // Export results to CSV
  exportToCSV(results) {
    if (!results || results.length === 0) return '';

    const headers = ['S.No', 'CMS ID', 'Name', 'Division', 'Lobby', 'Score', 'Total', 'Percentage', 'Date'];
    const rows = results.map((result, index) => [
      index + 1,
      result.cmsId,
      result.crewName,
      result.divisionName,
      result.lobbyName,
      result.score,
      result.total,
      result.percentage + '%',
      result.date
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  },

  // Download CSV
  downloadCSV(results, filename = 'quiz_results.csv') {
    const csvContent = this.exportToCSV(results);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Export results to PDF
  exportToPDF(results, title = 'Quiz Results Report') {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
      console.error('jsPDF library not loaded');
      return false;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Add header
    doc.setFontSize(18);
    doc.setTextColor(13, 71, 161);
    doc.text(title, pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: 'center' });
    
    // Statistics
    const stats = this.getStatistics(results);
    doc.setFontSize(11);
    doc.setTextColor(0);
    let yPos = 40;
    doc.text(`Total Attempts: ${stats.totalAttempts}`, 14, yPos);
    doc.text(`Average Score: ${stats.averageScore}%`, 70, yPos);
    doc.text(`Pass Rate: ${stats.passRate}%`, 130, yPos);
    
    // Prepare table data
    const tableData = results.map((result, index) => [
      index + 1,
      result.cmsId,
      result.crewName,
      result.divisionName,
      result.lobbyName,
      result.score,
      result.total,
      result.percentage + '%',
      result.date
    ]);
    
    // Add table
    doc.autoTable({
      startY: yPos + 8,
      head: [['S.No', 'CMS ID', 'Name', 'Division', 'Lobby', 'Score', 'Total', '%', 'Date']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [13, 71, 161],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8
      },
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 22 },
        2: { cellWidth: 35 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 15 },
        6: { cellWidth: 15 },
        7: { cellWidth: 18 },
        8: { cellWidth: 25 }
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 10 }
    });
    
    return doc;
  },

  // Download PDF
  downloadPDF(results, filename = 'quiz_results.pdf') {
    const doc = this.exportToPDF(results);
    if (doc) {
      doc.save(filename);
      return true;
    }
    return false;
  }
};

// Make globally available
window.QuizResultsService = QuizResultsService;
