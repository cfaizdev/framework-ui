import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { decodeJwt, isTokenExpired, getClaimsFromToken } from '../utils/jwt';
import axios from 'axios';

const AuthContext = createContext(null);

const TOKEN_KEY = 'df_token';
const REFRESH_KEY = 'df_refresh_token';
const BRANCH_KEY = 'df_active_branch';

/**
 * Production AuthContext — manages real JWT authentication.
 *
 * Provides: login, logout, isAuthenticated, user claims, branch switching.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem(REFRESH_KEY) || null);
  const [activeBranchId, setActiveBranchId] = useState(() => localStorage.getItem(BRANCH_KEY) || '');
  const [userInfo, setUserInfo] = useState(null);

  // Derive authentication state + claims
  const isAuthenticated = useMemo(() => {
    return token && !isTokenExpired(token);
  }, [token]);

  const claims = useMemo(() => {
    if (!token) return null;
    return getClaimsFromToken(token);
  }, [token]);

  // Build the auth object exposed to consumers
  const auth = useMemo(() => {
    if (!claims) return null;
    return {
      userId: claims.userId,
      userName: claims.name,
      companyId: claims.companyId,
      branchId: activeBranchId || claims.branchId,
      branchFilterEnabled: claims.branchFilterEnabled,
      roles: claims.roles,
      branches: claims.branches,
      role: claims.roles?.[0] || 'VIEWER', // primary role (for backward compat)
    };
  }, [claims, activeBranchId]);

  /**
   * Login with email + password.
   * @returns {{ user, token }} on success
   * @throws {Error} with message on failure
   */
  const login = useCallback(async (email, password) => {
    const res = await axios.post('/api/auth/df/auth/login', { email, password });
    const { token: jwt, refreshToken: rt, user } = res.data;

    localStorage.setItem(TOKEN_KEY, jwt);
    localStorage.setItem(REFRESH_KEY, rt);
    setToken(jwt);
    setRefreshToken(rt);
    setUserInfo(user);

    // Set active branch to first available
    const firstBranch = user.branches?.[0]?.id || '';
    localStorage.setItem(BRANCH_KEY, firstBranch);
    setActiveBranchId(firstBranch);

    return { user, token: jwt };
  }, []);

  /**
   * Logout — clears token and redirects to login.
   */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(BRANCH_KEY);
    setToken(null);
    setRefreshToken(null);
    setUserInfo(null);
    setActiveBranchId('');
  }, []);

  /**
   * Refresh the access token using the stored refresh token.
   */
  const refreshAccessToken = useCallback(async () => {
    const rt = localStorage.getItem(REFRESH_KEY);
    if (!rt) {
      logout();
      return null;
    }
    try {
      const res = await axios.post('/api/auth/df/auth/refresh', { refreshToken: rt });
      const { token: jwt, refreshToken: newRt } = res.data;
      localStorage.setItem(TOKEN_KEY, jwt);
      localStorage.setItem(REFRESH_KEY, newRt);
      setToken(jwt);
      setRefreshToken(newRt);
      return jwt;
    } catch {
      logout();
      return null;
    }
  }, [logout]);

  /**
   * Switch to a different branch.
   */
  const switchBranch = useCallback((branchId) => {
    localStorage.setItem(BRANCH_KEY, branchId);
    setActiveBranchId(branchId);
  }, []);

  const value = useMemo(() => ({
    auth,
    token,
    isAuthenticated,
    userInfo,
    login,
    logout,
    refreshAccessToken,
    switchBranch,
    activeBranchId,
  }), [auth, token, isAuthenticated, userInfo, login, logout, refreshAccessToken, switchBranch, activeBranchId]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
