import { Edge, Node } from "@xyflow/react";

export interface NodeInterface {
    process_name: string;
    ppid: number;
    logs: LogInterface[];
}

export type NodeType = [
    number,
    NodeInterface,
];

export type EdgeType = [
    number,
    number,
];

export interface GraphInterface {
    nodes: NodeType[];
    edges: EdgeType[];
}

export interface GraphData {
    nodes: Node[];
    edges: Edge[];
}

export interface UserInterface {
    id: string;
    name: string;
    group: string;
}

export interface LogDetails {
    syscall: string;                     // Name of the syscall (e.g., "open", "connect")
    process: string;                     // Name of the process
    executable: string;                  // Path to the executable
    working_directory?: string;          // Working directory of the process (optional, may not be present)
    args: string[];                      // Command-line arguments for the process
    file_paths: string[];                // List of file paths involved in the syscall
    file_path: string;                  // Primary file path (optional for non-file-related syscalls)
    file_owner: string;                 // Owner of the file (optional)
    file_group: string;                 // Group of the file (optional)
    file_mode: string;                  // Mode/permissions of the file (optional)
    file_size: number;                  // Size of the file in bytes (optional, represented as number)
    file_hash: string;                  // Hash (SHA1 or other) of the file (optional)

    // Network-related fields
    network_direction?: 'ingress' | 'egress';  // Network direction (optional, either ingress or egress)
    destination_ip: string;             // Destination IP address (optional, for network syscalls)
    destination_port: string;           // Destination port (optional, as a number)
    destination_path: string;           // Destination port (optional, as a number)
    
    // Socket-related fields
    socket_port: number;                // Socket port (optional, as a number)
    socket_addr: string;                // Socket address (IP address) (optional)
    socket_family?: 'ipv4' | 'ipv6';     // Socket family (optional, 'ipv4' or 'ipv6')
}

export interface LogInterface {
    timestamp: string;
    log_type: string;
    user: UserInterface;
    details: LogDetails;
}

export interface DataInterface {
    processName: string;
    label: string;
    logs: string[];
  };
  
export interface NodeInterface {
    data: DataInterface;
    isConnectable: boolean;
}

export interface TimelineNodeProps {
    log: LogInterface;
    index: number;
    nodeWidth: number;
    nodeHeight: number;
    gap: number;
}