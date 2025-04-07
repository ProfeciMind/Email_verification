import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';
import ColdEmailNode from './nodes/ColdEmailNode';
import WaitNode from './nodes/WaitNode';
import LeadSourceNode from './nodes/LeadSourceNode';
import './EmailFlow.css';

// Node types for custom nodes
const nodeTypes = {
  coldEmail: ColdEmailNode,
  waitDelay: WaitNode,
  leadSource: LeadSourceNode,
};

const EmailFlow = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [campaignName, setCampaignName] = useState('New Campaign');

  // Load saved flow if exists
  useEffect(() => {
    const loadSavedFlow = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get('/api/campaigns/latest', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data) {
            setNodes(response.data.nodes || []);
            setEdges(response.data.edges || []);
            setCampaignName(response.data.name || 'New Campaign');
          }
        }
      } catch (error) {
        console.error('Error loading saved flow:', error);
      }
    };
    
    loadSavedFlow();
  }, []);

  // Handle node selection
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  // Handle edge creation
  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({ ...params, animated: true }, eds));
  }, [setEdges]);

  // Setup ReactFlow instance
  const onInit = useCallback((instance) => {
    setReactFlowInstance(instance);
  }, []);

  // Get new node ID
  const getId = () => `node_${nodes.length + 1}`;

  // Add new node to the canvas
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle node drop on canvas
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      
      if (typeof type === 'undefined' || !type) {
        return;
      }

      // Get position where node is dropped
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Create new node based on type
      let newNode = {
        id: getId(),
        position,
        data: { label: 'New Node' },
      };

      switch (type) {
        case 'coldEmail':
          newNode.type = 'coldEmail';
          newNode.data = { 
            label: 'Cold Email', 
            subject: '', 
            body: '', 
            emailAddress: '' 
          };
          break;
        case 'waitDelay':
          newNode.type = 'waitDelay';
          newNode.data = { 
            label: 'Wait/Delay', 
            hours: 24 
          };
          break;
        case 'leadSource':
          newNode.type = 'leadSource';
          newNode.data = { 
            label: 'Lead Source', 
            source: 'Website' 
          };
          break;
        default:
          return;
      }

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, nodes.length]
  );

  // Update node data when edited
  const updateNodeData = (nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, ...newData },
          };
        }
        return node;
      })
    );
  };

  // Save the flow as a campaign
  const saveFlow = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please log in to save your campaign');
        setIsLoading(false);
        return;
      }

      // Extract email sequence from the flow
      const sequence = extractSequence(nodes, edges);
      
      const response = await axios.post('/api/campaigns', 
        {
          name: campaignName,
          nodes,
          edges,
          sequence
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      alert('Campaign saved successfully!');
      setIsLoading(false);
    } catch (error) {
      console.error('Error saving campaign:', error);
      alert('Error saving campaign. Please try again.');
      setIsLoading(false);
    }
  };

  // Extract email sequence from the flow
  const extractSequence = (nodes, edges) => {
    // Find all lead source nodes (starting points)
    const startNodes = nodes.filter(node => node.type === 'leadSource');
    const sequence = [];
    
    // For each start node, follow the path
    startNodes.forEach(startNode => {
      let currentNode = startNode;
      let path = [{ ...currentNode }];
      
      // Follow the path until no more connections
      let hasNext = true;
      while (hasNext) {
        // Find outgoing edge from current node
        const outgoingEdge = edges.find(edge => edge.source === currentNode.id);
        
        if (outgoingEdge) {
          // Find the target node
          const targetNode = nodes.find(node => node.id === outgoingEdge.target);
          if (targetNode) {
            path.push({ ...targetNode });
            currentNode = targetNode;
          } else {
            hasNext = false;
          }
        } else {
          hasNext = false;
        }
      }
      
      sequence.push(path);
    });
    
    return sequence;
  };

  return (
    <div className="email-flow-container">
      <ReactFlowProvider>
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={onInit}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <Background color="#aaa" gap={16} />
            
            <Panel position="top-left" className="campaign-panel">
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="campaign-name-input"
              />
              <button onClick={saveFlow} disabled={isLoading} className="save-button">
                {isLoading ? 'Saving...' : 'Save Campaign'}
              </button>
            </Panel>
            
            <Panel position="top-right" className="node-palette">
              <div className="node-palette-header">Node Types</div>
              <div
                className="node-item cold-email"
                onDragStart={(event) => {
                  event.dataTransfer.setData('application/reactflow', 'coldEmail');
                  event.dataTransfer.effectAllowed = 'move';
                }}
                draggable
              >
                Cold Email
              </div>
              <div
                className="node-item wait-delay"
                onDragStart={(event) => {
                  event.dataTransfer.setData('application/reactflow', 'waitDelay');
                  event.dataTransfer.effectAllowed = 'move';
                }}
                draggable
              >
                Wait/Delay
              </div>
              <div
                className="node-item lead-source"
                onDragStart={(event) => {
                  event.dataTransfer.setData('application/reactflow', 'leadSource');
                  event.dataTransfer.effectAllowed = 'move';
                }}
                draggable
              >
                Lead Source
              </div>
            </Panel>
          </ReactFlow>
        </div>
        
        {/* Node editor panel */}
        {selectedNode && (
          <div className="node-editor">
            <h3>{selectedNode.data.label} Editor</h3>
            
            {selectedNode.type === 'coldEmail' && (
              <>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={selectedNode.data.emailAddress || ''}
                    onChange={(e) => updateNodeData(selectedNode.id, { emailAddress: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    value={selectedNode.data.subject || ''}
                    onChange={(e) => updateNodeData(selectedNode.id, { subject: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email Body</label>
                  <textarea
                    value={selectedNode.data.body || ''}
                    onChange={(e) => updateNodeData(selectedNode.id, { body: e.target.value })}
                    rows={6}
                  />
                </div>
              </>
            )}
            
            {selectedNode.type === 'waitDelay' && (
              <div className="form-group">
                <label>Delay (hours)</label>
                <input
                  type="number"
                  min="1"
                  value={selectedNode.data.hours || 24}
                  onChange={(e) => updateNodeData(selectedNode.id, { hours: parseInt(e.target.value) })}
                />
              </div>
            )}
            
            {selectedNode.type === 'leadSource' && (
              <div className="form-group">
                <label>Source</label>
                <select
                  value={selectedNode.data.source || 'Website'}
                  onChange={(e) => updateNodeData(selectedNode.id, { source: e.target.value })}
                >
                  <option value="Website">Website</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Referral">Referral</option>
                  <option value="Event">Event</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}
            
            <button onClick={() => setSelectedNode(null)}>Close Editor</button>
          </div>
        )}
      </ReactFlowProvider>
    </div>
  );
};

export default EmailFlow;