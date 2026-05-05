import { Graph } from '../core/Graph';
import { Edge } from '../core/Edge';

export class EulerGraph {
    public static getAddedEdgeIds(): string[] {
        return Array.from(this.addedEdgeIds);
    }

    private static addedEdgeIds: Set<string> = new Set();
    public static makeEulerian(graph: Graph<any, any>) {
        if (graph.is_directed || !graph.isConnected()) {
            throw new Error("Граф должен быть связным и неориентированным");
        }

        this.addedEdgeIds.clear();
        this.addEulerEdges(graph);

        if (!this.checkIfEulerian(graph)) {
            throw new Error("Не удалось сделать граф эйлеровым");
        }

        return graph;
    }

    public static checkIfEulerian(graph: Graph<any, any>): boolean {
        if (graph.is_directed) return false;
        if (!graph.isConnected()) return false;
        return this.findOddVertices(graph).length === 0;
    }

    

    private static findOddVertices(graph: Graph<any, any>): string[] {
        return graph.nodes
            .filter(n => graph.getIncidentEdges(n.id).length % 2 !== 0)
            .map(n => n.id);
    }

    

    private static addEulerEdges(graph: Graph<any, any>) {
        const oddVertices = this.findOddVertices(graph);
        if (oddVertices.length === 0) {
            return;
        }

        const remaining = [...oddVertices];
        const pairs: [string, string][] = [];

        // Жадно попарно соединяем вершины нечётной степени.
        // Это O(k^2), где k — число нечётных вершин, и не приводит к взрывному перебору.
        while (remaining.length > 1) {
            const u = remaining.shift()!;
            let partnerIdx = remaining.findIndex(v => !graph.areAdjacent(u, v));
            if (partnerIdx === -1) {
                partnerIdx = 0;
            }
            const v = remaining.splice(partnerIdx, 1)[0];
            pairs.push([u, v]);
        }

        for (const [a, b] of pairs) {
            const from = graph.getNode(a)!;
            const to = graph.getNode(b)!;
            const edgeId = `euler-${a}-${b}-${this.addedEdgeIds.size}`;
            graph.addEdge(new Edge(edgeId, from, to));
            this.addedEdgeIds.add(edgeId);
        }
    }
}

