import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const LeadSourceNode = ({ data }) => {
  return (
    <div className="custom-node lead-source-node">
      <div className="node-header">👥 Lead Source</div>
      <div className="node-content">
        <div className="node-field">
          <strong>Source:</strong> {data.source || 'Website'}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(LeadSourceNode);
