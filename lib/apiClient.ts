export const api = {
  get: async (url: string) => {
    return request(url, { method: 'GET' });
  },
  post: async (url: string, data?: any) => {
    return request(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  put: async (url: string, data?: any) => {
    return request(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  delete: async (url: string) => {
    return request(url, { method: 'DELETE' });
  },
};

async function request(url: string, options: RequestInit) {
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    // Isto é fundamental para enviar e receber o Cookie JSESSIONID do Spring
    credentials: 'include', 
  };

  const response = await fetch(url, { ...defaultOptions, ...options });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorData.error || errorData.message || `Status: ${response.status}`;
    } catch (e) {
      errorMsg = await response.text() || `Status: ${response.status}`;
    }
    throw new Error(errorMsg);
  }

  // Handle empty responses
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null;
  }

  try {
    return await response.json();
  } catch (e) {
    return null; // Return null if response is not JSON
  }
}
