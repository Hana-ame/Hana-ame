import React from 'react';
import type { StatusType } from '../../types';

const statusStyles: Record<StatusType, string> = {
  估计cost中: "bg-yellow-100 text-yellow-700",
  等待上传: "bg-blue-100 text-blue-700",
  已完成: "bg-green-100 text-green-700",
  已经关闭: "bg-gray-200 text-gray-600",
};

export const StatusBadge: React.FC<{ status: StatusType }> = ({ status }) => (
  <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase shadow-sm ${statusStyles[status]}`}>
    {status}
  </div>
);