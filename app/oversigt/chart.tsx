"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type CategoryChartProps = {
  data: {
    category: string;
    amount: number;
  }[];
};

export default function CategoryChart({ data }: CategoryChartProps) {
  if (data.length === 0) {
    return <p className="empty-state">Ingen udgifter i den valgte måned endnu.</p>;
  }

  return (
    <div className="category-chart">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip
            formatter={(value) =>
              `${Number(value).toLocaleString("da-DK", {
                minimumFractionDigits: 2,
              })} kr.`
            }
          />
          <Bar dataKey="amount" fill="#57a271" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}