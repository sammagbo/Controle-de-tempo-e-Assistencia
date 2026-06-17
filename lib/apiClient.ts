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

  // Read the body ONCE as text, then parse conditionally
  const contentLength = response.headers.get('content-length');
  const isNoBody = response.status === 204 || contentLength === '0';

  if (!response.ok) {
    let errorMsg = `Status: ${response.status}`;
    if (!isNoBody) {
      try {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          errorMsg = errorData.detail || errorData.error || errorData.message || errorMsg;
        } catch {
          if (text) errorMsg = text;
        }
      } catch {
        // body unreadable — keep default errorMsg
      }
    }
    throw new Error(errorMsg);
  }

  if (isNoBody) return null;

  try {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}
