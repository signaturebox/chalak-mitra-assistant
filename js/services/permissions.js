// Permissions Service - Role-Based Access Control
// Roles: super, division, lobby, crew

const PermissionsService = {
  
  // Role hierarchy levels
  ROLES: {
    super: 4,
    division: 3,
    lobby: 2,
    crew: 1
  },

  // Check if user has at least the required role level
  hasRoleLevel(user, requiredRole) {
    const userLevel = this.ROLES[user.role] || 0;
    const requiredLevel = this.ROLES[requiredRole] || 0;
    return userLevel >= requiredLevel;
  },

  // Check if user is Super Admin
  isSuperAdmin(user) {
    return user.role === 'super';
  },

  // Check if user is Division Admin
  isDivisionAdmin(user) {
    return user.role === 'division';
  },

  // Check if user is Lobby Admin
  isLobbyAdmin(user) {
    return user.role === 'lobby';
  },

  // Check if user is Crew
  isCrew(user) {
    return user.role === 'crew';
  },

  // Check if user belongs to the specified division
  isOwnDivision(user, division) {
    if (!division) return false;
    return user.division && user.division.toLowerCase() === division.toLowerCase();
  },

  // Check if user belongs to the specified lobby
  isOwnLobby(user, lobby) {
    if (!lobby) return false;
    const userLobby = user.hq || user.lobby;
    return userLobby && userLobby.toLowerCase() === lobby.toLowerCase();
  },

  // ========== LOBBY MANAGEMENT ==========
  
  // Can add lobby to any division
  canAddLobbyAny(user) {
    return this.isSuperAdmin(user);
  },

  // Can add lobby to own division
  canAddLobbyOwn(user, division) {
    if (this.isSuperAdmin(user)) return true;
    if (this.isDivisionAdmin(user) && this.isOwnDivision(user, division)) return true;
    return false;
  },

  // Can edit/delete any lobby
  canEditDeleteLobbyAny(user) {
    return this.isSuperAdmin(user);
  },

  // Can edit/delete lobby in own division
  canEditDeleteLobbyOwn(user, division) {
    if (this.isSuperAdmin(user)) return true;
    if (this.isDivisionAdmin(user) && this.isOwnDivision(user, division)) return true;
    return false;
  },

  // ========== TAB MANAGEMENT ==========
  
  // Can add main tabs
  canAddMainTab(user) {
    return this.isSuperAdmin(user);
  },

  // Can add division tab to any division
  canAddDivisionTabAny(user) {
    return this.isSuperAdmin(user);
  },

  // Can add division tab to own division
  canAddDivisionTabOwn(user, division) {
    if (this.isSuperAdmin(user)) return true;
    if (this.isDivisionAdmin(user) && this.isOwnDivision(user, division)) return true;
    return false;
  },

  // Can edit/delete main tabs
  canEditDeleteMainTab(user) {
    return this.isSuperAdmin(user);
  },

  // Can edit/delete division tab
  canEditDeleteDivisionTab(user, division) {
    if (this.isSuperAdmin(user)) return true;
    if (this.isDivisionAdmin(user) && this.isOwnDivision(user, division)) return true;
    return false;
  },

  // ========== CONTENT MANAGEMENT (FOLDERS) ==========
  
  // Can add folder to any location
  canAddFolderAny(user) {
    return this.isSuperAdmin(user);
  },

  // Can add folder in own division
  canAddFolderOwnDivision(user, division) {
    if (this.isSuperAdmin(user)) return true;
    if (this.isDivisionAdmin(user) && this.isOwnDivision(user, division)) return true;
    return false;
  },

  // Can add folder in own lobby
  canAddFolderOwnLobby(user, division, lobby) {
    if (this.isSuperAdmin(user)) return true;
    if (this.isDivisionAdmin(user) && this.isOwnDivision(user, division)) return true;
    if (this.isLobbyAdmin(user) && this.isOwnDivision(user, division) && this.isOwnLobby(user, lobby)) return true;
    return false;
  },

  // Generic can add folder check
  canAddFolder(user, division, lobby) {
    // Super admin can add anywhere
    if (this.isSuperAdmin(user)) return true;
    
    // Division admin can add in their division
    if (this.isDivisionAdmin(user)) {
      return this.isOwnDivision(user, division);
    }
    
    // Lobby admin can only add in their specific lobby
    if (this.isLobbyAdmin(user)) {
      return this.isOwnDivision(user, division) && this.isOwnLobby(user, lobby);
    }
    
    return false;
  },

  // ========== CONTENT MANAGEMENT (FILES) ==========
  
  // Can upload file to any location
  canUploadFileAny(user) {
    return this.isSuperAdmin(user);
  },

  // Can upload file in own division
  canUploadFileOwnDivision(user, division) {
    if (this.isSuperAdmin(user)) return true;
    if (this.isDivisionAdmin(user) && this.isOwnDivision(user, division)) return true;
    return false;
  },

  // Can upload file in own lobby
  canUploadFileOwnLobby(user, division, lobby) {
    if (this.isSuperAdmin(user)) return true;
    if (this.isDivisionAdmin(user) && this.isOwnDivision(user, division)) return true;
    if (this.isLobbyAdmin(user) && this.isOwnDivision(user, division) && this.isOwnLobby(user, lobby)) return true;
    return false;
  },

  // Generic can upload file check
  canUploadFile(user, division, lobby) {
    // Super admin can upload anywhere
    if (this.isSuperAdmin(user)) return true;
    
    // Division admin can upload in their division
    if (this.isDivisionAdmin(user)) {
      return this.isOwnDivision(user, division);
    }
    
    // Lobby admin can only upload in their specific lobby
    if (this.isLobbyAdmin(user)) {
      return this.isOwnDivision(user, division) && this.isOwnLobby(user, lobby);
    }
    
    return false;
  },

  // Can delete file
  canDeleteFile(user, file) {
    if (this.isSuperAdmin(user)) return true;
    
    // Division admin can delete files in their division
    if (this.isDivisionAdmin(user) && file.division) {
      return this.isOwnDivision(user, file.division);
    }
    
    // Lobby admin can delete their own files in their lobby
    if (this.isLobbyAdmin(user) && file.lobby) {
      return this.isOwnDivision(user, file.division) && this.isOwnLobby(user, file.lobby);
    }
    
    return false;
  },

  // ========== USER MANAGEMENT ==========
  
  // Can create Division Admin
  canCreateDivisionAdmin(user) {
    return this.isSuperAdmin(user);
  },

  // Can create Lobby Admin for any division
  canCreateLobbyAdminAny(user) {
    return this.isSuperAdmin(user);
  },

  // Can create Lobby Admin for own division
  canCreateLobbyAdminOwn(user, division) {
    if (this.isSuperAdmin(user)) return true;
    if (this.isDivisionAdmin(user) && this.isOwnDivision(user, division)) return true;
    return false;
  },

  // Check if user can edit another user
  canEditUser(currentUser, targetUser) {
    if (!currentUser || !targetUser) return false;
    
    // Super admins can edit any user
    if (this.isSuperAdmin(currentUser)) return true;
    
    // Division admins can edit lobby admins in their division
    if (this.isDivisionAdmin(currentUser) && 
        this.isLobbyAdmin(targetUser) && 
        this.isOwnDivision(currentUser, targetUser.division)) {
      return true;
    }
    
    return false;
  },
  
  // Check if user can delete another user
  canDeleteUser(currentUser, targetUser) {
    if (!currentUser || !targetUser) return false;
    
    // Super admins can delete any user
    if (this.isSuperAdmin(currentUser)) return true;
    
    // Division admins can delete lobby admins in their division
    if (this.isDivisionAdmin(currentUser) && 
        this.isLobbyAdmin(targetUser) && 
        this.isOwnDivision(currentUser, targetUser.division)) {
      return true;
    }
    
    return false;
  },

  // ========== VIEW PERMISSIONS ==========
  
  // Can view admin panel
  canViewAdminPanel(user) {
    return this.hasRoleLevel(user, 'lobby');
  },

  // Can view user management section
  canViewUserManagement(user) {
    return this.hasRoleLevel(user, 'division');
  },

  // Can view division
  canViewDivision(user, division) {
    // Super admin can view all
    if (this.isSuperAdmin(user)) return true;
    // Others can only view their own division
    return this.isOwnDivision(user, division);
  },

  // ========== UTILITY METHODS ==========

  // Get permission error message
  getPermissionError(action) {
    return `❌ Permission denied: You don't have permission to ${action}`;
  },

  // Check permission and return result with message
  checkPermission(allowed, action) {
    if (allowed) {
      return { allowed: true };
    }
    return { allowed: false, message: this.getPermissionError(action) };
  },

  // Get user's scope description
  getUserScope(user) {
    if (this.isSuperAdmin(user)) return 'All divisions and lobbies';
    if (this.isDivisionAdmin(user)) return `${user.division} division`;
    if (this.isLobbyAdmin(user)) return `${user.hq || user.lobby} lobby in ${user.division}`;
    return 'View only';
  },

  // Get allowed actions for UI display
  getAllowedActions(user) {
    const actions = {
      canAddMainTab: this.canAddMainTab(user),
      canAddDivisionTab: this.isSuperAdmin(user) || this.isDivisionAdmin(user),
      canAddFolder: this.isSuperAdmin(user) || this.isDivisionAdmin(user) || this.isLobbyAdmin(user),
      canUploadFile: this.isSuperAdmin(user) || this.isDivisionAdmin(user) || this.isLobbyAdmin(user),
      canDeleteFile: this.isSuperAdmin(user) || this.isDivisionAdmin(user) || this.isLobbyAdmin(user),
      canManageLobbies: this.isSuperAdmin(user) || this.isDivisionAdmin(user),
      canCreateDivisionAdmin: this.canCreateDivisionAdmin(user),
      canCreateLobbyAdmin: this.isSuperAdmin(user) || this.isDivisionAdmin(user),
      canViewAdminPanel: this.canViewAdminPanel(user)
    };
    return actions;
  }
};

// Make globally available
window.PermissionsService = PermissionsService;
