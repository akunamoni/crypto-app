import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPagination = () => {
    let pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages = [1, 2, 3, 4, "...", totalPages];
      } else if (currentPage >= totalPages - 2) {
        pages = [
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];
      } else {
        pages = [
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        ];
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 my-4 flex-wrap">

      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded bg-blue/20 hover:bg-blue/30 disabled:opacity-40 disabled:pointer-events-none"
        title="Previous"
      >
        &lArr;
      </button>

      {/* Page numbers */}
      {getPagination().map((page, index) => (
        <button
          key={index}
          disabled={page === "..."}
          onClick={() => typeof page === "number" && onPageChange(page)}
          className={`px-3 py-1 rounded 
            ${
              currentPage === page
                ? "bg-blue text-white"
                : "bg-gray-3 hover:bg-gray-4"
            }
            ${page === "..." ? "bg-transparent text-gray-5 cursor-default" : ""}
          `}
        >
          {page}
        </button>
      ))}

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded bg-blue/20 hover:bg-blue/30 disabled:opacity-40 disabled:pointer-events-none"
        title="Next"
      >
        &rArr;
      </button>
    </div>
  );
};

export default Pagination;
