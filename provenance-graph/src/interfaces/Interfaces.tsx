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
    syscall: string;
    process: string;
    executable: string;
    working_directory: string;
    args: string[];
    file_paths: string[];
}

export interface LogInterface {
    timestamp: string;
    log_type: string;
    user: UserInterface;
    details: LogDetails;
}