import { Edge } from "../core/Edge";
import { Graph } from "../core/Graph";
import { Node } from "../core/Node";

export class BlockFinder<T1, T2> {

    findBlocks(graph: Graph<T1, T2>): Graph<T1, T2>[] {
        const vertexBlocks = this.findVertexBlocks(graph);
        console.log("Found blocks:", vertexBlocks);
        return this.convertToGraphs(vertexBlocks, graph);
    }

    private findVertexBlocks(graph: Graph<T1, T2>): Node<T1>[][] {
        const visited = new Map<Node<T1>, boolean>();
        const discovery = new Map<Node<T1>, number>();
        const low = new Map<Node<T1>, number>();
        const parent = new Map<Node<T1>, Node<T1> | null>();
        const stack: Edge<T1, T2>[] = [];
        const blocks: Node<T1>[][] = [];
        let time = 0;

        const dfs = (v: Node<T1>) => {
            // Инициализация
            visited.set(v, true);
            discovery.set(v, time);
            low.set(v, time);
            time++;
        
            for (const u of graph.getNeighbors(v)) {
                if (!visited.get(u)) {
                    parent.set(u, v);

                    
                    const edge = graph.getEdge(v, u);
                    stack.push(edge!);
                    
                    dfs(u);

                    // Обновляем low value для v
                    low.set(v, Math.min(low.get(v)!, low.get(u)!));

                    // Если u является потомком v и low[u] >= discovery[v],
                    // то v - точка сочленения, и мы нашли блок
                    if (low.get(u)! >= discovery.get(v)!) {
                        const blockEdges: Edge<T1, T2>[] = [];
                        let e: Edge<T1, T2>;

                        do {
                            e = stack.pop()!;
                            blockEdges.push(e);
                        } while (
                            !(
                                (e.source === v && e.target === u) ||
                                (e.source === u && e.target === v)
                            )
                        );

                        // преобразуем рёбра → вершины
                        const blockNodes = new Set<Node<T1>>();
                        for (const be of blockEdges) {
                            blockNodes.add(be.source);
                            blockNodes.add(be.target);
                        }

                        blocks.push([...blockNodes]);
                    }
                    } else if  (
                        u !== parent.get(v) &&
                        discovery.get(u)! < discovery.get(v)!
                    ) {
                        low.set(v, Math.min(low.get(v)!, discovery.get(u)!));
                        stack.push(graph.getEdge(v, u)!);
                    }
            }
        };

        // Инициализация и запуск DFS для всех компонент связности
        graph.nodes.forEach(node => {
            if (!visited.get(node)) {
                parent.set(node, null);
                dfs(node);
                
                if (stack.length > 0) {
                    const blockNodes = new Set<Node<T1>>();
                    while (stack.length > 0) {
                        const e = stack.pop()!;
                        blockNodes.add(e.source);
                        blockNodes.add(e.target);
                    }
                    blocks.push([...blockNodes]);
                }
            }
        });

        return blocks;
    }

    private convertToGraphs(
        vertexBlocks: Node<T1>[][], 
        originalGraph: Graph<T1, T2>
    ): Graph<T1, T2>[] {
        return vertexBlocks.map((blockNodes) => {
            const nodeSet = new Set(blockNodes);
            const blockGraph = new Graph<T1, T2>();

            // Добавляем узлы
            blockNodes.forEach(node => {
                blockGraph.addNode(node);
            });
            
            // Добавляем рёбра
            originalGraph.edges.forEach(edge => {
                if (nodeSet.has(edge.source) && nodeSet.has(edge.target)) {
                    blockGraph.addEdge(edge);
                }
            });

            return blockGraph;
        });
    }

    findBlocksWithArticulationPoints(graph: Graph<T1, T2>): {
        blocks: Graph<T1, T2>[];
        articulationPoints: Node<T1>[];
    } {
        const blocks = this.findBlocks(graph);
        const articulationPoints = this.findArticulationPoints(graph);
        
        return { blocks, articulationPoints };
    }

    private findArticulationPoints(graph: Graph<T1, T2>): Node<T1>[] {
        const visited = new Map<Node<T1>, boolean>();
        const discovery = new Map<Node<T1>, number>();
        const low = new Map<Node<T1>, number>();
        const parent = new Map<Node<T1>, Node<T1> | null>();
        const articulationPoints = new Set<Node<T1>>();
        let time = 0;

        const dfs = (v: Node<T1>) => {
            visited.set(v, true);
            discovery.set(v, time);
            low.set(v, time);
            time++;
            
            let children = 0;

            for (const u of graph.getNeighbors(v)) {
                if (!visited.get(u)) {
                    parent.set(u, v);
                    children++;
                    dfs(u);

                    low.set(v, Math.min(low.get(v)!, low.get(u)!));

                    // v - точка сочленения, если:
                    // 1. v - корень и имеет >1 потомка
                    // 2. v - не корень и low[u] >= discovery[v]
                    if (parent.get(v) === null && children > 1) {
                        articulationPoints.add(v);
                    }
                    if (parent.get(v) !== null && low.get(u)! >= discovery.get(v)!) {
                        articulationPoints.add(v);
                    }
                } else if (u !== parent.get(v)) {
                    low.set(v, Math.min(low.get(v)!, discovery.get(u)!));
                }
            }
        };

        graph.nodes.forEach(node => {
            if (!visited.get(node)) {
                parent.set(node, null);
                dfs(node);
            }
        });
        
        return Array.from(articulationPoints);
    }
}