'use client';

import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Legend,
} from 'recharts';

const TICK = { fontSize: 10, fill: '#737373', fontFamily: 'var(--font-mono)' };
const TOOLTIP = { fontSize: 12, borderRadius: 4, border: '1px solid #e5e5e5' };

export type GrowthPoint = { label: string; growth: number };
export type MarginPoint = { label: string; gross: number | null; ebitda: number | null };

export function RealGrowthChart({ data }: { data: GrowthPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="label" tick={TICK} interval={0} axisLine={false} tickLine={false} />
        <YAxis tick={TICK} tickFormatter={(v) => `${v.toFixed(0)}%`} axisLine={false} tickLine={false} width={50} />
        <Tooltip contentStyle={TOOLTIP} formatter={(v: number) => `${v.toFixed(1)}%`} />
        <ReferenceLine y={0} stroke="#737373" strokeDasharray="3 3" />
        <Bar dataKey="growth" fill="#3D5A80" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RealMarginChart({ data }: { data: MarginPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="label" tick={TICK} interval={0} axisLine={false} tickLine={false} />
        <YAxis tick={TICK} tickFormatter={(v) => `${v.toFixed(0)}%`} axisLine={false} tickLine={false} width={50} />
        <Tooltip contentStyle={TOOLTIP} formatter={(v: number) => `${v.toFixed(1)}%`} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        <Line type="monotone" dataKey="gross" name="Gross margin" stroke="#3D5A80" strokeWidth={2} dot={{ fill: '#3D5A80', r: 3 }} />
        <Line type="monotone" dataKey="ebitda" name="EBITDA margin" stroke="#16a34a" strokeWidth={2} dot={{ fill: '#16a34a', r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}