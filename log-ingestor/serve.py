import sys
import parser
import networkx as nx

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import uvicorn

import parser

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

provenance_graph = nx.DiGraph()

@app.get("/graph")
def get_graph():
    nodes = list(provenance_graph.nodes(data=True))
    edges = list(provenance_graph.edges())
    return {"nodes": nodes, "edges": edges}


def start(log_file):
    parsed_logs = parser.parse_logs(log_file)
    global provenance_graph 
    provenance_graph = parser.build_connections(provenance_graph, parsed_logs)

    uvicorn.run(app, host="0.0.0.0", port=8000)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <log file>")
        sys.exit(1)

    log_file = sys.argv[1]
    start(log_file)