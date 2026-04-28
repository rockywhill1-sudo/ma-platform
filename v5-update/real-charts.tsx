'use client';

import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from 'recharts';

const TICK = { fontSize: 10, fill: '#737373', fontFamily: 'var(--font-mono)' };

export type ChartDataPoint = { label: string; value: number };

const CustomTooltip = ({ active, payload, label, formatter }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: 'white',
      border: '1px solid hsl(var(--border))',
      borderRadius: '0.5rem',
      padding: '8px 12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    }}>
      <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#737373', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--primary))' }}>
        {formatter ? formatter(payload[0].value) : payload[0].value}
      </p>
    </div>
  );
};

export function RealRevChart({ data }: { data: ChartDataPoint[] }) {
  const max = Math.max(...data.map((d) => d.value), 0);
  const useMillions = max >= 1_000_000;
  const useThousands = !useMillions && max >= 1_000;

  const formatY = (v: number) => {
    if (useMillions) return '$' + (v / 1_000_000).toFixed(1) + 'M';
    if (useThousands) return '$' + Math.round(v / 1_000) + 'K';
    return '$' + v.toLocaleString();
  };

  const formatTooltip = (v: number) => {
    if (useMillions) return '$' + (v / 1_000_000).toFixed(2) + 'M';
    if (useThousands) return '$' + Math.round(v / 1_000).toLocaleString() + 'K';
    return '$' + v.toLocaleString();
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gRevReal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
            <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity={0.2} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gRevStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="2 4" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="label" tick={TICK} axisLine={false} tickLine={false} />
        <YAxis tick={TICK} axisLine={false} tickLine={false} tickFormatter={formatY} />
        <Tooltip content={<CustomTooltip formatter={formatTooltip} />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="url(#gRevStroke)"
          strokeWidth={2.5}
          fill="url(#gRevReal)"
          dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'white' }}
          activeDot={{ r: 6, fill: 'hsl(var(--accent))', strokeWidth: 3, stroke: 'white' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
