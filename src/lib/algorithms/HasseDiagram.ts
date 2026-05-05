import { Edge } from "../core/Edge";
import { Graph } from "../core/Graph";
import { Node } from "../core/Node";
import { CycleAnalysis } from "../algorithms/CycleAnalysis";

export class HasseDiagram{
    public static buildHasseDivisionDiagram(graph: Graph<number, any>): Graph<number, any> {
            if (!CycleAnalysis.isAcyclic(graph)) {
                throw new Error("Граф содержит циклы");
            }
        
            if (!graph.nodes.every(node => typeof node.props === 'number')) {
                throw new Error("Все вершины должны содержать числовые значения в props");
            }
        
            const numberNodes = graph.nodes as unknown as Node<number>[];
            const sortedNodes = [...graph.nodes].sort((a, b) => {
                if (typeof a.props !== 'number' || typeof b.props !== 'number') {
                    throw new Error("Node props must be numbers");
                }
                return a.props - b.props;
            });
            
        
            const hasseGraph = new Graph<number, any>(
                numberNodes,
                [],
                true
            );
            const divisionComparator = (a: unknown, b: unknown): boolean => {
                if (typeof a !== 'number' || typeof b !== 'number') return false;
                return b % a === 0;
            };
            
            for (let i = 0; i < sortedNodes.length; i++) {
                const a = sortedNodes[i];
                for (let j = i + 1; j < sortedNodes.length; j++) {
                    const b = sortedNodes[j];
                    if (a === b || a.props === undefined || b.props === undefined) continue;
                    
                    if (divisionComparator(a.props, b.props) && !divisionComparator(b.props, a.props)) {
                        let isCoverRelation = true;
        
                        for (const c of numberNodes) {
                            if (c === a || c === b || c.props === undefined) continue;
                            
                            if (divisionComparator(a.props, c.props) && divisionComparator(c.props, b.props)) {
                                isCoverRelation = false;
                                break;
                            }
                        }
        
                        if (isCoverRelation) {
                            hasseGraph.addEdge(new Edge<number, any>(
                                `${a.id}-${b.id}`,
                                a,
                                b,
                                "#000",
                                null
                            ));
                        }
                    }
                }
            }

            return hasseGraph;
        }
}