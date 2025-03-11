// components/admin/orders/date-cell.tsx
"use client";

import { useEffect, useState } from "react";

interface DateCellProps {
  value: string;
}

export default function DateCell({ value }: DateCellProps) {
  // Start with empty strings to avoid hydration mismatch
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");

  // Format date only after component mounts (client-side)
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setDateStr(date.toLocaleDateString());
      setTimeStr(
        date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }
  }, [value]);

  return (
    <div className="flex flex-col">
      <span>{dateStr}</span>
      <span className="text-xs text-muted-foreground">{timeStr}</span>
    </div>
  );
}
