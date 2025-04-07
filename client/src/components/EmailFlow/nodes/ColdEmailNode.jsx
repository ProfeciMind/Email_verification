import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const ColdEmailNode = ({ data }) => {
  return (
    <div className="custom-node cold-email-node">
      <Handle type="target" position={Position.Top} />
      <div className="node-header">📧 Cold Email</div>
      <div className="node-content">
        {data.subject ? (
          <>
            <div className="node-field">
              <strong>To:</strong> {data.emailAddress || 'No recipient'}
            </div>
            <div className="node-field">
              <strong>Subject:</strong> {data.subject || 'No subject'}
            </div>
            <div className="node-body">
              {data.body ? (data.body.length > 50 ? data.body.substring(0, 50) + '...' : data.body) : 'No content'}
            </div>
          </>
        ) : (
          <span className="node-empty">Click to configure email</span>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(ColdEmailNode);