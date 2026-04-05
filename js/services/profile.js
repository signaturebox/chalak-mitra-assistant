// Profile Service
const ProfileService = {
  
  // Open profile modal
  openProfile() {
    const user = AuthService.getUser();
    
    if (!user || !user.cms) {
      showNotification('⚠️ Please login to view profile', 'warning');
      return;
    }
    
    // Load profile data
    this.loadProfileInfo(user);
    this.loadQuizHistory(user);
    this.loadMyTickets(user);
    
    // Show modal
    document.getElementById('profileModal').classList.add('show');
  },
  
  // Close profile modal
  closeProfile() {
    document.getElementById('profileModal').classList.remove('show');
  },
  
  // Switch tabs
  switchTab(tab) {
    // Update tab buttons
    ['info', 'quiz', 'settings', 'support'].forEach(t => {
      const tabBtn = document.getElementById(`profile${t.charAt(0).toUpperCase() + t.slice(1)}Tab`);
      const content = document.getElementById(`profile${t.charAt(0).toUpperCase() + t.slice(1)}Content`);
      
      if (t === tab) {
        tabBtn.classList.add('active');
        content.style.display = 'block';
      } else {
        tabBtn.classList.remove('active');
        content.style.display = 'none';
      }
    });
  },
  
  // Load profile info
  loadProfileInfo(user) {
    document.getElementById('profileName').textContent = user.name || 'Crew Member';
    document.getElementById('profileCms').textContent = user.cms || '-';
    
    document.getElementById('infoCms').textContent = user.cms || '-';
    document.getElementById('infoName').textContent = user.name || '-';
    document.getElementById('infoEmail').textContent = user.email || 'Not provided';
    document.getElementById('infoMobile').textContent = user.mobile || '-';
    document.getElementById('infoDesignation').textContent = user.designation || '-';
    document.getElementById('infoDivision').textContent = user.division?.toUpperCase() || '-';
    document.getElementById('infoLobby').textContent = user.hq || '-';
  },
  
  // Enable profile editing
  enableEdit() {
    const user = AuthService.getUser();
    
    // Hide display values, show edit inputs
    document.getElementById('infoName').style.display = 'none';
    document.getElementById('editName').style.display = 'block';
    document.getElementById('editName').value = user.name || '';
    
    document.getElementById('infoEmail').style.display = 'none';
    document.getElementById('editEmail').style.display = 'block';
    document.getElementById('editEmail').value = user.email || '';
    
    document.getElementById('infoMobile').style.display = 'none';
    document.getElementById('editMobile').style.display = 'block';
    document.getElementById('editMobile').value = user.mobile || '';
    
    document.getElementById('infoDesignation').style.display = 'none';
    document.getElementById('editDesignation').style.display = 'block';
    document.getElementById('editDesignation').value = user.designation || 'LPG';
    
    // Toggle buttons
    document.getElementById('btnEditProfile').style.display = 'none';
    document.getElementById('btnSaveCancel').style.display = 'flex';
  },
  
  // Cancel editing
  cancelEdit() {
    // Show display values, hide edit inputs
    document.getElementById('infoName').style.display = 'block';
    document.getElementById('editName').style.display = 'none';
    
    document.getElementById('infoEmail').style.display = 'block';
    document.getElementById('editEmail').style.display = 'none';
    
    document.getElementById('infoMobile').style.display = 'block';
    document.getElementById('editMobile').style.display = 'none';
    
    document.getElementById('infoDesignation').style.display = 'block';
    document.getElementById('editDesignation').style.display = 'none';
    
    // Toggle buttons
    document.getElementById('btnEditProfile').style.display = 'block';
    document.getElementById('btnSaveCancel').style.display = 'none';
    
    // Clear error
    document.getElementById('profileEditError').textContent = '';
  },
  
  // Save profile changes
  saveProfile() {
    const user = AuthService.getUser();
    const name = document.getElementById('editName').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const mobile = document.getElementById('editMobile').value.trim();
    const designation = document.getElementById('editDesignation').value;
    const errorElem = document.getElementById('profileEditError');
    
    // Validate
    if (!name) {
      errorElem.textContent = 'Name cannot be empty';
      return;
    }
    
    if (email && !email.includes('@')) {
      errorElem.textContent = 'Please enter a valid email address';
      return;
    }
    
    if (mobile && mobile.length !== 10) {
      errorElem.textContent = 'Mobile number must be 10 digits';
      return;
    }
    
    // Update crew data in storage
    const crews = Storage.load(APP_CONFIG.storage.registeredCrews, true) || {};
    if (crews[user.cms]) {
      crews[user.cms].name = name;
      crews[user.cms].email = email;
      crews[user.cms].mobile = mobile;
      crews[user.cms].designation = designation;
      Storage.save(APP_CONFIG.storage.registeredCrews, crews);
    }
    
    // Update current user session
    user.name = name;
    user.email = email;
    user.mobile = mobile;
    user.designation = designation;
    Storage.saveUserState(user);
    
    // Update AuthService current user
    AuthService.currentUser = user;
    AuthService.updateUI();
    
    // Update display
    this.loadProfileInfo(user);
    this.cancelEdit();
    
    errorElem.textContent = '';
    showNotification('✅ Profile updated successfully!', 'success');
  },
  
  // Load quiz history
  async loadQuizHistory(user) {
    const quizHistoryList = document.getElementById('quizHistoryList');
    quizHistoryList.innerHTML = '<div class="loading-spinner" style="text-align:center; padding:20px;">Loading history...</div>';
    
    try {
      // Get API instance
      const api = window.Api || AuthService.getApi();
      if (!api) {
        throw new Error('API service not available');
      }
      
      const userId = user.id || user.serverId;
      if (!userId) {
        // Fallback or error if no ID (e.g. offline user)
        console.warn('No user ID available for fetching history');
        quizHistoryList.innerHTML = '<div class="empty-state"><div class="empty-state-text">Please login online to view history</div></div>';
        return;
      }

      const response = await api.getQuizHistory(userId);
      
      if (response && response.success) {
        const userAttempts = response.history || [];
        
        if (userAttempts.length === 0) {
          quizHistoryList.innerHTML = `
            <div class="empty-state">
              <div class="empty-state-icon">📝</div>
              <div class="empty-state-text">No quiz attempts yet</div>
              <div style="margin-top: 12px;">
                <button class="btn-sm btn-primary" onclick="NavigationService.navigateTo('quizPage'); ProfileService.closeProfile();">Take Quiz</button>
              </div>
            </div>
          `;
          return;
        }
        
        const html = userAttempts.map((attempt, index) => {
          // Map API fields
          const total = attempt.total_questions || 10;
          const score = parseFloat(attempt.score);
          const date = attempt.attempted_at;
          const isPassed = attempt.is_passed == 1;
          const percentage = Math.round((score / total) * 100);
          
          return `
            <div class="quiz-history-item">
              <div class="quiz-history-header">
                <div class="quiz-title">Quiz Attempt #${userAttempts.length - index}</div>
                <div class="quiz-score ${isPassed ? 'pass' : 'fail'}">
                  ${score}/${total} (${percentage}%)
                </div>
              </div>
              <div class="quiz-meta">
                <span>📅 ${new Date(date).toLocaleDateString()}</span>
                <span>⏰ ${new Date(date).toLocaleTimeString()}</span>
                <span>${isPassed ? '✅ Passed' : '❌ Failed'}</span>
              </div>
              ${isPassed ? `
                <div style="margin-top: 10px;">
                  <button class="btn-sm btn-primary" onclick="CertificateService.generateCertificate('${user.name}', '${user.cms}', '${score}', '${total}', '${date}')">
                    📜 Download Certificate
                  </button>
                </div>
              ` : ''}
            </div>
          `;
        }).join('');
        
        quizHistoryList.innerHTML = html;
      } else {
        throw new Error(response.error || 'Failed to load history');
      }
    } catch (error) {
      console.error('Error loading quiz history:', error);
      quizHistoryList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-text">Failed to load history</div>
          <div class="empty-state-description">${error.message}</div>
          <button class="btn-sm" onclick="ProfileService.loadQuizHistory(AuthService.getUser())">Retry</button>
        </div>
      `;
    }
  },
  
  // Change password
  changePassword() {
    const user = AuthService.getUser();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    const errorElem = document.getElementById('passwordError');
    
    // Validate
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      errorElem.textContent = 'Please fill all fields';
      return;
    }
    
    if (newPassword.length < 6) {
      errorElem.textContent = 'New password must be at least 6 characters';
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      errorElem.textContent = 'New passwords do not match';
      return;
    }
    
    // Get registered crews
    const crews = Storage.load(APP_CONFIG.storage.registeredCrews, true) || {};
    const crew = crews[user.cms];
    
    if (!crew) {
      errorElem.textContent = 'User not found';
      return;
    }
    
    if (crew.password !== currentPassword) {
      errorElem.textContent = 'Current password is incorrect';
      return;
    }
    
    // Update password
    crews[user.cms].password = newPassword;
    Storage.save(APP_CONFIG.storage.registeredCrews, crews);
    
    errorElem.textContent = '';
    showNotification('✅ Password changed successfully!', 'success');
    
    // Clear fields
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
  },
  
  // Raise support ticket
  raiseTicket() {
    const user = AuthService.getUser();
    const category = document.getElementById('ticketCategory').value;
    const priority = document.getElementById('ticketPriority').value;
    const recipient = document.getElementById('ticketRecipient').value;
    const subject = document.getElementById('ticketSubject').value.trim();
    const description = document.getElementById('ticketDescription').value.trim();
    const errorElem = document.getElementById('ticketError');
    
    // Validate
    if (!category || !subject || !description) {
      errorElem.textContent = 'Please fill all required fields';
      return;
    }
    
    if (subject.length < 5) {
      errorElem.textContent = 'Subject must be at least 5 characters';
      return;
    }
    
    if (description.length < 20) {
      errorElem.textContent = 'Description must be at least 20 characters';
      return;
    }
    
    // Create ticket
    const ticket = {
      id: 'TKT' + Date.now(),
      category,
      priority,
      recipient,
      subject,
      description,
      status: 'open',
      createdBy: user.cms,
      createdByName: user.name,
      division: user.division,
      lobby: user.hq,
      createdAt: new Date().toISOString(),
      replies: []
    };
    
    // Save ticket
    const tickets = Storage.load(APP_CONFIG.storage.tickets, true) || {};
    if (!tickets[user.cms]) {
      tickets[user.cms] = [];
    }
    tickets[user.cms].push(ticket);
    Storage.save(APP_CONFIG.storage.tickets, tickets);
    
    errorElem.textContent = '';
    showNotification(`✅ Ticket ${ticket.id} created successfully!`, 'success');
    
    // Clear form
    document.getElementById('ticketCategory').value = '';
    document.getElementById('ticketPriority').value = 'medium';
    document.getElementById('ticketRecipient').value = 'lobby';
    document.getElementById('ticketSubject').value = '';
    document.getElementById('ticketDescription').value = '';
    
    // Reload tickets
    this.loadMyTickets(user);
  },
  
  // Load user tickets
  loadMyTickets(user) {
    const myTicketsList = document.getElementById('myTicketsList');
    const tickets = Storage.load(APP_CONFIG.storage.tickets, true) || {};
    const userTickets = tickets[user.cms] || [];
    
    if (userTickets.length === 0) {
      myTicketsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🎟️</div>
          <div class="empty-state-text">No support tickets yet</div>
        </div>
      `;
      return;
    }
    
    const html = userTickets.reverse().map(ticket => {
      const recipientLabel = {
        lobby: 'Lobby Incharge (CLI)',
        division: 'Division Admin',
        super: 'Super Admin'
      }[ticket.recipient];
      
      return `
        <div class="ticket-item ${ticket.priority}">
          <div class="ticket-header">
            <div>
              <div class="ticket-subject">${ticket.subject}</div>
              <div style="font-size: 11px; color: #888; margin-top: 4px;">
                #${ticket.id} • ${ticket.category}
              </div>
            </div>
            <div class="ticket-status ${ticket.status}">${ticket.status}</div>
          </div>
          <div class="ticket-description">${ticket.description}</div>
          <div class="ticket-meta">
            📤 To: ${recipientLabel} • 
            ⚡ ${ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority • 
            📅 ${new Date(ticket.createdAt).toLocaleString()}
          </div>
        </div>
      `;
    }).join('');
    
    myTicketsList.innerHTML = html;
  }
};
