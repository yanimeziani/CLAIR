'use client';

import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  AreaChart,
  Area,
  Legend
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface TimelineData {
  date: string;
  visitors: number;
  pageViews: number;
  clicks: number;
}

interface AnalyticsChartProps {
  data: ChartData[] | TimelineData[];
  title: string;
  className?: string;
}

// Custom tooltip for LUCIDE analytics theme
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[rgb(var(--ws-gray-200))] rounded-lg p-3 shadow-lg">
        <p className="text-[rgb(var(--ws-gray-900))] font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const AnalyticsPieChart = ({ data, title, className = '' }: { data: ChartData[], title: string, className?: string }) => {
  const RADIAN = Math.PI / 180;
  
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className={`analytics-card ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-[rgb(var(--ws-gray-900))] flex items-center">
        <div className="w-2 h-2 bg-[rgb(var(--analytics-primary))] rounded-full mr-3"></div>
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || [
                  'rgb(var(--analytics-primary))',
                  'rgb(var(--analytics-secondary))', 
                  'rgb(var(--ws-green))',
                  'rgb(var(--ws-yellow))',
                  'rgb(var(--ws-red))'
                ][index % 5]} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ 
                backgroundColor: entry.color || [
                  'rgb(var(--analytics-primary))',
                  'rgb(var(--analytics-secondary))', 
                  'rgb(var(--ws-green))',
                  'rgb(var(--ws-yellow))',
                  'rgb(var(--ws-red))'
                ][index % 5]
              }}
            />
            <span className="text-sm text-[rgb(var(--ws-gray-600))]">
              {entry.name} ({entry.value.toLocaleString('fr-CA')})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AnalyticsBarChart = ({ data, title, className = '' }: { data: ChartData[], title: string, className?: string }) => {
  return (
    <div className={`analytics-card ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-[rgb(var(--ws-gray-900))] flex items-center">
        <div className="w-2 h-2 bg-[rgb(var(--analytics-primary))] rounded-full mr-3"></div>
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--ws-gray-200))" />
          <XAxis 
            dataKey="name" 
            stroke="rgb(var(--ws-gray-600))"
            fontSize={12}
            style={{ fontFamily: 'var(--font-inter)' }}
          />
          <YAxis 
            stroke="rgb(var(--ws-gray-600))"
            fontSize={12}
            style={{ fontFamily: 'var(--font-inter)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="rgb(var(--analytics-primary))">
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || `rgb(var(--analytics-${index % 2 === 0 ? 'primary' : 'secondary'}))`} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const AnalyticsLineChart = ({ data, title, className = '' }: { data: TimelineData[], title: string, className?: string }) => {
  return (
    <div className={`analytics-card ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-[rgb(var(--ws-gray-900))] flex items-center">
        <div className="w-2 h-2 bg-[rgb(var(--analytics-primary))] rounded-full mr-3"></div>
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--ws-gray-200))" />
          <XAxis 
            dataKey="date" 
            stroke="rgb(var(--ws-gray-600))"
            fontSize={12}
            style={{ fontFamily: 'var(--font-inter)' }}
          />
          <YAxis 
            stroke="rgb(var(--ws-gray-600))"
            fontSize={12}
            style={{ fontFamily: 'var(--font-inter)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="visitors" 
            stroke="rgb(var(--analytics-primary))" 
            strokeWidth={3}
            dot={{ fill: 'rgb(var(--analytics-primary))', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'rgb(var(--analytics-primary))', strokeWidth: 2 }}
            name="Visiteurs"
          />
          <Line 
            type="monotone" 
            dataKey="pageViews" 
            stroke="rgb(var(--analytics-secondary))" 
            strokeWidth={2}
            dot={{ fill: 'rgb(var(--analytics-secondary))', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: 'rgb(var(--analytics-secondary))', strokeWidth: 2 }}
            name="Vues de page"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const AnalyticsAreaChart = ({ data, title, className = '' }: { data: TimelineData[], title: string, className?: string }) => {
  return (
    <div className={`analytics-card ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-[rgb(var(--ws-gray-900))] flex items-center">
        <div className="w-2 h-2 bg-[rgb(var(--analytics-primary))] rounded-full mr-3"></div>
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(var(--analytics-primary))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="rgb(var(--analytics-primary))" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(var(--analytics-secondary))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="rgb(var(--analytics-secondary))" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(var(--ws-green))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="rgb(var(--ws-green))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            stroke="rgb(var(--ws-gray-600))"
            fontSize={12}
            style={{ fontFamily: 'var(--font-inter)' }}
          />
          <YAxis 
            stroke="rgb(var(--ws-gray-600))"
            fontSize={12}
            style={{ fontFamily: 'var(--font-inter)' }}
          />
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--ws-gray-200))" />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="visitors" 
            stackId="1" 
            stroke="rgb(var(--analytics-primary))" 
            fill="url(#colorVisitors)" 
            name="Visiteurs"
          />
          <Area 
            type="monotone" 
            dataKey="pageViews" 
            stackId="2" 
            stroke="rgb(var(--analytics-secondary))" 
            fill="url(#colorPageViews)" 
            name="Vues de page"
          />
          <Area 
            type="monotone" 
            dataKey="clicks" 
            stackId="3" 
            stroke="rgb(var(--ws-green))" 
            fill="url(#colorClicks)" 
            name="Clics"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Real-time heatmap intensity chart
export const HeatmapIntensityChart = ({ data, title, className = '' }: { data: ChartData[], title: string, className?: string }) => {
  return (
    <div className={`analytics-card ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-[rgb(var(--ws-gray-900))] flex items-center">
        <div className="w-2 h-2 bg-[rgb(var(--heatmap-hot))] rounded-full mr-3"></div>
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="horizontal" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--ws-gray-200))" />
          <XAxis type="number" stroke="rgb(var(--ws-gray-600))" fontSize={12} />
          <YAxis 
            dataKey="name" 
            type="category" 
            stroke="rgb(var(--ws-gray-600))"
            fontSize={12}
            width={100}
            style={{ fontFamily: 'var(--font-inter)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || [
                  'rgb(var(--heatmap-cold))',
                  'rgb(var(--heatmap-warm))',
                  'rgb(var(--heatmap-hot))'
                ][index % 3]} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};