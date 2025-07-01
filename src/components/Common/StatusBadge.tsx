import React from 'react';
import { DocumentStatus } from '../../types';
import { getStatusColor, getStatusText } from '../../utils/documentHelpers';

interface StatusBadgeProps {
  status: DocumentStatus;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)} ${className}`}>
      {getStatusText(status)}
    </span>
  );
};

export default StatusBadge;