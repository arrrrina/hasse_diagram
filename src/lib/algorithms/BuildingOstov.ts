import { Node } from "../core/Node";
import { Edge } from "../core/Edge";
import { Graph } from "../core/Graph";

export class BuildingOstov {

    public static findMinimumSpanningTree(graph: Graph<number, any>): Graph<number, any> {
        if (graph.nodes.length === 0) {
            throw new Error("Граф пустой");
        }
        
        if (!graph.isConnected()) {
            throw new Error("Граф не является связным");
        }
  
        const edgesWithWeights = graph.edges.filter(edge => 
            edge.props && (edge.props as any).weight !== undefined
        );
        
        if (edgesWithWeights.length === 0) {
            throw new Error("У рёбер графа отсутствуют веса. Сначала добавьте веса.");
        }
        
        const sortedEdges = [...graph.edges].sort((a, b) => {
            const weightA = (a.props as any).weight;
            const weightB = (b.props as any).weight;
            return weightA - weightB;
        });
        
        const mstEdges: Edge<number, any>[] = [];
        const parent = new Map<string, string>();
        const rank = new Map<string, number>();
        
        graph.nodes.forEach(node => {
            parent.set(node.id, node.id);
            rank.set(node.id, 0);
        });
        
        const find = (nodeId: string): string => {
            if (parent.get(nodeId) !== nodeId) {
                parent.set(nodeId, find(parent.get(nodeId)!));
            }
            return parent.get(nodeId)!;
        };
        
        const union = (nodeId1: string, nodeId2: string): void => {
            const root1 = find(nodeId1);
            const root2 = find(nodeId2);
            
            if (root1 !== root2) {
                if (rank.get(root1)! < rank.get(root2)!) {
                    parent.set(root1, root2);
                } else if (rank.get(root1)! > rank.get(root2)!) {
                    parent.set(root2, root1);
                } else {
                    parent.set(root2, root1);
                    rank.set(root1, rank.get(root1)! + 1);
                }
            }
        };
        
        for (const edge of sortedEdges) {
            const sourceId = (edge.source as Node<number>).id;
            const targetId = (edge.target as Node<number>).id;

            if (find(sourceId) !== find(targetId)) {
                mstEdges.push(edge);
                union(sourceId, targetId);
                
                if (mstEdges.length === graph.nodes.length - 1) {
                    break;
                }
            }
        }
        
        if (mstEdges.length !== graph.nodes.length - 1) {
            throw new Error("Не удалось построить остовное дерево");
        }
        
        const newNodes: Node<number>[] = graph.nodes.map(node => 
            new Node<number>(
                node.id,
                node.label || node.id,
                node.color,
                node.weight,
                (node as Node<number>).props
            )
        );
        console.log(Graph.createWeightedGraph(newNodes, mstEdges, false));
        return Graph.createWeightedGraph(newNodes, mstEdges, false);
    }
    
    public static getMSTTotalWeight(mst: Graph<number, any>): number {
        return mst.edges.reduce((total, edge) => {
            return total + ((edge.props as any).weight || 0);
        }, 0);
    }

    private static getEdgesFromNode(graph: Graph<number, any>, node: Node<number>): Edge<number, any>[] {
        return graph.edges.filter(edge => 
            (edge.source as Node<number>).id === node.id || 
            (edge.target as Node<number>).id === node.id
        );
    }
    
    private static getEdgeWeight(edge: Edge<number, any>): number | null {
        if (edge.props && (edge.props as any).weight !== undefined) {
            return (edge.props as any).weight;
        }
        return null;
    }

    public static dijkstraShortestPaths(graph: Graph<number, any>, startNode: Node<number>): Map<string, number> {
        const distances = new Map<string, number>();
        const visited = new Set<string>();
        
        graph.nodes.forEach(node => {
            distances.set(node.id, Infinity);
        });
        distances.set(startNode.id, 0);
        
        while (visited.size < graph.nodes.length) {
            let currentNode: Node<number> | null = null;
            let minDistance = Infinity;
            
            for (const node of graph.nodes) {
                if (!visited.has(node.id)) {
                    const distance = distances.get(node.id)!;
                    if (distance < minDistance) {
                        minDistance = distance;
                        currentNode = node as Node<number>;
                    }
                }
            }
            
            if (!currentNode || minDistance === Infinity) {
                break;
            }

            visited.add(currentNode.id);
            
            const edgesFromNode = BuildingOstov.getEdgesFromNode(graph, currentNode);
            
            for (const edge of edgesFromNode) {
                const sourceNode = edge.source as Node<number>;
                const targetNode = edge.target as Node<number>;
                
                const neighbor = sourceNode.id === currentNode.id ? targetNode : sourceNode;
                
                if (!visited.has(neighbor.id)) {
                    const weight = BuildingOstov.getEdgeWeight(edge);
                    if (weight !== null) {
                        const currentDistance = distances.get(currentNode.id)!;
                        const neighborDistance = distances.get(neighbor.id)!;
                        const newDistance = currentDistance + weight;
                        
                        if (newDistance < neighborDistance) {
                            distances.set(neighbor.id, newDistance);
                        }
                    }
                }
            }
        }
        
        return distances;
    }
}