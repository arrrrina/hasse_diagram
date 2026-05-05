import { Graph } from "../core/Graph";



export class BuildingMatrix{
    public static buildHasseAdjacencyMatrix(graph: Graph<number, any>): { matrix: number[][], nodeValues: number[] } {
        if (!graph.nodes.every(node => typeof node.props === 'number')) {
            throw new Error("Все вершины должны содержать числовые значения в props");
        }

        const sortedNodes = [...graph.nodes].sort((a, b) => (a.props as number) - (b.props as number));
        const size = sortedNodes.length;
        const matrix: number[][] = Array.from({ length: size }, () => Array(size).fill(0));
    
        const nodeValues = sortedNodes.map(node => node.props as number);
    
        const nodeIndexMap = new Map<string, number>();
        sortedNodes.forEach((node, index) => {
            nodeIndexMap.set(node.id, index);
        });
    
        graph.edges.forEach(edge => {
            const fromIndex = nodeIndexMap.get(edge.source.id);
            const toIndex = nodeIndexMap.get(edge.target.id);
            
            if (fromIndex !== undefined && toIndex !== undefined) {
                matrix[fromIndex][toIndex] = 1;
            }
        });
    
        return { matrix, nodeValues };
    }

    public static buildHasseIncidenceMatrix(graph: Graph<number, any>): {
        matrix: number[][],
        vertices: number[],
        edges: string[]
    } {
        if (!graph.nodes.every(node => typeof node.props === 'number')) {
            throw new Error("Все вершины должны содержать числовые значения в props");
        }
    
        const sortedNodes = [...graph.nodes].sort((a, b) => (a.props as number) - (b.props as number));
        const sortedEdges = [...graph.edges].sort((a, b) =>
            (a.source.props as number) - (b.source.props as number) ||
            (a.target.props as number) - (b.target.props as number)
        );
    
        const nodeCount = sortedNodes.length;
        const edgeCount = sortedEdges.length;
        const matrix: number[][] = Array.from({ length: nodeCount }, () => Array(edgeCount).fill(0));

        const vertices = sortedNodes.map(node => node.props as number);
        
        const edges = sortedEdges.map(edge => 
            `${edge.source.props}-${edge.target.props}`
        );
    
        const nodeIndexMap = new Map<string, number>();
        sortedNodes.forEach((node, index) => {
            nodeIndexMap.set(node.id, index);
        });
    
        sortedEdges.forEach((edge, edgeIndex) => {
            const fromIndex = nodeIndexMap.get(edge.source.id);
            const toIndex = nodeIndexMap.get(edge.target.id);
    
            if (fromIndex !== undefined && toIndex !== undefined) {
                matrix[fromIndex][edgeIndex] = 1;
                matrix[toIndex][edgeIndex] = -1;
            }
        });
    
        return {
            matrix,
            vertices,
            edges
        };
    }

    public static getDistanceMatrix<T1, T2>(graph: Graph<T1, T2>): { matrix: number[][], nodeValues: number[] } {
        const sortedNodes = [...graph.nodes].sort((a, b) => (a.props as number) - (b.props as number));
        const size = sortedNodes.length;
        
        const matrix: number[][] = Array.from({ length: size }, () => Array(size).fill(-1));
        
        const nodeValues = sortedNodes.map(node => node.props as number);

        const idToIndex = new Map<string, number>();
        sortedNodes.forEach((node, index) => {
            idToIndex.set(node.id, index);
        });

        for (let i = 0; i < size; i++) {
            const queue: number[] = [i];
            matrix[i][i] = 0;

            while (queue.length > 0) {
                const currentIndex = queue.shift()!;
                const currentNode = sortedNodes[currentIndex];

                const neighbor = graph.getNeighbors(currentNode);
                const neighborIds = neighbor.map(node => node.id)
                
                for (const neighborId of neighborIds) {
                    const neighborIndex = idToIndex.get(neighborId);
                    
                    if (neighborIndex !== undefined && matrix[i][neighborIndex] === -1) {
                        matrix[i][neighborIndex] = matrix[i][currentIndex] + 1;
                        queue.push(neighborIndex);
                    }
                }
            }
        }
        return { matrix, nodeValues };
    }

    public static getRadius(matrix: number[][]): { radius: number, diameter: number }{

        const eccentricities: number[] = [];
        for (let i = 0; i < matrix.length; i++) {
            const eccentricity = Math.max(...matrix[i]);
            eccentricities.push(eccentricity);
        }

        const radius = Math.min(...eccentricities);

        const diameter = Math.max(...eccentricities);

        return { radius, diameter };
    }
}