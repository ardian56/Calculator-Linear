export function Card({ children, className = "" }) {
  return <div className={`rounded-xl border ${className}`.trim()}>{children}</div>;
}

export function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}
