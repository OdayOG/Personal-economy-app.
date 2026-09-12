"use client";

import { useRouter } from "next/navigation";

type MonthSelectorProps = {
  selectedMonth: string;
};

export default function MonthSelector({
  selectedMonth,
}: MonthSelectorProps) {
  const router = useRouter();

  function handleChange(month: string) {
    router.push(`/oversigt?month=${month}`);
  }

  return (
    <label className="month-selector">
      Måned
      <input
        type="month"
        value={selectedMonth}
        onChange={(event) => handleChange(event.target.value)}
      />
    </label>
  );
}