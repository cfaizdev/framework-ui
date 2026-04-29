import React from 'react';

export default function Pagination({ page, totalPages, totalElements, size, onPageChange }) {
  if (totalPages <= 1 && totalElements === 0) return null;

  const from = page * size + 1;
  const to = Math.min((page + 1) * size, totalElements);

  const getPages = () => {
    const pages = [];
    const delta = 2;
    for (let i = Math.max(0, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="pagination">
      <span className="pagination__info">
        {totalElements > 0 ? `Showing ${from}–${to} of ${totalElements} records` : 'No records'}
      </span>
      <div className="pagination__controls">
        <button
          className="pagination__btn"
          disabled={page === 0}
          onClick={() => onPageChange(0)}
          title="First page"
        >«</button>
        <button
          className="pagination__btn"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          title="Previous page"
        >‹</button>
        {getPages().map((p) => (
          <button
            key={p}
            className={`pagination__btn ${p === page ? 'active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p + 1}
          </button>
        ))}
        <button
          className="pagination__btn"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          title="Next page"
        >›</button>
        <button
          className="pagination__btn"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(totalPages - 1)}
          title="Last page"
        >»</button>
      </div>
    </div>
  );
}
