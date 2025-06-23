export function Button({ children, onClick, className = "", size = "md" }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-1 text-sm font-medium transition ${className}`}
    >
      {children}
    </button>
  );
}
