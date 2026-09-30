/**
 * Minimal fetch wrapper for the /api/v1/{auth,gallery,news} endpoints.
 * `credentials: 'same-origin'` keeps the HttpOnly admin session cookie in play.
 */
export default async function apiFetch(path, options = {}) {
    const config = {
        credentials: 'same-origin',
        ...options,
    };
    if (options.body !== undefined && !(options.body instanceof FormData)) {
        config.headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
        config.body = JSON.stringify(options.body);
    }

    let response;
    try {
        response = await fetch(path, config);
    } catch {
        throw new Error('Could not reach the server. Check your connection and try again.');
    }

    let data = null;
    try { data = await response.json(); } catch { /* empty body is fine */ }

    if (!response.ok) {
        const error = new Error((data && data.error) || `Request failed (${response.status}).`);
        error.status = response.status;
        throw error;
    }
    return data;
}
