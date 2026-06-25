interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== -1) {
      pages.push(-1);
    }
  }
  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <button
        className="w-9 h-9 rounded-lg border border-slate-700 bg-transparent text-slate-200 cursor-pointer text-sm flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:border-indigo-400 hover:text-indigo-400"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <i className="fas fa-chevron-left"></i>
      </button>
      {pages.map((p, i) =>
        p === -1 ? (
          <span key={`dots-${i}`} className="text-slate-500 px-1">...</span>
        ) : (
          <button
            key={p}
            className={`w-9 h-9 rounded-lg border text-sm flex items-center justify-center transition-all cursor-pointer ${
              p === currentPage
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'border-slate-700 bg-transparent text-slate-200 hover:border-indigo-400 hover:text-indigo-400'
            }`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        )
      )}
      <button
        className="w-9 h-9 rounded-lg border border-slate-700 bg-transparent text-slate-200 cursor-pointer text-sm flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:border-indigo-400 hover:text-indigo-400"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <i className="fas fa-chevron-right"></i>
      </button>
    </div>
  );
}
