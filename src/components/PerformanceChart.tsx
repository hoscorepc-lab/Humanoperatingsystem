import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function PerformanceChart() {
  const data = useMemo(() => [
    { day: 'Day 1', performance: 65, learning: 70 },
    { day: 'Day 2', performance: 68, learning: 73 },
    { day: 'Day 3', performance: 72, learning: 76 },
    { day: 'Day 4', performance: 75, learning: 80 },
    { day: 'Day 5', performance: 78, learning: 83 },
    { day: 'Day 6', performance: 82, learning: 87 },
    { day: 'Day 7', performance: 87, learning: 90 },
  ], []);

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="day" 
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="performance" 
            stroke="hsl(var(--chart-1))" 
            strokeWidth={2}
            name="Performance"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="learning" 
            stroke="hsl(var(--chart-2))" 
            strokeWidth={2}
            name="Learning Rate"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
