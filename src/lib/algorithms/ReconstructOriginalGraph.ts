import { Graph } from "../core/Graph";
import { CheckLine } from "./CheckLine";
import { Node } from "../core/Node";
import { Edge } from "../core/Edge";

export class ReconstructOriginalGraph{
    public static reconstructOriginalGraph<T1, T2>(graph: Graph<T1, T2>): Graph<T1, T2> {
        if (!CheckLine.isLineGraph(graph)) {
            throw new Error("Граф не является реберным");
        }

        const maximalCliques = this.findMaximalCliques(graph);
        console.log("Найденные клики:", maximalCliques);
        
        const originalGraph = new Graph<T1, T2>();

        const cliqueToVertexMap = new Map<string[], string>();
        
        for (let i = 0; i < maximalCliques.length; i++) {
            const vertexId = String.fromCharCode(65 + i); 
            const node = new Node<T1>(vertexId, vertexId);
            originalGraph.addNode(node);
            cliqueToVertexMap.set(maximalCliques[i], vertexId);
        }

        const createdEdges = new Set<string>();
        const usedEdgeIds = new Set<string>();
        
        for (let i = 0; i < maximalCliques.length; i++) {
            for (let j = i + 1; j < maximalCliques.length; j++) {
                const cliqueA = maximalCliques[i];
                const cliqueB = maximalCliques[j];
                const intersection = cliqueA.filter(vertexId => cliqueB.includes(vertexId));

                if (intersection.length === 1) {
                    const vertexAId = cliqueToVertexMap.get(cliqueA)!;
                    const vertexBId = cliqueToVertexMap.get(cliqueB)!;
                    const edgeId = intersection[0];

                    const edgeKey = [vertexAId, vertexBId].sort().join('-');
                    if (!createdEdges.has(edgeKey)) {
                        originalGraph.addEdge(new Edge<T1, T2>(
                            edgeId,
                            originalGraph.getNode(vertexAId)!,
                            originalGraph.getNode(vertexBId)!
                        ));
                        createdEdges.add(edgeKey);
                        usedEdgeIds.add(edgeId);
                    }
                }
            }
        }
    
        if (this.isPathLike(graph) && originalGraph.getEdges().length < graph.nodes.length) {
            this.handlePathReconstruction(originalGraph, usedEdgeIds, graph);
        } else {
            this.validateReconstruction(originalGraph, usedEdgeIds, graph);
        }
            
        return originalGraph;
    }

    private static findMaximalCliques<T1, T2>(graph: Graph<T1, T2>): string[][] {
        const cliques: string[][] = [];
        const degreeMap = new Map<string, number>();
        

        for (const node of graph.nodes) {
            const neighbors = graph.getNeighbors(node);
            degreeMap.set(node.id, neighbors.length);
        }
        
        for (const [vertex, degree] of degreeMap) {
            if (degree === 0) {
                cliques.push([vertex]);
            }
        }
        
        const visitedEdges = new Set<string>();
        
        for (const edge of graph.edges) {
            const sourceId = edge.source.id;
            const targetId = edge.target.id;
            
            const edgeKey = [sourceId, targetId].sort().join('-');
            
            if (!visitedEdges.has(edgeKey) && graph.areAdjacent(sourceId, targetId)) {
                visitedEdges.add(edgeKey);
                
                const sourceNeighbors = graph.getNeighbors(edge.source);
                const targetNeighbors = graph.getNeighbors(edge.target);
                
                const commonNeighbors = sourceNeighbors.filter(n => 
                    n !== edge.target && targetNeighbors.includes(n)
                );
                
                if (commonNeighbors.length === 0) {
                    cliques.push([sourceId, targetId]);
                }
            }
        }
        
        return cliques;
    }
    
    private static isPathLike<T1, T2>(graph: Graph<T1, T2>): boolean {
        let degree1Count = 0;
        let degree2Count = 0;
        for (const node of graph.nodes) {
            const degree = graph.getNeighbors(node).length;
            if (degree === 1) degree1Count++;
            else if (degree === 2) degree2Count++;
            else return false;
        }
        return degree1Count === 2 && degree2Count === graph.nodes.length - 2;
    }
    
    private static handlePathReconstruction<T1, T2>(originalGraph: Graph<T1, T2>, usedEdgeIds: Set<string>, graph: Graph<T1, T2>): void {
        const missingEdgeIds = graph.nodes.map(n => n.id).filter(id => !usedEdgeIds.has(id));
        console.log("Недостающие рёбра для цепочки:", missingEdgeIds);
    
        if (missingEdgeIds.length === 0) return;
    
        const currentVertices = originalGraph.nodes;
        const currentEdges = originalGraph.getEdges();
        
        const endpoints = currentVertices.filter(vertex => {
            const degree = currentEdges.filter(edge => 
                edge.source.id === vertex.id || edge.target.id === vertex.id
            ).length;
            return degree === 1;
        });
    
        if (endpoints.length !== 2) {
            console.warn("Не могу найти концы цепочки, использую стандартный метод");
            this.validateReconstruction(originalGraph, usedEdgeIds, graph);
            return;
        }
    
        let currentEndpoint = endpoints[0];
        
        for (const edgeId of missingEdgeIds) {
            const newVertexId = String.fromCharCode(65 + currentVertices.length);
            const newNode = new Node<T1>(newVertexId, newVertexId);
            originalGraph.addNode(newNode);
            
            originalGraph.addEdge(new Edge<T1, T2>(
                edgeId,
                currentEndpoint,
                newNode
            ));
            
            currentEndpoint = newNode;
            
            console.log(`Добавлено ребро ${edgeId} между ${currentEndpoint.id} и ${newVertexId}`);
        }
    }
    
    private static validateReconstruction<T1, T2>(originalGraph: Graph<T1, T2>, usedEdgeIds: Set<string>, graph: Graph<T1, T2>): void {
        if (originalGraph.getEdges().length !== graph.nodes.length) {
            console.warn(`Несоответствие: ${originalGraph.getEdges().length} рёбер vs ${graph.nodes.length} вершин`);
            this.addMissingEdges(originalGraph, usedEdgeIds, graph);
        }
    }
    
    private static addMissingEdges<T1, T2>(originalGraph: Graph<T1, T2>, usedEdgeIds: Set<string>, graph: Graph<T1, T2>): void {
        const missingEdgeIds = graph.nodes.map(n => n.id).filter(id => !usedEdgeIds.has(id));
        
        for (const edgeId of missingEdgeIds) {
            const vertexIndex = missingEdgeIds.length;
            const vertexAId = String.fromCharCode(65 + vertexIndex);
            const vertexBId = String.fromCharCode(65 + vertexIndex + 1);
            
            const nodeA = new Node<T1>(vertexAId, vertexAId);
            const nodeB = new Node<T1>(vertexBId, vertexBId);
            
            originalGraph.addNode(nodeA);
            originalGraph.addNode(nodeB);
            
            originalGraph.addEdge(new Edge<T1, T2>(edgeId, nodeA, nodeB));
        }
    }
}