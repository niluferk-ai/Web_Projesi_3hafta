import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'danger' | 'info' | 'accent';
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon,
  iconBg = 'rgba(99, 102, 241, 0.15)',
  iconColor = '#6366f1',
  badge,
}) => {
  return (
    <div className="card stat-card">
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        <div
          className="stat-icon"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </div>
      </div>
      <div className="stat-value">{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {subtext && <span className="stat-subtext">{subtext}</span>}
        {badge && (
          <span className={`badge badge-${badge.variant}`}>
            {badge.text}
          </span>
        )}
      </div>
    </div>
  );
};
