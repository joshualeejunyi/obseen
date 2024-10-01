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
    """ Extracts detailed information, including syscall, file integrity, and network events """
   

    audit_data = log.get('auditd', {})
    process_data = log.get('process', {})
    file_data = log.get('file', {})
    network_data = log.get('network', {})
    destination_data = log.get('destination', {})
    
    # Process syscall-based logs
    syscall = audit_data.get('data', {}).get('syscall', 'N/A')
    pid = process_data.get('pid', 'N/A')
    ppid = process_data.get('parent', {}).get('pid', 'N/A')
    process_name = process_data.get('name', 'N/A')
    executable = process_data.get('executable', 'N/A')
    working_directory = process_data.get('working_directory', 'N/A')
    args = process_data.get('args', [])
    
    paths = audit_data.get('paths', [])
    file_paths = [path.get('name', 'N/A') for path in paths]

    # if "read" in repr(log):
    #     print(file_data)
    #     print(syscall)
    #     print(log)
    #     input()

    # Handle file integrity events
    file_path = file_data.get('path', 'N/A')
    file_owner = file_data.get('owner', 'N/A')
    file_group = file_data.get('group', 'N/A')
    file_mode = file_data.get('mode', 'N/A')
    file_size = file_data.get('size', 'N/A')
    file_hash = file_data.get('hash', {}).get('sha1', 'N/A')
    
    # Extract network-related details
    network_direction = network_data.get('direction', 'N/A')  # e.g., "ingress" or "egress"
    destination_ip = destination_data.get('ip', 'N/A')
    destination_port = destination_data.get('port', 'N/A')
    destination_path = destination_data.get('path', 'N/A')
    
    # Extract socket details (e.g., port, address)
    socket_info = audit_data.get('data', {}).get('socket', {})
    socket_port = socket_info.get('port', 'N/A')
    socket_addr = socket_info.get('addr', 'N/A')
    socket_family = socket_info.get('family', 'N/A')

    return {
        'syscall': syscall,
        'process': process_name,
        'pid': pid,
        'ppid': ppid,
        'executable': executable,
        'working_directory': working_directory,
        'args': args,
        'file_paths': file_paths,
        'file_path': file_path,
        'file_owner': file_owner,
        'file_group': file_group,
        'file_mode': file_mode,
        'file_size': file_size,
        'file_hash': file_hash,
        'network_direction': network_direction,
        'destination_ip': destination_ip,
        'destination_port': destination_port,
        'destination_path': destination_path,
        'socket_port': socket_port,
        'socket_addr': socket_addr,
        'socket_family': socket_family
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
        file_path = log.details.get('file_path')
        file_hash = log.details.get('file_hash')

        # Add process nodes and connections based on pid/ppid
        if pid != 'N/A' and ppid != 'N/A':
            if graph.has_node(pid):
                if 'logs' not in graph.nodes[pid]:
                    graph.nodes[pid]['logs'] = [log]
                else:
                    graph.nodes[pid]['logs'].append(log)
            else:
                graph.add_node(pid, process_name=process_name, ppid=ppid, logs=[log])

            if not graph.has_node(ppid):
                graph.add_node(ppid)
            graph.add_edge(ppid, pid)

        # # Add file-based connections if there's a file path
        # if file_path and file_path != 'N/A':
        #     # Add file node if it doesn't exist
        #     if not graph.has_node(file_path):
        #         graph.add_node(file_path, type="file", hash=file_hash)

        #     # Connect the process (pid) to the file node
        #     if pid != 'N/A':
        #         graph.add_edge(pid, file_path)

        # # Handle user-based connections
        # user_name = log.details.get('user', {}).get('name', 'N/A')
        # if user_name != 'N/A':
        #     if not graph.has_node(user_name):
        #         graph.add_node(user_name, type="user")
        #     if pid != 'N/A':
        #         graph.add_edge(user_name, pid)

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
