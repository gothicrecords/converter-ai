// Sistema di autenticazione con Supabase Database
// Usa API routes per comunicare con il database in sicurezza

const SESSION_STORAGE_KEY = 'megapixelai_session';
const USER_CACHE_KEY = 'megapixelai_user_cache';

// Ottieni session token
const getSessionToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_STORAGE_KEY);
};

// Salva session token
const saveSessionToken = (token) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_STORAGE_KEY, token);
};

// Rimuovi session token
const removeSessionToken = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.removeItem(USER_CACHE_KEY);
};

// Cache utente locale (per performance)
const getCachedUser = () => {
  if (typeof window === 'undefined') return null;
  const cached = localStorage.getItem(USER_CACHE_KEY);
  if (!cached) return null;
  try {
    return JSON.parse(cached);
  } catch {
    return null;
  }
};

const setCachedUser = (user) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
};

// Registra nuovo utente
export const signup = async (name, email, password) => {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Errore durante la registrazione' };
    }

    // Salva session token
    saveSessionToken(data.sessionToken);
    setCachedUser(data.user);

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: 'Errore di connessione' };
  }
};

// Login utente
export const login = async (email, password) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Email o password errati' };
    }

    // Salva session token
    saveSessionToken(data.sessionToken);
    setCachedUser(data.user);

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Errore di connessione' };
  }
};

// Logout
export const logout = async () => {
  try {
    const sessionToken = getSessionToken();
    
    if (sessionToken) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ sessionToken })
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    removeSessionToken();
  }
};

// Ottieni utente corrente
export const getCurrentUser = async (forceRefresh = false) => {
  if (typeof window === 'undefined') return null;

  const sessionToken = getSessionToken();
  if (!sessionToken) return null;

  // Usa cache se non forziamo refresh
  if (!forceRefresh) {
    const cached = getCachedUser();
    if (cached) return cached;
  }

  try {
    const response = await fetch('/api/auth/user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken}`
      }
    });

    if (!response.ok) {
      // Session invalida o scaduta
      removeSessionToken();
      return null;
    }

    const data = await response.json();
    setCachedUser(data.user);
    return data.user;

  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

// Verifica se l'utente è loggato
export const isAuthenticated = () => {
  return getSessionToken() !== null;
};

// Aggiorna statistiche utente (dopo uso tool)
export const updateUserStats = async (toolName) => {
  const sessionToken = getSessionToken();
  if (!sessionToken) return { success: false, error: 'Non autenticato' };

  try {
    const response = await fetch('/api/users/stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      },
      body: JSON.stringify({ toolName })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Errore aggiornamento stats' };
    }

    // Aggiorna cache
    setCachedUser(data.user);

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Update stats error:', error);
    return { success: false, error: 'Errore di connessione' };
  }
};

// Ottieni statistiche utente calcolate
export const getUserStats = (user) => {
  if (!user) return null;

  const registeredDays = Math.max(1, Math.floor(
    (new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)
  ));

  const toolsUsedCount = Array.isArray(user.tools_used) ? user.tools_used.length : 0;

  return {
    imagesProcessed: user.images_processed || 0,
    toolsUsed: toolsUsedCount,
    registeredDays,
    averageDaily: Math.round((user.images_processed || 0) / registeredDays),
    hasDiscount: user.has_discount || false,
    plan: user.plan || 'free'
  };
};
