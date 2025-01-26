// SkillsChart.tsx
"use client";

import type { Skill } from "@/types/skills";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const CHART_CONFIG = {
  colors: [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
    "#A4DE6C",
  ],
  maxItems: 7,
  dimensions: {
    width: "100%",
    height: 300,
    outerRadius: 80,
  },
  styles: {
    container: "bg-white p-6 rounded-lg shadow",
    heading: "text-2xl font-semibold mb-4 text-gray-800",
  },
} as const;

interface SkillsChartProps {
  skills: Record<string, number>;
}

export function SkillsChart({ skills }: SkillsChartProps) {
  const chartData = transformSkillsData(skills);

  return (
    <div className={CHART_CONFIG.styles.container}>
      <h2 className={CHART_CONFIG.styles.heading}>Top Skills</h2>
      <ResponsiveContainer {...CHART_CONFIG.dimensions}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={CHART_CONFIG.dimensions.outerRadius}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`${entry.name}-${index}`}
                fill={CHART_CONFIG.colors[index % CHART_CONFIG.colors.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function transformSkillsData(skills: Record<string, number>): Skill[] {
  return Object.entries(skills)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, CHART_CONFIG.maxItems);
}
