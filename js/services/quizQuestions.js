// Quiz Questions Management Service
// Handles adding, editing, deleting, and bulk uploading quiz questions

const QuizQuestionsService = {
  api: null, // Will be set after ApiService is loaded
  
  // Initialize service
  init() {
    console.log('✓ Quiz Questions service initialized');
  },
  
  // Get all quiz questions
  async getQuestions(category = '') {
    try {
      // Check if API is available
      if (!this.api) {
        console.warn('API service not available for quiz questions');
        return [];
      }
      
      const response = await this.api.getQuizQuestionsList(category);
      if (response && response.success) {
        return response.questions || [];
      } else {
        console.error('Failed to get questions:', response ? response.error : 'No response');
        showNotification('❌ Failed to load questions: ' + (response ? response.error : 'Unknown error'), 'error');
        return [];
      }
    } catch (error) {
      console.error('Error getting questions:', error);
      showNotification('❌ Error loading questions: ' + error.message, 'error');
      return [];
    }
  },
  
  // Get question stats
  async getStats() {
    try {
      // Check if API is available
      if (!this.api) {
        return null;
      }
      
      const response = await this.api.getQuizQuestionStats();
      if (response && response.success) {
        return response.stats || {};
      } else {
        console.error('Failed to get stats:', response ? response.error : 'No response');
        return {};
      }
    } catch (error) {
      console.error('Error getting stats:', error);
      return {};
    }
  },

  // Add a new question
  async addQuestion(questionData) {
    try {
      const response = await this.api.addQuizQuestion(questionData);
      if (response.success) {
        showNotification('✅ Question added successfully', 'success');
        return response;
      } else {
        console.error('Failed to add question:', response.error);
        showNotification('❌ Failed to add question: ' + response.error, 'error');
        return response;
      }
    } catch (error) {
      console.error('Error adding question:', error);
      showNotification('❌ Error adding question: ' + error.message, 'error');
      return null;
    }
  },
  
  // Update an existing question
  async updateQuestion(questionData) {
    try {
      const response = await this.api.updateQuizQuestion(questionData);
      if (response.success) {
        showNotification('✅ Question updated successfully', 'success');
        return response;
      } else {
        console.error('Failed to update question:', response.error);
        showNotification('❌ Failed to update question: ' + response.error, 'error');
        return response;
      }
    } catch (error) {
      console.error('Error updating question:', error);
      showNotification('❌ Error updating question: ' + error.message, 'error');
      return null;
    }
  },
  
  // Delete a question
  async deleteQuestion(questionId) {
    try {
      const response = await this.api.deleteQuizQuestion(questionId);
      if (response.success) {
        showNotification('✅ Question deleted successfully', 'success');
        return response;
      } else {
        console.error('Failed to delete question:', response.error);
        showNotification('❌ Failed to delete question: ' + response.error, 'error');
        return response;
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      showNotification('❌ Error deleting question: ' + error.message, 'error');
      return null;
    }
  },
  
  // Bulk upload questions
  async bulkUploadQuestions(questions) {
    try {
      const response = await this.api.bulkUploadQuizQuestions(questions);
      if (response.success) {
        showNotification(`✅ Bulk upload completed. Added: ${response.added_count}, Failed: ${response.failed_count}`, 'success');
        return response;
      } else {
        console.error('Failed to bulk upload questions:', response.error);
        showNotification('❌ Failed to bulk upload questions: ' + response.error, 'error');
        return response;
      }
    } catch (error) {
      console.error('Error bulk uploading questions:', error);
      showNotification('❌ Error bulk uploading questions: ' + error.message, 'error');
      return null;
    }
  },
  
  // Get questions by category
  async getQuestionsByCategory(category) {
    return await this.getQuestions(category);
  },
  
  // Export questions template for bulk upload
  exportQuestionsTemplate() {
    const template = [
      {
        category: 'mixed', // Options: mixed, spad, rhs, loco, automatic-signaling, modified-signaling, absolute-block
        question: 'Your question text here?',
        option_1: 'Option 1',
        option_2: 'Option 2', 
        option_3: 'Option 3',
        option_4: 'Option 4',
        correct_answer: 0, // 0-3 representing the correct option index
        is_active: 1 // 1 for active, 0 for inactive
      },
      {
        category: 'spad',
        question: 'Another sample question?',
        option_1: 'Answer 1',
        option_2: 'Answer 2',
        option_3: 'Answer 3', 
        option_4: 'Answer 4',
        correct_answer: 2,
        is_active: 1
      }
    ];
    
    // Create and download the template file
    const dataStr = JSON.stringify(template, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'quiz_questions_template.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('📥 Questions template downloaded successfully', 'success');
  }
};

// Make globally available
window.QuizQuestionsService = QuizQuestionsService;