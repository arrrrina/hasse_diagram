import { Graph } from '../core/Graph';
import { Edge } from '../core/Edge';
import { BuildingOstov } from './BuildingOstov';

export class CycleAndCutMatrix {

    public static buildCycleMatrix(graph: Graph<number, any>): {
        matrix: number[][],
        nodes: string[],
        edges: string[],
        chords: string[]
    } {
        if (!graph.isConnected()) {
            throw new Error("Граф должен быть связным для построения матрицы циклов");
        }

        const nodes = graph.nodes.map(node => node.id);
        const edges = graph.edges.map(edge => edge.id);

        const spanningTree = BuildingOstov.findMinimumSpanningTree(graph);
        const treeEdges = spanningTree.edges.map(edge => edge.id);
        
        const chords = edges.filter(edgeId => !treeEdges.includes(edgeId));
        
        const cycleMatrix: number[][] = [];

        for (const chordId of chords) {
            const chordEdge = graph.edges.find(e => e.id === chordId);
            if (!chordEdge) continue;

            const pathInTree = this.findPathInTree(spanningTree, chordEdge.source.id, chordEdge.target.id);
            const cycleEdges = [chordId, ...pathInTree];
            
            const cycleRow = this.buildMatrixRow(cycleEdges, edges);
            cycleMatrix.push(cycleRow);
        }

        return {
            matrix: cycleMatrix,
            nodes: nodes,
            edges: edges,
            chords: chords
        };
    }
    
    public static buildCutMatrix(graph: Graph<number, any>): {
        matrix: number[][],
        nodes: string[],
        edges: string[],
        treeEdges: string[]
    } {
        if (!graph.isConnected()) {
            throw new Error("Граф должен быть связным для построения матрицы разрезов");
        }

        const nodes = graph.nodes.map(node => node.id);
        const edges = graph.edges.map(edge => edge.id);

        const spanningTree = BuildingOstov.findMinimumSpanningTree(graph);
        const treeEdges = spanningTree.edges.map(edge => edge.id);
        
        const cutMatrix: number[][] = [];
        
        for (const treeEdgeId of treeEdges) {
            const treeEdge = spanningTree.edges.find(e => e.id === treeEdgeId);
            if (!treeEdge) continue;
            
            const cutEdges = this.findFundamentalCut(graph, spanningTree, treeEdge);
            const cutRow = this.buildMatrixRow(cutEdges, edges);
            cutMatrix.push(cutRow);
        }

        return {
            matrix: cutMatrix,
            nodes: nodes,
            edges: edges,
            treeEdges: treeEdges
        };
    }
    
    private static findPathInTree(
        tree: Graph<number, any>, 
        startId: string, 
        endId: string
    ): string[] {
        
        
        const residualGraph = this.treeToResidualGraph(tree);
        const path = this.bfsPath(residualGraph, startId, endId);

        return path;
    }
    
    private static treeToResidualGraph(tree: Graph<number, any>): Map<string, Map<string, number>> {
        const residualGraph = new Map<string, Map<string, number>>();

        for (const node of tree.nodes) {
            residualGraph.set(node.id, new Map());
        }

        for (const edge of tree.edges) {
            const u = edge.source.id;
            const v = edge.target.id;

            residualGraph.get(u)!.set(v, 1);
            residualGraph.get(v)!.set(u, 1);
        }

        return residualGraph;
    }
    
    private static bfsPath(
        graph: Map<string, Map<string, number>>,
        source: string,
        sink: string,
    ): string[] {
        const visited = new Set<string>();
        const parent = new Map<string, {prev: string, edgeId?: string}>();
        const queue: string[] = [source];
        visited.add(source);

        const edgeMap = this.createEdgeMapFromResidualGraph(graph);

        while (queue.length > 0) {
            const u = queue.shift()!;

            if (graph.has(u)) {
                for (const [v, capacity] of graph.get(u)!) {
                    if (!visited.has(v) && capacity > 0) {
                        visited.add(v);
                        
                        const edgeId = edgeMap.get(`${u}-${v}`) || edgeMap.get(`${v}-${u}`);
                        parent.set(v, {prev: u, edgeId});
                        queue.push(v);

                        if (v === sink) {
                            return this.reconstructPathFromBFS(parent, source, sink);
                        }
                    }
                }
            }
        }

        return [];
    }
    
    private static createEdgeMapFromResidualGraph(graph: Map<string, Map<string, number>>): Map<string, string> {
        const edgeMap = new Map<string, string>();
        
        for (const [u, neighbors] of graph.entries()) {
            for (const [v] of neighbors) {
                edgeMap.set(`${u}-${v}`, `${u}-${v}`);
            }
        }
        
        return edgeMap;
    }
    
    private static reconstructPathFromBFS(
        parent: Map<string, {prev: string, edgeId?: string}>,
        source: string,
        sink: string
    ): string[] {
        const path: string[] = [];
        let current = sink;
        
        while (current !== source) {
            const {prev, edgeId} = parent.get(current)!;
            if (edgeId) {
                path.unshift(edgeId);
            }
            current = prev;
        }

        return path;
    }
    
    private static findFundamentalCut(
        graph: Graph<number, any>, 
        spanningTree: Graph<number, any>, 
        treeEdge: Edge<number, any>
    ): string[] {
        const treeWithoutEdge = new Graph<number, any>(
            spanningTree.nodes,
            spanningTree.edges.filter(e => e.id !== treeEdge.id),
            false
        );
        
        const component1 = this.bfsComponent(treeWithoutEdge, treeEdge.source.id);
        const component2 = this.bfsComponent(treeWithoutEdge, treeEdge.target.id);
        
        const cutEdges: string[] = [treeEdge.id];
        
        for (const edge of graph.edges) {
            const sourceInComp1 = component1.has(edge.source.id);
            const targetInComp1 = component1.has(edge.target.id);
            const sourceInComp2 = component2.has(edge.source.id);
            const targetInComp2 = component2.has(edge.target.id);
            
            if ((sourceInComp1 && targetInComp2) || (sourceInComp2 && targetInComp1)) {
                if (edge.id !== treeEdge.id) {
                    cutEdges.push(edge.id);
                }
            }
        }
        
        return cutEdges;
    }
    
    private static bfsComponent(graph: Graph<number, any>, startId: string): Set<string> {
        const visited = new Set<string>();
        const queue: string[] = [startId];
        
        while (queue.length > 0) {
            const nodeId = queue.shift()!;
            
            if (visited.has(nodeId)) continue;
            visited.add(nodeId);
            
            const neighbors = this.getNeighbors(graph, nodeId);
            for (const neighborId of neighbors) {
                if (!visited.has(neighborId)) {
                    queue.push(neighborId);
                }
            }
        }
        
        return visited;
    }
    
    private static getNeighbors(graph: Graph<number, any>, nodeId: string): string[] {
        const neighbors: string[] = [];
        
        for (const edge of graph.edges) {
            if (edge.source.id === nodeId) {
                neighbors.push(edge.target.id);
            } else if (edge.target.id === nodeId) {
                neighbors.push(edge.source.id);
            }
        }
        
        return neighbors;
    }
    
    private static buildMatrixRow(activeEdges: string[], allEdges: string[]): number[] {
        const normalizedActiveEdges = activeEdges.map(edgeId => {
        const [node1, node2] = edgeId.split('-');

        const variant1 = `${node1}-${node2}`;
        const variant2 = `${node2}-${node1}`;

        if (allEdges.includes(variant1)) return variant1;
        if (allEdges.includes(variant2)) return variant2;
        return edgeId; 
        });
        
        return allEdges.map(edgeId => 
            normalizedActiveEdges.includes(edgeId) ? 1 : 0
        );
    }
}