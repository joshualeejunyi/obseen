import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ReactFlow, Controls, Background, BackgroundVariant, Node, Edge, MiniMap } from '@xyflow/react';
import { useGraphData } from '../context/GraphContext';
import { LogInterface } from '../interfaces/Interfaces';

const TimelineView: React.FC = () => {
  const { processId } = useParams<{ processId: string }>();
  const { nodeData, isLoading, error } = useGraphData();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Find the process by ID
  const selectedProcess = nodeData.find(node => node[0].toString() === processId);

  useEffect(() => {
    if (!selectedProcess) return;

    const { logs } = selectedProcess[1];

    const nodeWidth = 150;
    const nodeHeight = 100;
    const gap = 200;

    // Create nodes for each log
    const flowNodes: Node[] = logs.map((log: LogInterface, index: number) => ({
      id: `log-${index}`,
      position: { x: index * gap, y: 100 }, // Horizontal layout
      data: {
        label: (
          <>
            <strong>{log.details.syscall}</strong>
            <p>Timestamp: {log.timestamp}</p>
            <p>Executable: {log.details.executable}</p>
            <p>User: {log.user.name}</p>
            {log.details.args.length > 0 && <p>Args: {log.details.args.join(', ')}</p>}
            {log.details.file_paths.length > 0 && <p>Files: {log.details.file_paths.join(', ')}</p>}
          </>
        ),
      },
      style: {
        width: nodeWidth,
        height: nodeHeight,
      },
    }));

    // Create edges between logs
    const flowEdges: Edge[] = logs.map((_, index) => {
      if (index === logs.length - 1) return null; // No edge after last node
      return {
        id: `edge-${index}-${index + 1}`,
        source: `log-${index}`,
        target: `log-${index + 1}`,
        type: 'smoothstep',
      };
    }).filter(Boolean) as Edge[];

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [selectedProcess]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading data...</div>;
  }

  if (!selectedProcess) {
    return <div>Process not found</div>;
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <h2>Timeline for {selectedProcess[1].process_name} (Process ID: {processId})</h2>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Lines} />
      </ReactFlow>
    </div>
  );
};

export default TimelineView;
