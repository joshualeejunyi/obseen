import sys
import ndjson
import networkx as nx

TYPES = ["syscall"]

class LogNode:
    def __init__(self, timestamp, log_type, user, details):
        self.timestamp = timestamp
        self.log_type = log_type
        self.user = user
        self.details = details

    def __repr__(self):
        return f"Timestamp: {self.timestamp}, Type: {self.log_type}, User: {self.user}, Details: {self.details}"
    

class ProcessNode:
    def __init__(self, pid, ppid):
        self.pid = pid
        self.ppid = ppid
        self.logs = []

    def add_log(self, log):
        self.logs.append(log)

    def __eq__(self, other):
        return self.pid == other.pid
    
    def __hash__(self):
        return hash(self.pid)


def extract_user_info(log):
    """ Extracts user information from the log entry """
    user_info = log.get('user', {})
    return {
        'id': user_info.get('id'),
        'name': user_info.get('name'),
        'group': user_info.get('group', {}).get('name')
    }

def extract_details(log):
    """ Extracts detailed process, syscall, and file information """
    audit_data = log.get('auditd', {})
    process_data = log.get('process', {})
    syscall = audit_data.get('data', {}).get('syscall', 'N/A')
    pid = process_data.get('pid', 'N/A')
    ppid = process_data.get('parent', {}).get('pid', 'N/A')
    process_name = process_data.get('name', 'N/A')
    executable = process_data.get('executable', 'N/A')
    working_directory = process_data.get('working_directory', 'N/A')
    args = process_data.get('args', [])
    
    paths = audit_data.get('paths', [])
    file_paths = [path.get('name', 'N/A') for path in paths]

    return {
        'syscall': syscall,
        'process': process_name,
        'pid': pid,
        'ppid': ppid,
        'executable': executable,
        'working_directory': working_directory,
        'args': args,
        'file_paths': file_paths
    }

def parse_logs(log_file):
    """ Parses the log file and returns a list of LogNode objects """
    with open(log_file) as f:
        data = ndjson.load(f)

    logs = []
    for entry in data:
        log_type = entry.get('auditd', {}).get('message_type')
        if log_type in TYPES:
            timestamp = entry.get('@timestamp')
            user = extract_user_info(entry)
            details = extract_details(entry)
            logs.append(LogNode(timestamp, log_type, user, details))
    
    return logs


def build_connections(graph, parsed_logs):
    """ Build the provenance graph from parsed logs """
    for log in parsed_logs:
        pid = log.details['pid']
        ppid = log.details['ppid']
        process_name = log.details['process']

        if graph.has_node(pid):
            if "process_name" not in graph.nodes[pid].keys():
                graph.nodes[pid]["process_name"] = process_name

            if 'logs' not in graph.nodes[pid].keys():
                graph.nodes[pid]['logs'] = [log]
            else:
                graph.nodes[pid]['logs'].append(log)
        else:
            graph.add_node(pid, process_name=process_name, ppid=ppid, logs=[log])

        if ppid != 'N/A':
            if not graph.has_node(ppid):
                graph.add_node(ppid)
            graph.add_edge(ppid, pid)

    return graph


def print_graph(graph):
    """ Print the nodes and edges of the graph """
    print("\nNodes:")
    count = 1
    for node in graph.nodes(data=True):
        pid, attr = node
        print(f"============= {count} =============")
        print(f"pid: {pid}")
        if attr:
            ppid = attr["ppid"]
            logs = attr["logs"]
            print(f"ppid: {ppid}")
            for i, log in enumerate(logs):
                print(f"LOG #{i}: {log}")
        print(f"============= END {count} =============")
        input()
        count += 1
    print("\nEdges:")
    count = 1
    for edge in graph.edges():
        print(f"{count}: {edge}")
        count += 1


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <log file>")
        sys.exit(1)

    log_file = sys.argv[1]
    parsed_logs = parse_logs(log_file)

    provenance_graph = nx.DiGraph()
    provenance_graph = build_connections(provenance_graph, parsed_logs)

    print_graph(provenance_graph)
