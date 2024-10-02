import { Node, Position } from "@xyflow/react";
import { TimelineNodeProps } from "../interfaces/Interfaces";


const TimelineNode = ({ log, index, nodeWidth, nodeHeight, gap }: TimelineNodeProps): Node => {
  let nodeLabel;
  let nodeStyle = { width: nodeWidth, height: nodeHeight, backgroundColor: "", borderRadius: "" };
  let backgroundColor = "lightgray"; // Default background color

  // Customize based on the syscall type or event type
  if (["open", "read", "write", "openat"].includes(log.details.syscall)) {
    // File access event
    nodeLabel = (
      <>
        <strong>File Access</strong>
        <p>Syscall: {log.details.syscall}</p>
        <p>File: {log.details.file_path}</p>
        <p>File Size: {log.details.file_size}</p>
        <p>Mode: {log.details.file_mode}</p>
        <p>User: {log.user.name}</p>
      </>
    );
    backgroundColor = "#f1c40f"; // Yellow for file access
  } else if (["connect", "sendto", "recvfrom"].includes(log.details.syscall)) {
    // Network connection event
    nodeLabel = (
      <>
        <strong>Network Connection</strong>
        <p>Syscall: {log.details.syscall}</p>
        <p>Direction: {log.details.network_direction}</p>
        {(log.details.destination_ip !== "N/A" || log.details.destination_port !== "N/A") && (
          <>
            <p>Destination IP: {log.details.destination_ip}</p>
            <p>Port: {log.details.destination_port}</p>
          </>
        )}
        {log.details.destination_path !== "N/A" && <p>Path: {log.details.destination_path}</p>}
        <p>User: {log.user.name}</p>
      </>
    );
    backgroundColor = "#3498db"; // Blue for network connections
  } else if (["execve"].includes(log.details.syscall)) {
    nodeLabel = (
      <>
        <strong>Create Process</strong>
        <p>{log.details.executable}</p>
        <p>{log.details.args}</p>

        {/* <p>{log.details.}</p> */}
      </>
    )
    backgroundColor = "#ffcccb"; // Light red

  } else {
    // Other syscalls
    nodeLabel = (
      <>
        <strong>{log.details.syscall}</strong>
        <p>Timestamp: {log.timestamp}</p>
        <p>Executable: {log.details.executable}</p>
        <p>User: {log.user.name}</p>
        {log.details.args.length > 0 && <p>Args: {log.details.args.join(", ")}</p>}
      </>
    );
    backgroundColor = "#95a5a6"; // Gray for general syscalls
  }

  // Customize node style based on the type of event
  nodeStyle = {
    ...nodeStyle,
    backgroundColor: backgroundColor,
    borderRadius: log.details.syscall === "connect" ? "30%" : "0%", // Circular for network events, rectangular for others
  };

  // Return the node structure
  return {
    id: `log-${index}`,
    position: { x: index * gap, y: 100 }, // Horizontal layout
    data: { label: nodeLabel },
    style: nodeStyle,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  };
};

export default TimelineNode;
