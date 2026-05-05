import { Graph } from "../core/Graph";

export class CheckLine{
    public static isLineGraph<T1, T2>(graph: Graph<T1, T2>): boolean {
        if (!graph.isConnected()) {
            const components = this.getConnectedComponents(graph);
            return components.every(comp => this.isLineGraph(comp));
        }

        if (this.containsClaw(graph)) {
            return false;
        }

        return true;
    }



    private static getConnectedComponents<T1, T2>(graph: Graph<T1, T2>): Graph<T1, T2>[] {
        const components: Graph<T1, T2>[] = [];
        const visited = new Set<string>();
        
        for (const node of graph.nodes) {
            if (!visited.has(node.id)) {
                const component = new Graph<T1, T2>();

                const queue: string[] = [node.id];
                visited.add(node.id);
                component.addNode(node);

                while (queue.length > 0) {
                    const currentId = queue.shift()!;
                    const neighbors = graph.getNeighborsById(currentId);

                    for (const neighborId of neighbors) {
                        if (!visited.has(neighborId.id)) {
                            visited.add(neighborId.id);
                            queue.push(neighborId.id);
                            
                            const neighborNode = graph.nodes.find(n => n.id === neighborId.id)!;
                            component.addNode(neighborNode);
                            
                            const edge = graph.edges.find(e => 
                                (e.source.id === currentId && e.target.id === neighborId.id) ||
                                (!graph.is_directed && e.source.id === neighborId.id && e.target.id === currentId)
                            )!;
                            component.addEdge(edge);
                        }
                    }
                }
                
                components.push(component);
            }
        }
        
        return components;
    }

    private static containsClaw<T1, T2>(graph: Graph<T1, T2>): boolean {
        for (const node of graph.nodes) {
            const neighbors = graph.getNeighbors(node);
            console.log(node.id)
            console.log(neighbors);
            if (neighbors.length >= 3) {
                for (let i = 0; i < neighbors.length; i++) {
                    for (let j = i + 1; j < neighbors.length; j++) {
                        for (let k = j + 1; k < neighbors.length; k++) {
                            const n1 = neighbors[i];
                            const n2 = neighbors[j];
                            const n3 = neighbors[k];
                            if (!graph.areAdjacent(n1.id, n2.id) &&
                                !graph.areAdjacent(n1.id, n3.id) &&
                                !graph.areAdjacent(n2.id, n3.id)) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }
    
}