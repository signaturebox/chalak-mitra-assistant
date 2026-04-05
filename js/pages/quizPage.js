// Quiz Page
const QuizPage = {
  render(container) {
    container.innerHTML = `
      <div class="page active">
        <div class="page-header">
          <div class="page-title">CLI Counseling & Quiz</div>
          <div class="muted">10 questions • Pass ≥ 6 → Certificate</div>
        </div>

        <div class="card">
          <div class="card-title">Crew Details</div>
          <div class="quiz-details-form">
            <input id="crewName" type="text" placeholder="Name" />
            <input id="crewCMS" type="text" placeholder="CMS ID" />
            <select id="crewDivision">
              <option value="jaipur">JAIPUR</option>
              <option value="ajmer">AJMER</option>
              <option value="jodhpur">JODHPUR</option>
              <option value="bikaner">BIKANER</option>
            </select>
            <input id="crewLobby" type="text" placeholder="HQ / Lobby" />
            <select id="quizTopic">
              <option value="mixed">Mixed Topics</option>
              <option value="spad">SPAD</option>
              <option value="rhs">RHS</option>
              <option value="loco">Locomotive</option>
              <option value="automatic-signaling">Automatic Signaling</option>
              <option value="modified-signaling">Modified Signaling</option>
              <option value="absolute-block">Absolute Block</option>
            </select>
          </div>
          <div class="quiz-actions">
            <button id="btnStartQuiz" class="btn-sm btn-primary">Start Quiz</button>
          </div>
        </div>

        <div id="quizContainer"></div>

        <div id="quizSummary" class="card">
          <div class="page-header">
            <div class="card-title">Result Summary</div>
            <div id="summaryRole" class="muted">Crew View</div>
          </div>
          <div class="quiz-summary-info">
            <div class="muted">Division: <span id="summaryDivision">—</span></div>
            <div class="muted">HQ/Lobby: <span id="summaryLobby">—</span></div>
            <div class="muted">Topic: <span id="summaryTopic">—</span></div>
            <div class="muted">Score: <span id="summaryScore">0/0</span></div>
            <div class="muted">Status: <span id="summaryStatus">Not attempted</span></div>
          </div>
          <div style="margin-top: 12px;">
            <button id="btnPrintResult" class="btn-sm">Print Result</button>
          </div>
        </div>
      </div>
    `;
    
    // Auto-fill crew details
    setTimeout(async () => {
      // Ensure QuizService is available
      let attempts = 0;
      while (attempts < 20 && typeof QuizService === 'undefined') {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (typeof QuizService !== 'undefined' && QuizService.autofillCrewDetails) {
        QuizService.autofillCrewDetails();
      } else {
        console.warn('QuizService not available for auto-fill');
      }
      
      // Start quiz handler
      const btnStart = document.getElementById('btnStartQuiz');
      if (btnStart) {
        btnStart.addEventListener('click', async () => {
          const crewData = {
            name: document.getElementById('crewName').value.trim(),
            cms: document.getElementById('crewCMS').value.trim(),
            division: document.getElementById('crewDivision').value,
            lobby: document.getElementById('crewLobby').value.trim(),
            topic: document.getElementById('quizTopic').value
          };
          
          const quiz = await QuizService.startQuiz(crewData);
          if (quiz) {
            this.renderQuiz(quiz);
          } else {
            console.error('Failed to start quiz');
            showNotification('❌ Failed to start quiz. Please try again.', 'error');
          }
        });
      }
      
      // Print handler
      const btnPrint = document.getElementById('btnPrintResult');
      if (btnPrint) {
        btnPrint.addEventListener('click', () => {
          window.print();
        });
      }
    }, 100);
  },
  
  renderQuiz(quiz) {
    const container = document.getElementById('quizContainer');
    if (!container) return;
    
    if (!quiz || !quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
      console.error('Invalid quiz data:', quiz);
      container.innerHTML = '<div class="error-message">❌ Failed to load quiz questions. Please try again.</div>';
      showNotification('❌ Failed to load quiz questions. Please try again.', 'error');
      return;
    }
    
    container.innerHTML = `
      <div class="card">
        <div class="card-title">Quiz for ${quiz.name} (${quiz.cms})</div>
        <div class="muted">${(quiz.division || 'N/A').toString().toUpperCase()} • ${quiz.topic}</div>
      </div>
    `;
    
    quiz.questions.forEach((q, index) => {
      if (!q || !q.question) {
        console.warn('Invalid question found:', q);
        return; // Skip invalid questions
      }
      
      const qDiv = document.createElement('div');
      qDiv.className = 'quiz-question';
      
      const options = (q.options || []).map((opt, optIndex) => `
        <label class="quiz-option">
          <input type="radio" name="q${index}" value="${optIndex}" />
          ${opt || `Option ${optIndex + 1}`}
        </label>
      `).join('');
      
      qDiv.innerHTML = `
        <div class="quiz-question-title">Q${index + 1}. ${q.question}</div>
        ${options}
      `;
      
      container.appendChild(qDiv);
    });
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'card';
    actionsDiv.innerHTML = `
      <button id="submitQuiz" class="btn-sm btn-primary">Submit Quiz</button>
      <button id="resetQuiz" class="btn-sm">Reset Answers</button>
    `;
    container.appendChild(actionsDiv);
    
    // Attach handlers
    setTimeout(() => {
      document.getElementById('submitQuiz').addEventListener('click', async () => {
        // Collect answers
        let answeredCount = 0;
        const totalQuestions = quiz.questions.length;
        
        if (quiz.questions && Array.isArray(quiz.questions)) {
          quiz.questions.forEach((q, index) => {
            const selected = document.querySelector(`input[name="q${index}"]:checked`);
            if (selected) {
              quiz.answers[index] = Number(selected.value);
              answeredCount++;
            }
          });
        } else {
          console.error('Quiz questions not available for answer collection');
          return;
        }
        
        // Validate that all questions are answered
        if (answeredCount < totalQuestions) {
            showNotification(`⚠️ Please answer all ${totalQuestions} questions before submitting. You answered ${answeredCount}.`, 'warning');
            return;
        }
        
        const result = await QuizService.submitQuiz();
        if (result) {
          this.updateSummary(quiz, result);
          
          // Clear quiz questions immediately
          const quizContainer = document.getElementById('quizContainer');
          if (quizContainer) {
              quizContainer.innerHTML = '';
              quizContainer.style.display = 'none';
          }
          
          // Show Result Popup
          const message = result.passed 
            ? `Score: ${result.score}/10. Well done you pass quiz` 
            : `Score: ${result.score}/10. Please review and retry`;
            
          const popupHTML = `
            <div class="modal-overlay show" id="quizResultModal" style="z-index: 9999;">
              <div class="modal-card" style="text-align: center; padding: 30px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <div style="font-size: 48px; margin-bottom: 16px;">${result.passed ? '🏆' : '📚'}</div>
                <h2 style="margin-bottom: 12px; color: ${result.passed ? '#10b981' : '#f59e0b'};">${result.passed ? 'Quiz Passed!' : 'Quiz Completed'}</h2>
                <div style="font-size: 18px; margin-bottom: 24px; color: #374151; font-weight: 500;">
                  ${message}
                </div>
                <button class="btn-modern btn-primary" id="btnResultAction" style="width: 100%; justify-content: center;">
                  ${result.passed ? 'Claim Certificate' : 'Try Again'}
                </button>
              </div>
            </div>
          `;
          document.body.insertAdjacentHTML('beforeend', popupHTML);
          
          // Handle button click based on result
          document.getElementById('btnResultAction').addEventListener('click', () => {
            const modal = document.getElementById('quizResultModal');
            if (modal) modal.remove();
            
            if (result.passed) {
              // Generate certificate
              if (typeof CertificateService !== 'undefined' && CertificateService.generateCertificate) {
                CertificateService.generateCertificate({
                  name: quiz.name,
                  cms: quiz.cms,
                  division: quiz.division,
                  lobby: quiz.lobby,
                  score: result.score,
                  date: new Date().toISOString()
                });
              }
              // Reset quiz view
              QuizPage.render(document.getElementById('mainContent'));
            } else {
              // Try again - just reset the quiz view
              QuizPage.render(document.getElementById('mainContent'));
            }
          });
          
          // Save quiz result to database
          try {
            const currentUser = AuthService.getUser();
            
            // Determine division and lobby IDs based on user role
            let divisionId, divisionName, lobbyId, lobbyName;
            
            if (currentUser.role === 'crew') {
              // For crew, use their profile data
              divisionId = quiz.division || currentUser.division || 'jaipur';
              divisionName = (quiz.division || currentUser.division || 'jaipur').toUpperCase();
              lobbyId = quiz.lobby || currentUser.hq || '';
              lobbyName = quiz.lobby || currentUser.hq || '';
            } else {
              // For admins, use their admin data
              divisionId = currentUser.divisionId || currentUser.division || quiz.division || 'jaipur';
              divisionName = currentUser.divisionName || (currentUser.division || quiz.division || 'jaipur').toUpperCase();
              lobbyId = currentUser.lobbyId || currentUser.hq || quiz.lobby || '';
              lobbyName = currentUser.lobbyName || currentUser.hq || quiz.lobby || '';
            }
            
            const quizResultData = {
              cmsId: quiz.cms,
              crewName: quiz.name,
              divisionId: divisionId,
              divisionName: divisionName,
              lobbyId: lobbyId,
              lobbyName: lobbyName,
              score: result.score,
              total: 10,
              category: quiz.topic,
              answers: quiz.answers
            };
            
            console.log('Saving quiz result:', quizResultData);
            
            // Save to QuizResultsService (for admin panel)
            if (typeof QuizResultsService !== 'undefined' && QuizResultsService.saveResult) {
              QuizResultsService.saveResult(quizResultData);
              console.log('Quiz result saved to QuizResultsService');
            } else {
              console.warn('QuizResultsService not available');
            }
            
            // Also save to legacy format (for crew profile)
            const quizAttempts = Storage.load(APP_CONFIG.storage.quizAttempts, true) || {};
            if (!quizAttempts[quiz.cms]) {
              quizAttempts[quiz.cms] = [];
            }
            quizAttempts[quiz.cms].push({
              score: result.score,
              total: 10,
              topic: quiz.topic,
              date: new Date().toISOString(),
              answers: quiz.answers
            });
            Storage.save(APP_CONFIG.storage.quizAttempts, quizAttempts);
            console.log('Quiz result saved to profile storage');
            
            // Additionally, send to API if available
            // Note: QuizService.submitQuiz() already sends data to API, so we don't need to do it again here.
            // Keeping this block only for logging purposes or fallback if needed, but commenting out the duplicate call.
            /*
            if (QuizService.api) {
              QuizService.api.submitQuiz({
                user_id: currentUser.id,
                quiz_topic: quiz.topic,
                total_questions: quiz.questions.length,
                correct_answers: result.score,
                quiz_data: {
                  questions: quiz.questions,
                  answers: quiz.answers
                },
                cms_id: quiz.cms,
                crew_name: quiz.name,
                division: quiz.division,
                lobby: quiz.lobby
              }).catch(apiError => {
                console.error('Failed to save quiz result to API:', apiError);
              });
            }
            */
          } catch (error) {
            console.error('Failed to save quiz result:', error);
          }
          
          if (result.passed) {
            // Removed notification as per request
            
            // Generate certificate
            try {
              // Certificate generation is now handled by the popup button
            } catch (error) {
              console.error('Failed to generate certificate:', error);
            }
          } else {
            // Removed notification as per request
          }
        }
      });
      
      document.getElementById('resetQuiz').addEventListener('click', () => {
        document.querySelectorAll('#quizContainer input[type="radio"]').forEach(r => r.checked = false);
      });
    }, 100);
  },
  
  updateSummary(quiz, result) {
    document.getElementById('summaryDivision').textContent = (quiz.division || 'N/A').toString().toUpperCase();
    document.getElementById('summaryLobby').textContent = quiz.lobby || '—';
    document.getElementById('summaryTopic').textContent = quiz.topic || '—';
    document.getElementById('summaryScore').textContent = `${result.score}/10`;
    document.getElementById('summaryStatus').textContent = result.passed ? '✅ PASS' : '❌ REVIEW REQUIRED';
  }
};
