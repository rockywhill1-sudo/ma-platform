'use client';

import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts';
import {
  DEMO_REV_24M, DEMO_GROWTH, DEMO_GM, DEMO_NRR, DEMO_PROJ,
} from '@/lib/demo/data';

const TICK = { fontSize: 10, fill: '#737373', fontFamily: 'var(--font-mono)' };
const TOOLTIP = { fontSize: 12, borderRadius: 4, border: '1px solid #e5e5e5' };

export function RevChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={DEMO_REV_24M} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3D5A80" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#3D5A80" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="m" tick={TICK} interval={2} axisLine={false} tickLine={false} />
        <YAxis tick={TICK} tickFormatter={(v) => `$${v}K`} axisLine={false} tickLine={false} width={50} />
        <Tooltip contentStyle={TOOLTIP} formatter={(v: number) => `$${v.toLocaleString()}K`} />
        <Area type="monotone" dataKey="rev" stroke="#3D5A80" strokeWidth={2} fill="url(#gRev)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function GrowthChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={DEMO_GROWTH} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="m" tick={TICK} interval={1} axisLine={false} tickLine={false} />
        <YAxis tick={TICK} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} width={40} />
        <Tooltip contentStyle={TOOLTIP} formatter={(v: number) => `${v}%`} />
        <Bar dataKey="growth" fill="#3D5A80" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function GmChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={DEMO_GM} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="q" tick={TICK} axisLine={false} tickLine={false} />
        <YAxis domain={[40, 46]} tick={TICK} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} width={40} />
        <Tooltip contentStyle={TOOLTIP} formatter={(v: number) => `${v}%`} />
        <ReferenceLine y={43} stroke="#737373" strokeDasharray="3 3" />
        <Line type="monotone" dataKey="gm" stroke="#3D5A80" strokeWidth={2} dot={{ fill: '#3D5A80', r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function NrrChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={DEMO_NRR} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="q" tick={TICK} axisLine={false} tickLine={false} />
        <YAxis domain={[100, 130]} tick={TICK} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} width={40} />
        <Tooltip contentStyle={TOOLTIP} formatter={(v: number) => `${v}%`} />
        <ReferenceLine y={100} stroke="#737373" strokeDasharray="3 3" />
        <Bar dataKey="nrr" fill="#16a34a" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ProjChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={DEMO_PROJ} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="yr" tick={{ ...TICK, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={TICK} tickFormatter={(v) => `$${v}M`} axisLine={false} tickLine={false} width={50} />
        <Tooltip contentStyle={TOOLTIP} formatter={(v: number) => `$${v}M`} />
        <Bar dataKey="rev" fill="#3D5A80" name="Revenue" radius={[2, 2, 0, 0]} />
        <Bar dataKey="ebitda" fill="#16a34a" name="EBITDA" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
