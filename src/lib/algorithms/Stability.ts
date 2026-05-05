import { Graph } from '../core/Graph';
import { Node } from '../core/Node'

export class Stability{
    public static findMaxInternalStableSet<T1, T2>(graph: Graph<T1, T2>): Node<T1>[] {
            let maxSet: Node<T1>[] = [];
            let bestSize = 0;
    
            const isStable = (nodes: Node<T1>[], nodeToAdd: Node<T1>): boolean => {
                for (let node of nodes) {
                    if (graph.getEdge(node, nodeToAdd) || graph.getEdge(nodeToAdd, node)) {
                        return false;
                    }
                }
                return true;
            };
    
            const branchAndBound = (start: number, current: Node<T1>[]) => {
                console.log(maxSet);
                if (current.length + (graph.nodes.length - start) <= bestSize) {
                    return;
                }
                
                if (current.length > bestSize) {
                    bestSize = current.length;
                    maxSet = [...current];
    
                }
    
                for (let i = start; i <graph.nodes.length; i++) {
                    const node = graph.nodes[i];
                    if (isStable(current, node)) {
                        
                        current.push(node);
                        branchAndBound(i + 1, current);
                        current.pop();
                    }  
                }
            };
    
            branchAndBound(0, []);
            return maxSet;
        }
    
    public static findExternalStabilityNegative<T1, T2>(graph: Graph<T1, T2>): Node<number>[] {
        const n = graph.nodes.length;
        const matrix = graph.findMatrix();
        const disjunctions: string[][] = [];

        for (let i = 0; i < n; i++) {
            const rowVars: string[] = [];
            for (let j = 0; j < n; j++) {
                if (matrix[i][j] === 1) {
                    rowVars.push(graph.nodes[j].id);
                }
            }
            disjunctions.push(rowVars);
        }

       const minimalSetIds = graph.findDNF(disjunctions)
       return graph.nodes.filter(n => minimalSetIds.has(n.id)) as Node<number>[];
    }

    public static findExternalStabilityPositive<T1, T2>(graph: Graph<T1, T2>): Node<number>[] {
        const n = graph.nodes.length;
        const matrix = graph.findMatrix();
        const disjunctions: string[][] = [];
 
        for (let j = 0; j < n; j++) {
            const colVars: string[] = [];
            for (let i = 0; i < n; i++) {
                if (matrix[i][j] === 1) {
                    colVars.push(graph.nodes[i].id);
                }
            }
            disjunctions.push(colVars);
        }

        const minimalSetIds = graph.findDNF(disjunctions)

        return graph.nodes.filter(n => minimalSetIds.has(n.id)) as Node<number>[];
    }

}