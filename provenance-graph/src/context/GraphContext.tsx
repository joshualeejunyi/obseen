import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { EdgeType, GraphInterface, NodeType } from "../interfaces/Interfaces";

interface GraphContextProps {
  nodeData: NodeType[];
  edgeData: EdgeType[];
  isLoading: boolean;
  error: boolean;
}

const GraphContext = createContext<GraphContextProps | undefined>(undefined);

export const GraphProvider = ({ children }: { children: React.ReactNode }) => {
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [edges, setEdges] = useState<EdgeType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      console.log("fetching");
      setIsLoading(true);
      axios
        .get("http://localhost:8000/graph")
        .then((response) => {
          console.log(response);
          const graphData: GraphInterface = response.data;
          setNodes(graphData.nodes);
          setEdges(graphData.edges);

          setIsLoading(false);
        })
        .catch((err) => {
          console.log("Error: " + err);
          setError(true);
          setIsLoading(false);
        });
    };

    fetchData();
  }, []);

  return (
    <GraphContext.Provider
      value={{ nodeData: nodes, edgeData: edges, isLoading, error }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export const useGraphData = () => {
  const context = useContext(GraphContext);
  if (context === undefined) {
    throw new Error("useGraphData must be used within a GraphProvider");
  }
  return context;
};
