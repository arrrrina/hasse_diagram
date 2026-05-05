import { Graph } from '../core/Graph';


export class CycleAnalysis{
    public static isAcyclic<T1, T2>(graph: Graph<T1, T2>): boolean {
        const visited = new Set<string>();
        const recursionStack = new Set<string>();

        for (const node of graph.nodes) {
            if (this._isCyclicUtil(graph, node.id, visited, recursionStack)) {
                return false;
            }
        }
        return true;
    }

    private static _isCyclicUtil<T1, T2>(
        graph: Graph<T1, T2>, 
        nodeId: string, 
        visited: Set<string>, 
        recursionStack: Set<string>
    ): boolean {
        if (recursionStack.has(nodeId)) return true;
        if (visited.has(nodeId)) return false;

        visited.add(nodeId);
        recursionStack.add(nodeId);

        const node = graph.getNode(nodeId);
        if (node) {
            const adjNodes = graph.getAdjNodes(node);
            for (const adjNode of adjNodes) {
                if (this._isCyclicUtil(graph, adjNode.id, visited, recursionStack)) {
                    return true;
                }
            }
        }

        recursionStack.delete(nodeId);
        return false;
    }

}