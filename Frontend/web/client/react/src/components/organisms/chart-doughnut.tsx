import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

// Register necessary Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Single source of truth for the Investments/Trade/Save categorical
// colors — imported by the Portfolio tab's own legend too, so the pie
// slices and their legend swatches can never drift out of sync again.
// Validated with the dataviz skill's palette checker (fixed order, passes
// lightness/chroma/CVD/normal-vision floors as an all-pairs categorical
// set) — the previous ad hoc orange/amber/red both failed the
// normal-vision floor (orange vs amber, ΔE 14.6, below the 15 minimum)
// and didn't match the legend's teal for the third slot at all.
export const PORTFOLIO_CHART_COLORS = ["#eb6834", "#2a78d6", "#1baf7a"] as const;

interface DoughnutChartProps {
  chartData?: [number, number, number];
}

const DoughnutChart = ({ chartData = [0, 0, 0] }: DoughnutChartProps) => {
  const sum = chartData.reduce((a, b) => a + b, 0);
  const isZero = sum === 0;

  const data = {
    labels: ["Investments", "Trade", "Goals"],
    datasets: [
      {
        label: "Value",
        data: isZero ? [1] : chartData,
        backgroundColor: isZero ? ["#E5E5E5"] : PORTFOLIO_CHART_COLORS,
        hoverBackgroundColor: isZero ? ["#E5E5E5"] : PORTFOLIO_CHART_COLORS,
        weight: 1,
        spacing: 0,
        hoverOffset: 0,
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    cutout: "75%",
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: !isZero,
        callbacks: {
          label: (context: { label?: string; parsed: number }) =>
            `${context.label}: ${context.parsed}%`,
        },
      }
    },
  };

  return (
    <div style={{ width: "200px", height: "200px" }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default DoughnutChart;
