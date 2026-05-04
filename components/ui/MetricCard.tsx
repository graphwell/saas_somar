import React from 'react';
import { Card } from './Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}

export const MetricCard = ({ label, value, trend, icon, className = '' }: MetricCardProps) => {
  return (
    <Card className={`flex flex-col gap-4 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#00E5A0]">
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-end gap-3">
        <h3 className="text-2xl font-bold text-white">
          {value}
        </h3>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium mb-1 ${trend.isPositive ? 'text-[#00E5A0]' : 'text-[#EF4444]'}`}>
            {trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.value}%
          </div>
        )}
      </div>
    </Card>
  );
};
