export function BreakdownRow({
  label,
  value,
  bold,
  muted,
  positive,
  negative,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={muted ? "text-muted-foreground" : bold ? "font-medium" : ""}>{label}</span>
      <span
        className={[
          bold ? "font-medium" : "",
          muted ? "text-muted-foreground" : "",
          positive ? "text-green-600 dark:text-green-400" : "",
          negative ? "text-red-500 dark:text-red-400" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </span>
    </div>
  );
}
