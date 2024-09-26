import { useEffect, useMemo, useState } from 'react';
import { Background, BackgroundVariant, Controls, Edge, MiniMap, Node, ReactFlow } from '@xyflow/react';
 
import { ProcessNode } from '../components/ProcessNode';

import '@xyflow/react/dist/style.css';
import { useGraphData } from '../context/GraphContext';
import { EdgeType, NodeType } from '../interfaces/Interfaces';

const calculateTreeLayout = (nodes: NodeType[], edges: EdgeType[]) => {
  const positions: Record<number, { x: number; y: number }> = {};
  const visited: Set<number> = new Set();
  
  // Dynamically find the root node
  const parentNodes = new Set(edges.map(edge => edge[1]));
  const rootNodes = nodes.filter(node => !parentNodes.has(node[0]));
  const ROOT_NODE = rootNodes.length > 0 ? rootNodes[0][0] : nodes[0][0];

  // Node dimensions
  const nodeWidth = 150;
  const nodeHeight = 250;

  // Buffer space between nodes (horizontal and vertical)
  const horizontalSpacing = 50;
  const verticalSpacing = 100;

  // Calculate the subtree width recursively
  const getSubtreeWidth = (nodeId: number): number => {
    const children = edges
      .filter(edge => edge[0] === nodeId)
      .map(edge => edge[1]);

    // If no children, base width is the nodeWidth
    if (children.length === 0) {
      return nodeWidth + horizontalSpacing; // Add buffer space for a single node
    }

    // Otherwise, the width is the sum of the children's subtree widths
    let totalWidth = 0;
    children.forEach(child => {
      totalWidth += getSubtreeWidth(child);
    });

    // Return total width including spacing between children
    return Math.max(totalWidth, nodeWidth + horizontalSpacing);
  };

  // Recursive function to position nodes
  const calculatePositions = (currentNode: number, x: number, y: number) => {
    if (visited.has(currentNode)) return;
    visited.add(currentNode);
    positions[currentNode] = { x, y };

    const children = edges
      .filter(edge => edge[0] === currentNode)
      .map(edge => edge[1]);

    if (children.length === 0) return;

    // Calculate total width of children
    const totalSubtreeWidth = getSubtreeWidth(currentNode);

    // Start positioning children from the leftmost position
    let currentX = x - totalSubtreeWidth / 2;

    children.forEach(child => {
      const childSubtreeWidth = getSubtreeWidth(child);

      // Position the child node at the currentX + half its subtree width, and move down by nodeHeight + verticalSpacing
      calculatePositions(child, currentX + childSubtreeWidth / 2, y + nodeHeight + verticalSpacing);
      
      // Move currentX to the right by the width of the child's subtree, plus horizontalSpacing
      currentX += childSubtreeWidth + horizontalSpacing;
    });
  };

  // Start layout calculation from the root node
  calculatePositions(ROOT_NODE, 500, 100);

  // Ensure all nodes are positioned
  let isolatedY = 200;
  nodes.forEach(node => {
    const nodeId = node[0];
    if (!positions[nodeId]) {
      positions[nodeId] = { x: Math.random() * 400, y: isolatedY };
      isolatedY += nodeHeight + 150;
    }
  });

  return positions;
};

const ProcessView = () => {
  const nodeTypes = useMemo(() => ({ processNode: ProcessNode }), []);
  const { nodeData, edgeData, isLoading, error } = useGraphData();
  const [graphNodes, setGraphNodes] = useState<Node[]>([]);
  const [graphEdges, setGraphEdges] = useState<Edge[]>([]);

  useEffect(() => {
    if (isLoading) return;

    const positions = calculateTreeLayout(nodeData, edgeData);
    const graphNodes: Node[] = nodeData.map((currentNode: NodeType) => {
      console.log(currentNode);
      return {
        id: currentNode[0].toString(),
        type: "processNode",
        position: {
          x: positions[currentNode[0]].x,
          y: positions[currentNode[0]].y
        },
        data: {
          label: currentNode[0].toString(),
          processName: currentNode[1].process_name,
          logs: currentNode[1].logs,
        },
      }
    });
    
    const graphEdges: Edge[] = edgeData.map((currentEdge: EdgeType) => (
      {
        id: `edge${currentEdge[0]}-${currentEdge[1]}`,
        source: currentEdge[0].toString(),
        target: currentEdge[1].toString(),
      }
    ));
    
    setGraphNodes(graphNodes);
    setGraphEdges(graphEdges);
}, [nodeData, edgeData]);

  if (isLoading) {
    return (
      <div className="loader-container">
        <div className="loader">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="">Sorry, an error has occurred.</div>
      </div>
    )
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div>
        <h1>
          Process Tree View
        </h1>
      </div>
      <ReactFlow nodes={graphNodes} edges={graphEdges} nodeTypes={nodeTypes}>
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={10} size={1} />
      </ReactFlow>
    </div>
  );
};

export default ProcessView;