import { Graph } from '../core/Graph';
import { Edge } from '../core/Edge';

export class HamiltonianGraph {

    public static getAddedEdgeIds(): string[] {
        return Array.from(this.addedEdgeIds);
    }

    private static addedEdgeIds: Set<string> = new Set();

    // Проверка, есть ли гамильтонов цикл
    public static isHamiltonian(graph: Graph<number, any>): boolean {
        if (graph.is_directed) throw new Error("Граф должен быть неориентированным");

        const nodes = graph.nodes.map(n => n.id);
        return this.hasHamiltonianCycle(graph, nodes);
    }

    // Находим минимальные рёбра для добавления
    public static makeHamiltonian(graph: Graph<number, any>): Graph<number, any> {
        if (graph.is_directed) throw new Error("Граф должен быть неориентированным");

        if (this.isHamiltonian(graph)) {
            return graph;
        }

        // Генерируем все возможные рёбра, которых нет в графе
        const possibleEdges: [string, string][] = [];
        const nodes = graph.nodes.map(n => n.id);

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                if (!graph.areAdjacent(nodes[i], nodes[j])) {
                    possibleEdges.push([nodes[i], nodes[j]]);
                }
            }
        }

        // Перебор всех комбинаций рёбер, начиная с 1,2,3.. и ищем гамильтонов цикл
        for (let k = 1; k <= possibleEdges.length; k++) {
            const combos = this.kCombinations(possibleEdges, k);

            for (const combo of combos) {
                const cloneGraph = graph.clone();

                const addedEdges: Edge<any, any>[] = [];
                for (const [a, b] of combo) {
                    const from = cloneGraph.getNode(a)!;
                    const to = cloneGraph.getNode(b)!;
                    const edgeId = `${a}-${b}-${Date.now()}`;
                    const edge = new Edge(edgeId, from, to, undefined, null, { highlightClass: "hamilton-highlight" } );
                    cloneGraph.addEdge(edge);
                    addedEdges.push(edge);
                    this.addedEdgeIds.add(edgeId);
                }

                if (this.isHamiltonian(cloneGraph)) {
                    return cloneGraph;
                }
            }
        }

        throw new Error("Не удалось сделать граф Гамильтоновым");
    }

    // Проверка гамильтонова цикла (полный перебор)
    private static hasHamiltonianCycle(graph: Graph<number, any>, nodes: string[]): boolean {
        const n = nodes.length;

        function backtrack(path: string[]): boolean {
            if (path.length === n) {
                // Проверяем, есть ли ребро от последней до первой вершины
                return graph.areAdjacent(path[path.length - 1], path[0]);
            }

            for (const node of nodes) {
                if (path.includes(node)) continue;
                if (path.length === 0 || graph.areAdjacent(path[path.length - 1], node)) {
                    path.push(node);
                    if (backtrack(path)) return true;
                    path.pop();
                }
            }

            return false;
        }

        return backtrack([]);
    }

    // Генерация всех комбинаций длины k
    private static kCombinations<T>(arr: T[], k: number): T[][] {
        const result: T[][] = [];

        function backtrack(start: number, combo: T[]) {
            if (combo.length === k) {
                result.push([...combo]);
                return;
            }

            for (let i = start; i < arr.length; i++) {
                combo.push(arr[i]);
                backtrack(i + 1, combo);
                combo.pop();
            }
        }

        backtrack(0, []);
        return result;
    }
}
