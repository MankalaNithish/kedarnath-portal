import { useEffect, useState } from 'react';
import apiFetch from './api';

/**
 * Session hook for admin pages. Asks the server — the HttpOnly cookie is the
 * source of truth, never client storage. `checking` is true until the first
 * /auth/session response resolves.
 */
export default function useAdminSession() {
    const [state, setState] = useState({ checking: true, isAdmin: false });

    useEffect(() => {
        let cancelled = false;
        apiFetch('/api/v1/auth/session')
            .then((data) => { if (!cancelled) setState({ checking: false, isAdmin: Boolean(data.isAdmin) }); })
            .catch(() => { if (!cancelled) setState({ checking: false, isAdmin: false }); });
        return () => { cancelled = true; };
    }, []);

    return state;
}
