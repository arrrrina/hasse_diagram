import { Graph } from "../core/Graph";
import { Node } from "../core/Node";

export class GraphConnectivity{
    
    //Нахождение реберной связности
    public static getEdgeConnectivity<T1, T2>(graph: Graph<T1, T2>): number {
        if (!graph.isConnected()) {
            return 0;
        }
        if (graph.nodes.length <= 1) return 0;

        const source = graph.nodes[0];
        let minEdgeConnectivity = Infinity;

        for (const targetNode of graph.nodes) {
            if (targetNode.id === source.id) continue;

            const residualGraph = this.createEdgeResidualGraph(graph);
            const maxFlow = this.edmondsKarp(residualGraph, source.id, targetNode.id);
            minEdgeConnectivity = Math.min(minEdgeConnectivity, maxFlow);

            if (minEdgeConnectivity === 1) break;
        }

        return minEdgeConnectivity;
    }



    private static createEdgeResidualGraph<T1, T2>(graph: Graph<T1, T2>): Map<string, Map<string, number>> {
        const residualGraph = new Map<string, Map<string, number>>();

        for (const node of graph.nodes) {
            residualGraph.set(node.id, new Map());
        }

        for (const edge of graph.edges) {
            const u = edge.source.id;
            const v = edge.target.id;

            residualGraph.get(u)!.set(v, 1);
            residualGraph.get(v)!.set(u, 1);
        }

        return residualGraph;
    }

    //Нахождение вершинной связности

    public static getVertexConnectivity<T1, T2>(graph: Graph<T1, T2>): number {
        if (!graph.isConnected()) {
            return 0;
        }

        if (graph.nodes.length <= 1) {
            return 0;
        }
        let minVertexConnectivity = graph.nodes.length - 1;


        for (const source of graph.nodes) {
            for (const target of graph.nodes) {
                if (target.id === source.id) continue;

                const residualGraph = this.createVertexResidualGraph(graph, source.id, target.id);
                const sourceIn = this.getInNodeId(source.id);
                const targetOut = this.getOutNodeId(target.id);
                
                const maxFlow = this.edmondsKarp(residualGraph, sourceIn, targetOut);
                minVertexConnectivity = Math.min(minVertexConnectivity, maxFlow);

                if (minVertexConnectivity === 0) break;
            }
        }       

        return minVertexConnectivity;
    }

    private static createVertexResidualGraph<T1, T2>(
        graph: Graph<T1, T2>,
        sourceId: string,
        sinkId: string
    ): Map<string, Map<string, number>> {
        const residualGraph = new Map<string, Map<string, number>>();

        // Создаем разделенные вершины для каждой исходной вершины
        for (const node of graph.nodes) {
            const inNode = this.getInNodeId(node.id);
            const outNode = this.getOutNodeId(node.id);

            // Инициализируем узлы
            residualGraph.set(inNode, new Map());
            residualGraph.set(outNode, new Map());

            // Добавляем внутреннее ребро in->out с capacity=1 (кроме source и sink)
            const capacity = (node.id === sourceId || node.id === sinkId) 
                ? Infinity 
                : 1;
            residualGraph.get(inNode)!.set(outNode, capacity);
        }

        // Добавляем исходные ребра как out->in
        for (const edge of graph.edges) {
            const u = edge.source.id;
            const v = edge.target.id;

            const uOut = this.getOutNodeId(u);
            const vIn = this.getInNodeId(v);
            const vOut = this.getOutNodeId(v);
            const uIn = this.getInNodeId(u);

            // Добавляем ребра в обе стороны
            residualGraph.get(uOut)!.set(vIn, Infinity);
            residualGraph.get(vOut)!.set(uIn, Infinity);
        }

        return residualGraph;
    }
    
    private static getInNodeId(originalId: string): string {
        return `${originalId}_in`;
    }

    private static getOutNodeId(originalId: string): string {
        return `${originalId}_out`;
    }


    //Общие методы
    private static edmondsKarp(
        residualGraph: Map<string, Map<string, number>>,
        source: string,
        sink: string,
    ): number {
        let maxFlow = 0;
        while (true) {
            const {path, minCapacity} = this.bfsAugmentingPath(residualGraph, source, sink);
            
            if (minCapacity === 0) break;

            this.updateResidualGraph(residualGraph, path, minCapacity);
            
            maxFlow += minCapacity;
        }
        
        return maxFlow;
    }

    private static bfsAugmentingPath(
        graph: Map<string, Map<string, number>>,
        source: string,
        sink: string,
    ): {path: string[], minCapacity: number} {
        const visited = new Set<string>();
        const parent = new Map<string, string>();
        const queue: string[] = [source];
        visited.add(source);

        while (queue.length > 0) {
            const u = queue.shift()!;

            if (graph.has(u)) {
                for (const [v, capacity] of graph.get(u)!) {
                    if (!visited.has(v) && capacity > 0) {
                        visited.add(v);
                        parent.set(v, u);
                        queue.push(v);

                        if (v === sink) {
                            return this.reconstructPath(parent, source, sink, graph);
                        }
                    }
                }
            }
        }

        return {path: [], minCapacity: 0};
    }

    private static reconstructPath(
        parent: Map<string, string>,
        source: string,
        sink: string,
        graph: Map<string, Map<string, number>>
    ): {path: string[], minCapacity: number} {
        const path: string[] = [sink];
        let current = sink;
        let minCapacity = Infinity;
        
        while (current !== source) {
            const prev = parent.get(current)!;
            const capacity = graph.get(prev)?.get(current) ?? 0;
            minCapacity = Math.min(minCapacity, capacity);
            path.unshift(prev);
            current = prev;
        }

        return {path, minCapacity};
    }

    private static updateResidualGraph(
        graph: Map<string, Map<string, number>>,
        path: string[],
        flow: number
    ): void {
        for (let i = 0; i < path.length - 1; i++) {
            const u = path[i];
            const v = path[i + 1];

            graph.get(u)!.set(v, graph.get(u)!.get(v)! - flow);
            
            if (!graph.get(v)!.has(u)) {
                graph.get(v)!.set(u, 0);
            }
            graph.get(v)!.set(u, graph.get(v)!.get(u)! + flow);
        }
    }



    
}