// Quiz Service
const QuizService = {
  api: null, // Will be set after ApiService is loaded
  currentQuiz: null,
  
  // Initialize service
  init() {
    console.log('✓ Quiz service initialized');
  },
  
  // Start quiz
  async startQuiz(crewData) {
    if (!crewData.name || !crewData.cms) {
      if (!confirm('⚠️ Name or CMS ID is missing. Continue anyway?')) {
        return null;
      }
    }
    
    if (!this.api || !this.api.getQuizQuestions) {
      console.error('API service not available for quiz questions');
      showNotification('❌ API service not available for quiz questions. Please try again later.', 'error');
      return null;
    }
    
    try {
      // Get questions from API
      const response = await this.api.getQuizQuestions(crewData.topic, APP_CONFIG.quiz.questionsPerQuiz);
      
      if (response && response.success && response.questions && Array.isArray(response.questions) && response.questions.length > 0) {
        this.currentQuiz = {
          ...crewData,  // Include all crew data (name, cms, division, lobby, topic)
          questions: response.questions,
          answers: new Array(response.questions.length).fill(null),
          submitted: false
        };
        
        return this.currentQuiz;
      } else {
        console.error('Failed to load quiz questions:', response);
        showNotification('❌ Failed to load quiz questions' + (response && response.message ? ': ' + response.message : ''), 'error');
        return null;
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      showNotification('❌ Error loading quiz: ' + error.message, 'error');
      return null;
    }
  },
  
  // Submit quiz
  async submitQuiz() {
    if (!this.currentQuiz || !this.currentQuiz.questions || !Array.isArray(this.currentQuiz.questions)) return null;
    
    let score = 0;
    if (this.currentQuiz.questions && Array.isArray(this.currentQuiz.questions) && this.currentQuiz.answers && Array.isArray(this.currentQuiz.answers)) {
      this.currentQuiz.questions.forEach((q, index) => {
        if (q && this.currentQuiz.answers[index] !== null && this.currentQuiz.answers[index] !== undefined && q.correct_answer !== undefined) {
          if (this.currentQuiz.answers[index] === q.correct_answer) {
            score++;
          }
        }
      });
    } else {
      console.error('Quiz questions or answers not available for scoring');
      return null;
    }
    
    try {
      // Submit quiz to API
      const quizData = {
        user_id: AuthService.getUser().id || 1, // Use actual user ID when available
        quiz_topic: this.currentQuiz.topic,
        total_questions: this.currentQuiz.questions.length,
        correct_answers: score,
        quiz_data: {
          questions: this.currentQuiz.questions,
          answers: this.currentQuiz.answers
        }
      };
      
      const response = await this.api.submitQuiz({
        user_id: AuthService.getUser().id || 1, // Use actual user ID when available
        quiz_topic: this.currentQuiz.topic,
        total_questions: this.currentQuiz.questions.length,
        correct_answers: score,
        quiz_data: {
          questions: this.currentQuiz.questions,
          answers: this.currentQuiz.answers
        },
        // Include crew details for proper recording
        cms_id: this.currentQuiz.cms,
        crew_name: this.currentQuiz.name,
        division: this.currentQuiz.division,
        lobby: this.currentQuiz.lobby
      });
      
      this.currentQuiz.submitted = true;
      this.currentQuiz.score = score;
      this.currentQuiz.passed = response.is_passed;
      
      if (response.certificate_id) {
        this.currentQuiz.certificateId = response.certificate_id;
      }
      
      return {
        score,
        total: this.currentQuiz.questions.length,
        passed: this.currentQuiz.passed,
        certificateId: response.certificate_id
      };
    } catch (error) {
      console.error('Error submitting quiz:', error);
      showNotification('❌ Error submitting quiz: ' + error.message, 'error');
      return null;
    }
  },
  
  // Get current quiz
  getCurrentQuiz() {
    return this.currentQuiz;
  },
  
  // Auto-fill crew details
  autofillCrewDetails() {
    const user = AuthService.getUser();
    
    const nameEl = document.getElementById('crewName');
    const cmsEl = document.getElementById('crewCMS');
    const divEl = document.getElementById('crewDivision');
    const lobbyEl = document.getElementById('crewLobby');
    
    if (!nameEl || !cmsEl || !divEl || !lobbyEl) return;
    
    if (user && user.role === 'crew') {
      nameEl.value = user.name || '';
      cmsEl.value = user.cms || '';
      divEl.value = user.division || 'jaipur';
      lobbyEl.value = user.hq || user.lobby || '';
      
      // Make readonly for crew
      nameEl.setAttribute('readonly', true);
      cmsEl.setAttribute('readonly', true);
      lobbyEl.setAttribute('readonly', true);
      divEl.setAttribute('disabled', true);
      
      nameEl.style.background = '#f1f5f9';
      cmsEl.style.background = '#f1f5f9';
      lobbyEl.style.background = '#f1f5f9';
      divEl.style.background = '#f1f5f9';
    } else {
      // Allow editing for admins
      nameEl.removeAttribute('readonly');
      cmsEl.removeAttribute('readonly');
      lobbyEl.removeAttribute('readonly');
      divEl.removeAttribute('disabled');
      
      nameEl.style.background = '';
      cmsEl.style.background = '';
      lobbyEl.style.background = '';
      divEl.style.background = '';
    }
  }
};

// Make globally available
window.QuizService = QuizService;
