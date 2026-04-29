import React from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * User menu — shows current user info and logout button.
 */
export default function UserMenu() {
  const { auth, logout } = useAuth();

  if (!auth) return null;

  return (
    <div className="user-menu" id="user-menu">
      <div className="user-menu__info">
        <div className="user-menu__avatar">
          {auth.userName?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="user-menu__details">
          <span className="user-menu__name">{auth.userName}</span>
          <span className="user-menu__role">
            {auth.roles?.join(', ') || 'No role'}
          </span>
        </div>
      </div>
      <button
        id="logout-btn"
        className="user-menu__logout"
        onClick={logout}
        title="Logout"
      >
        ↪ Sign Out
      </button>
    </div>
  );
}
