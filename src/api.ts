export const api = {
  async get(url: string) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('xid_token') : null;
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(url, {
      credentials: 'include',
      headers,
    });
    if (!res.ok) {
      let errData: any = null;
      try {
        errData = await res.json();
      } catch {
        /* ignore */
      }
      const err: any = new Error(errData?.error || errData?.message || `HTTP ${res.status}`);
      err.response = { status: res.status, data: errData };
      throw err;
    }
    const data = await res.json();
    return { data };
  },
  async post(url: string, body?: any) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('xid_token') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify(body || {}),
    });
    if (!res.ok) {
      let errData: any = null;
      try {
        errData = await res.json();
      } catch {
        /* ignore */
      }
      const err: any = new Error(errData?.error || errData?.message || `HTTP ${res.status}`);
      err.response = { status: res.status, data: errData };
      throw err;
    }
    const data = await res.json();
    return { data };
  },
};

