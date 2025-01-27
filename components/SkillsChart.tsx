// SkillsChart.tsx
"use client";

import type { Skill } from "@/types/skills";
import { useState, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  Sector,
} from "recharts";

const CHART_CONFIG = {
  colors: [
    "url(#gradient1)",
    "url(#gradient2)",
    "url(#gradient3)",
    "url(#gradient4)",
    "url(#gradient5)",
  ],
  dimensions: {
    width: "100%",
    height: 400,
    activeShapeOffset: 10,
  },
  styles: {
    container: "bg-card rounded-xl p-6 shadow-lg border border-border",
    heading: "text-2xl font-semibold mb-6 text-primary",
    legend: "flex flex-wrap gap-3 justify-center mt-6",
    legendItem:
      "flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer transition-all",
    tooltip: "bg-background p-4 rounded-lg shadow-lg border border-border",
  },
  gradients: [
    { id: "gradient1", start: "#6366f1", end: "#8b5cf6" },
    { id: "gradient2", start: "#10b981", end: "#059669" },
    { id: "gradient3", start: "#f59e0b", end: "#d97706" },
    { id: "gradient4", start: "#ef4444", end: "#dc2626" },
    { id: "gradient5", start: "#0ea5e9", end: "#0284c7" },
  ],
} as const;

const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + CHART_CONFIG.dimensions.activeShapeOffset}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        className="transition-all duration-300"
      />
      <text
        x={cx}
        y={cy}
        dy={8}
        textAnchor="middle"
        fill="hsl(var(--primary))"
        className="font-semibold"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    </g>
  );
};

interface SkillsChartProps {
  skills: Record<string, number>;
}

export function SkillsChart({ skills }: SkillsChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hiddenSkills, setHiddenSkills] = useState<Set<string>>(new Set());
  const chartData = transformSkillsData(skills);

  // Используем useCallback для стабильной ссылки
  const handleLegendClick = useCallback((skill: string) => {
    setHiddenSkills((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(skill)) {
        newSet.delete(skill);
      } else {
        newSet.add(skill);
      }
      return newSet;
    });
  }, []);

  const filteredData = chartData.filter((d) => !hiddenSkills.has(d.name));

  return (
    <div className={CHART_CONFIG.styles.container}>
      <h2 className={CHART_CONFIG.styles.heading}>Technical Skills</h2>

      <ResponsiveContainer {...CHART_CONFIG.dimensions}>
        <PieChart>
          <defs>
            {CHART_CONFIG.gradients.map(({ id, start, end }) => (
              <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={start} />
                <stop offset="100%" stopColor={end} />
              </linearGradient>
            ))}
          </defs>

          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="80%"
            paddingAngle={2}
            dataKey="value"
            activeIndex={activeIndex ?? undefined}
            activeShape={renderActiveShape}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            animationDuration={300}
          >
            {filteredData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_CONFIG.colors[index % CHART_CONFIG.colors.length]}
                className="transition-all duration-300 hover:opacity-90"
              />
            ))}
          </Pie>

          <Tooltip
            content={({ payload }) => (
              <div className={CHART_CONFIG.styles.tooltip}>
                <p className="font-semibold text-primary">
                  {payload?.[0]?.name}
                </p>
                <p>{payload?.[0]?.value}% proficiency</p>
              </div>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className={CHART_CONFIG.styles.legend}>
        {chartData.map((entry, index) => {
          const isHidden = hiddenSkills.has(entry.name);
          return (
            <div
              key={entry.name}
              onClick={() => handleLegendClick(entry.name)}
              className={CHART_CONFIG.styles.legendItem}
              style={{
                opacity: isHidden ? 0.3 : 1,
                backgroundColor: `hsl(var(--accent))`,
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: CHART_CONFIG.colors[index] }}
              />
              <span className="text-sm text-foreground">{entry.name}</span>
              <span className="text-sm text-muted-foreground">
                {entry.value}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function transformSkillsData(skills: Record<string, number>): Skill[] {
  const total = Object.values(skills).reduce((sum, val) => sum + val, 0);
  return Object.entries(skills)
    .map(([name, value]) => ({
      name,
      value: Math.round((value / total) * 100),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}
