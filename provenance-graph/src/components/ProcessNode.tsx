import { Handle, Position } from "@xyflow/react";

import "../styles/ProcessNode.css";
import { Link } from "react-router-dom";
import { NodeInterface } from "../interfaces/Interfaces";

export function ProcessNode({ data, isConnectable }: NodeInterface) {
  return (
    <>
      <Link to={`/timeline/${data.label}`}>
      <div className="process-node">
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
        />
        <div>
          <h3>{data.processName || "unidentified"} ({data.label})</h3>
        </div>
        <Handle type="source" position={Position.Bottom} id="a" />
      </div>
      </Link>
    </>
  );
}
