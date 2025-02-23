import React, { useState, memo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@mui/material";
import { HelpCircle } from "lucide-react";
import { Tooltip } from "@mui/material"; 

const MetricTooltip = memo(({ children, content }) => (
  <Tooltip>
    <Tooltip.Trigger asChild>
      {children}
    </Tooltip.Trigger>
    <Tooltip.Content>
      <p className="text-sm">{content}</p>
    </Tooltip.Content>
  </Tooltip>
));

const MetricBar = memo(({ value = 0, showValue = true }) => {
  const getColorClass = (val) => {
    if (val >= 80) return 'bg-green-500';
    if (val >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full">
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full transition-all ${getColorClass(value)}`}
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </div>
      {showValue && (
        <div className="text-xs text-gray-600 mt-1 text-right">
          {value.toFixed(1)}%
        </div>
      )}
    </div>
  );
});

const MetricDialog = memo(({ isOpen, onClose, title, value, description }) => (
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
    </DialogHeader>
    <div className="space-y-4 p-4">
      <p className="text-sm text-gray-600">{description}</p>
      <div className="space-y-2">
        <div className="text-3xl font-semibold">{value?.toFixed(1) || 0}%</div>
        <MetricBar value={value} showValue={false} />
      </div>
      <div className="text-sm text-gray-600">
        {value >= 80 && 'Отличный показатель'}
        {value >= 50 && value < 80 && 'Требует внимания'}
        {value < 50 && 'Требует улучшения'}
      </div>
    </div>
  </DialogContent>
));

const MetricProgress = memo(({ value, label, tooltipText }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <div className="min-w-[120px]">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-600 font-medium">{label}</span>
            <MetricTooltip content={tooltipText}>
              <HelpCircle className="h-3 w-3 text-gray-400" />
            </MetricTooltip>
          </div>
        </div>
        
        <DialogTrigger asChild>
          <button className="w-full focus:outline-none">
            <MetricBar value={value} />
          </button>
        </DialogTrigger>
      </div>

      <MetricDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={label}
        value={value}
        description={tooltipText}
      />
    </Dialog>
  );
});

const EmployeeMetrics = memo(({ metrics }) => {
  const metricConfigs = [
    {
      key: 'overall_performance',
      label: 'Эффективность',
      tooltipText: 'Общий показатель эффективности сотрудника'
    },
    {
      key: 'kpi',
      label: 'KPI',
      tooltipText: 'Ключевые показатели эффективности'
    },
    {
      key: 'work_volume',
      label: 'Объём работ',
      tooltipText: 'Количество выполненных задач'
    },
    {
      key: 'activity',
      label: 'Активность',
      tooltipText: 'Уровень вовлеченности в работу'
    },
    {
      key: 'quality',
      label: 'Качество',
      tooltipText: 'Качество выполнения задач'
    }
  ];

  return (
    <div className="flex gap-4 items-center">
      {metricConfigs.map(({ key, label, tooltipText }) => (
        <MetricProgress
          key={key}
          value={metrics?.[key] || 0}
          label={label}
          tooltipText={tooltipText}
        />
      ))}
    </div>
  );
});

// Set display names for debugging
MetricTooltip.displayName = 'MetricTooltip';
MetricBar.displayName = 'MetricBar';
MetricDialog.displayName = 'MetricDialog';
MetricProgress.displayName = 'MetricProgress';
EmployeeMetrics.displayName = 'EmployeeMetrics';

export default EmployeeMetrics;