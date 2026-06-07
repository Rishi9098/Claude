interface Datum {
  label: string;
  value: number;
}

interface DistributionChartProps {
  data: Datum[];
  onSelect?: (label: string) => void;
  unit?: string;
}

/**
 * Horizontal bar distribution, styled as part of the registrar design system
 * (hairline track + indigo fill + tabular figures) rather than a default
 * chart-library look.
 */
export function DistributionChart({
  data,
  onSelect,
  unit = "students",
}: DistributionChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <ul className="dist-chart" role="list">
      {data.map((d) => {
        const pct = (d.value / max) * 100;
        const Tag = onSelect ? "button" : "div";
        return (
          <li key={d.label} className="dist-chart__item">
            <Tag
              className="dist-chart__bar-row"
              {...(onSelect
                ? {
                    type: "button" as const,
                    onClick: () => onSelect(d.label),
                    title: `Filter by ${d.label}`,
                  }
                : {})}
            >
              <span className="dist-chart__label">{d.label}</span>
              <span className="dist-chart__track" aria-hidden>
                <span
                  className="dist-chart__fill"
                  style={{ width: `${pct}%` }}
                />
              </span>
              <span className="dist-chart__value tnum">{d.value}</span>
              <span className="sr-only">
                {d.value} {unit}
              </span>
            </Tag>
          </li>
        );
      })}
    </ul>
  );
}
