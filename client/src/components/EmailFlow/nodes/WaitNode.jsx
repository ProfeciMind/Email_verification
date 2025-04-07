import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const WaitNode = ({ data }) => {
  return (
    <div className="custom-node wait-node">
      <Handle type="target" position={Position.Top} />
      <div className="node-header">⏱️ Wait/Delay</div>
      <div className="node-content">
        <div className="node-field">
          <strong>Duration:</strong> {data.hours || 24} hours
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(WaitNode);