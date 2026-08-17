import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler, // Required for area charts
  Legend,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { Line } from "react-chartjs-2";

// Register components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
);

// A `chartData` candle is [timestamp, open, high, low, close, volume, value].
type CandlePoint = [number, number, number, number, number, number, number];

interface AreaChartProps {
  // Real price history (e.g. a security's `chartData` from the overview
  // endpoint). When omitted, falls back to placeholder demo data so
  // existing callers (like the Overview dashboard) are unaffected.
  chartData?: CandlePoint[];
  label?: string;
}

const RANGE_OPTIONS = ["1D", "1W", "1M", "3M", "6M", "1Y"] as const;
type Range = (typeof RANGE_OPTIONS)[number];

const RANGE_DAYS: Record<Range, number> = {
  "1D": 1,
  "1W": 7,
  "1M": 30,
  "3M": 90,
  "6M": 182,
  "1Y": 365,
};

const formatNaira = (value: number) =>
  `₦${value.toLocaleString("en-US")}`;

const AreaChart = ({ chartData: candles, label = "Security Performance" }: AreaChartProps) => {
  const hasRealData = !!candles?.length;

  // 1. Create a strongly-typed reference to the Chart instance
  const chartRef = useRef<ChartJS<'line'>>(null);

  // 2. Initialize chart data state
  const [chartData, setChartData] = useState<ChartData<'line'>>({
    datasets: [],
  });
  const [range, setRange] = useState<Range>("1W");

  // Slice candles down to whatever window the selected range covers,
  // relative to the most recent candle's date (not "today" — the last
  // available candle may be a few days old over a weekend/holiday).
  const filteredCandles = useMemo(() => {
    if (!candles?.length) return [];
    const latest = candles[candles.length - 1][0];
    const cutoff = latest - RANGE_DAYS[range] * 24 * 60 * 60 * 1000;
    const inRange = candles.filter(([timestamp]) => timestamp >= cutoff);
    return inRange.length > 0 ? inRange : candles;
  }, [candles, range]);

  useEffect(() => {
    const chart = chartRef.current;

    if (!chart) {
      return;
    }

    // 3. Cleanly extract the canvas rendering context
    const ctx = chart.ctx;

    // (startX, startY, endX, endY) -> Coordinates matching container size
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, '#E0F6F7'); // Top opaque color
    gradient.addColorStop(1, 'rgba(217, 217, 217, 0.00)'); // Bottom transparent fade

    const labels = hasRealData
      ? filteredCandles.map(([timestamp]) =>
          new Date(timestamp).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          }),
        )
      : ["1D", "1W", "1M", "3M", "6M", "YTD", "1Y", "ALL"];
    const data = hasRealData
      ? filteredCandles.map(([, , , , close]) => close)
      : [0, 20, 10, 30, 50, 60, 120, 140];

    // 4. Update the state with the built gradient background
    setChartData({
      labels,
      datasets: [
        {
          fill: true,
          label,
          data,
          borderColor: '#00727A',
          backgroundColor: gradient, // Gradient successfully applied safely
          tension: 0.4,
          pointRadius: 0,
        },
      ],
    });
  }, [filteredCandles, hasRealData, label]);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false, position: "top" },
      title: { display: false, text: "Monthly Performance" },
      tooltip: hasRealData
        ? {
            callbacks: {
              label: (context) => formatNaira(Number(context.parsed.y)),
            },
          }
        : undefined,
    },
    scales: {
      x: {
        grid: {
          display: hasRealData,
          color: "rgba(15, 15, 15, 0.06)",
        },
        ticks: { display: false },
      },
      y: {
        display: hasRealData,
        position: "right",
        grid: {
          color: "rgba(15, 15, 15, 0.06)",
        },
        border: { display: false },
        ticks: {
          color: "#8C8C8C",
          font: { size: 11 },
          callback: (value) => formatNaira(Number(value)),
        },
      },
    },
  };

  return (
    <div>
      <div style={{ height: hasRealData ? "220px" : "100px" }}>
        <Line ref={chartRef} data={chartData} options={options} />
      </div>

      {hasRealData && (
        <div className="flex gap-[8px] mt-[16px] overflow-x-auto">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              className={`shrink-0 px-[16px] py-[8px] rounded-[999px] text-[13px] font-semibold cursor-pointer transition-colors ${
                range === option
                  ? "bg-[#00585E] text-white"
                  : "bg-white text-(--text-content-muted) border border-(--border-default)"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AreaChart;
