const API_BASE_URL = 'http://localhost:3000/api';

class AuthService {
  async login(username, password) {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error en el login');
    }

    const data = await response.json();
    
    // Guardar token y usuario
    this.setToken(data.token);
    this.setUser(data.user);
    
    return data;
  }

  async logout() {
    const token = this.getToken();
    if (token) {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }
    this.clearAuth();
  }

  setToken(token) {
    sessionStorage.setItem('authToken', token);
  }

  getToken() {
    return sessionStorage.getItem('authToken');
  }

  setUser(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  }

  getUser() {
    const user = sessionStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  clearAuth() {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('currentUser');
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  getUserRole() {
    const user = this.getUser();
    return user ? user.role : null;
  }
}

export default new AuthService();