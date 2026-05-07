const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  static getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('circula_token');
    }
    return null;
  }

  static getCompanyToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('circula_company_token');
    }
    return null;
  }

  static async request(endpoint, options = {}) {
    const token = options.companyAuth ? this.getCompanyToken() : this.getToken();
    
    const config = {
      ...options,
      headers: {
        ...options.headers,
      },
    };

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData
    if (!(options.body instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      
      // Safety check for non-JSON content (e.g. 404 HTML pages)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textData = await response.text();
        throw new Error(`Server error: Expected JSON, got ${contentType || 'unknown'}. ${textData.substring(0, 50)}`);
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Auth
  static register(name, email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  static login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  static getProfile() {
    return this.request('/auth/me');
  }

  // Documents
  static uploadDocument(formData) {
    return this.request('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  }

  static getDocuments(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/documents?${query}`);
  }

  static getDocument(id) {
    return this.request(`/documents/${id}`);
  }

  static getDocViewUrl(id) {
    return `${API_BASE}/documents/${id}/view`;
  }

  static unlockDocument(id) {
    return this.request(`/documents/${id}/unlock`, { method: 'POST' });
  }

  static getUserUploads() {
    return this.request('/documents/user/uploads');
  }

  static toggleDocumentLike(id) {
    return this.request(`/documents/${id}/like`, { method: 'POST' });
  }

  static rateDocument(id, value) {
    return this.request(`/documents/${id}/rate`, {
      method: 'POST',
      body: JSON.stringify({ value })
    });
  }

  static commentDocument(id, text) {
    return this.request(`/documents/${id}/comment`, {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  }

  // Tokens
  static getBalance() {
    return this.request('/tokens/balance');
  }

  static getTransactionHistory(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/tokens/history?${query}`);
  }

  static getTokenPrices() {
    return this.request('/tokens/prices');
  }

  // Subscriptions
  static getPlans() {
    return this.request('/subscriptions/plans');
  }

  static createSubscription(planKey) {
    return this.request('/subscriptions/create', {
      method: 'POST',
      body: JSON.stringify({ planKey }),
    });
  }

  static extendSubscription(days) {
    return this.request('/subscriptions/extend', {
      method: 'POST',
      body: JSON.stringify({ days }),
    });
  }

  static getActiveSubscription() {
    return this.request('/subscriptions/active');
  }

  static debugRemoveSubscription() {
    return this.request('/subscriptions/debug/remove', { method: 'POST' });
  }

  // Bounties
  static getBounties(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/bounties?${query}`);
  }

  static getBounty(id) {
    return this.request(`/bounties/${id}`);
  }

  static submitToBounty(bountyId, formData) {
    return this.request(`/bounties/${bountyId}/submit`, {
      method: 'POST',
      body: formData,
    });
  }

  // Company Auth
  static companyRegister(data) {
    return this.request('/companies/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static companyLogin(email, password) {
    return this.request('/companies/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  static createBounty(data) {
    return this.request('/bounties', {
      method: 'POST',
      body: JSON.stringify(data),
      companyAuth: true,
    });
  }

  static getCompanyBounties() {
    return this.request('/bounties/company/me', {
      companyAuth: true,
    });
  }

  static reviewBountySubmission(bountyId, submissionIndex, status, feedback) {
    return this.request(`/bounties/${bountyId}/review`, {
      method: 'PUT',
      body: JSON.stringify({ submissionIndex, status, feedback }),
      companyAuth: true,
    });
  }
  
  static deleteBounty(id) {
    return this.request(`/bounties/${id}`, {
      method: 'DELETE',
      companyAuth: true,
    });
  }

  static getCompanyDocumentViewUrl(id) {
    const token = localStorage.getItem('circula_company_token');
    return `${API_BASE}/documents/${id}/company-view?token=${token}`;
  }

  // Admin
  static getAdminRevenueStats() {
    return this.request('/admin/revenue-stats');
  }

  // Reports
  static submitReport(documentId, type, description) {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify({ documentId, type, description }),
    });
  }
}

export default ApiClient;
