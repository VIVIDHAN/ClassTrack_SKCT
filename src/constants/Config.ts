export const API_BASE_URL = 'http://3.108.234.156:3000/api';

export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeoutMs = 3500
): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
};

