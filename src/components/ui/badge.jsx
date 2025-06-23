export function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-gray-700 text-white",
    secondary: "bg-blue-500 text-white",
    outline: "border border-current",
  };

  return (
    <span className={`inline-block px-2 py-0.5 text-xs rounded ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}
