import React from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * Branch selector dropdown — shows user's available branches.
 * Only visible when user has multiple branches.
 */
export default function BranchSelector() {
  const { auth, switchBranch, activeBranchId } = useAuth();

  if (!auth || !auth.branches || auth.branches.length <= 1) {
    return null;
  }

  return (
    <div className="branch-selector" id="branch-selector">
      <label className="branch-selector__label">🏬 Branch</label>
      <select
        id="branch-selector-dropdown"
        className="branch-selector__select"
        value={activeBranchId}
        onChange={(e) => switchBranch(e.target.value)}
      >
        {auth.branches.map((branchId) => (
          <option key={branchId} value={branchId}>
            {branchId}
          </option>
        ))}
      </select>
    </div>
  );
}
