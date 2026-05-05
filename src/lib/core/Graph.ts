
import { Node } from './Node';
import { Edge } from './Edge';



const ERROR_MSG_INCORRECT_TYPES = "Incorrect input types!"


interface IGraph<T1, T2> {
    nodes: Node<T1>[]
    edges: Edge<T1, T2>[]
    is_directed: boolean
}


export class Graph<T1, T2> implements IGraph<T1, T2> {
    cloneGraph() {
        throw new Error('Method not implemented.');
    }

    private _nodes: Node<T1>[] = []
    private _edges: Edge<T1, T2>[] = []
    private _is_directed: boolean = false

    constructor(nodes?: Node<T1>[], edges?: Edge<T1, T2>[], is_directed?: boolean) {
        if (nodes){
            this._nodes = nodes
        }
        if (edges){
            this._edges = edges
        }
        if (is_directed) {
            this._is_directed = is_directed
        }
        if (!is_directed) {
            this._makeUndirected();
        }
         
    }

    get nodes(){
        return this._nodes
    }

    get edges(){
        return this._edges
    }

    get is_directed(){
        return this._is_directed
    }

    public addNode(node: Node<T1>){
        for (let i = 0; i < this._nodes.length; i++){
            if (this._nodes[i].id === node.id){
                return
            }
        }
        this._nodes.push(node)
    }

    public addEdge(edge: Edge<T1, T2>){
        for (let i = 0; i < this._edges.length; i++){
            if (this._edges[i].id === edge.id){
                return
            }
        }
        this._edges.push(edge)
    }

    public getNode(node_id: string){

        for (let i = 0; i < this._nodes.length; i++){
            if (this._nodes[i].id === node_id){
                return this._nodes[i]
            }
        }
    }

    public getEdges(): Edge<T1, T2>[] {
        return this._edges;
    }

    public getAdjNodes(node: Node<T1>){
        let adj_nodes: Node<T1>[] = []
        let output_edges = this.getOutputEdge(node)
        for (let i = 0; i < output_edges.length; i++){
            if (output_edges[i].source.id === node.id){
                adj_nodes.push(output_edges[i].target)
            }
            else{
                adj_nodes.push(output_edges[i].source)
            }                
        }
        return adj_nodes
    }

    public getAdjEdges(edge: Edge<T1, T2>){
        let adj_edges: Edge<T1, T2>[] = []
        for (let i = 0; i < this._edges.length; i++){
            if ((this._edges[i].source.id === edge.source.id || this._edges[i].source.id === edge.target.id ||
                this._edges[i].target.id === edge.source.id || this._edges[i].target.id === edge.target.id) && this._edges[i].id !== edge.id){
                adj_edges.push(this._edges[i])
            }                
        }
        return adj_edges
    }
    
    public getEdge(edgeid_or_source: string | Node<T1>, target?: Node<T1>){
        if (edgeid_or_source instanceof Number){
            for (let i = 0; i < this._edges.length; i++){
                if (this._edges[i].id === edgeid_or_source){
                    return this._edges[i]
                }
            }
        }
        else if (target && edgeid_or_source instanceof Node){
            for (let i = 0; i < this._edges.length; i++){
                if (this._edges[i].source.id === edgeid_or_source.id){
                    if (this._edges[i].target.id === target.id){
                        return this._edges[i]
                    }
                }
                if (!this._is_directed){
                    if (this._edges[i].target.id === edgeid_or_source.id){
                        if (this._edges[i].source.id === target.id){
                            return this._edges[i]
                        }
                    }
                }
            }
        }
        else if (edgeid_or_source instanceof Number && target){
            reportError(ERROR_MSG_INCORRECT_TYPES)
        }
        else return
    }

    public getOutputEdge(node: Node<T1>){
        let output_edges: Edge<T1, T2>[] = []
        for (let i = 0; i < this._edges.length; i++){
            if (this._edges[i].source.id === node.id){
                output_edges.push(this._edges[i])
            }
            if (!this._is_directed){
                if (this._edges[i].target.id === node.id){
                    if (this._edges[i].source.id !== this._edges[i].target.id){
                        output_edges.push(this._edges[i])
                    }
                }
            }
        }
        return output_edges
    }

    public getInputEdge(node: Node<T1>){
        let input_edges: Edge<T1, T2>[] = []
        for (let i = 0; i < this._edges.length; i++){
            if (this._edges[i].target.id === node.id){
                input_edges.push(this._edges[i])
            }
            if (!this._is_directed){
                if (this._edges[i].target.id === node.id){
                    if (this._edges[i].source.id !== this._edges[i].target.id){
                        input_edges.push(this._edges[i])
                    }
                }
            }
        }
        return input_edges
    }

    public popNode(node: Node<T1>){
        let relatedEdge = this.getOutputEdge(node)
        relatedEdge.forEach(edge => {
            let index = this._edges.indexOf(edge, 0)
            if (index > -1) {
                this._edges.splice(index, 1)
            }
        });
        let index = this._nodes.indexOf(node, 0)
        if (index > -1) {
            this._nodes.splice(index, 1)
        }
    }

    public popEdge(edge: Edge<T1, T2>){
        this._edges = this._edges.filter((edgei) => edgei.id !== edge.id)
    }

    private _makeUndirected(): void {
        const edgesToAdd: Edge<T1, T2>[] = [];
        
        this._edges.forEach(edge => {
            if (!this._edges.some(e => e.source.id === edge.target.id && e.target.id === edge.source.id)) {
                edgesToAdd.push(this._createReverseEdge(edge));
            }
        });
        
        this._edges = [...this._edges, ...edgesToAdd];
    }

    private _createReverseEdge(edge: Edge<T1, T2>): Edge<T1, T2> {
        return new Edge<T1, T2>(
            `${edge.target.id}-${edge.source.id}`,
            edge.target,
            edge.source,
        );
    }

    convertToUndirected(): Graph<T1, T2> {
        const newGraph = new Graph<T1, T2>(); 

        for (const node of this.nodes) {
            newGraph.addNode(node);
        }

        for (const edge of this.edges) {
            newGraph.addEdge(edge);
        }

        return newGraph;
    }

    public clone(): Graph<T1, T2> {
        
        const nodeMap = new Map<string, Node<T1>>();
        const newNodes = this._nodes.map(n => {
            const nn = new Node<T1>(n.id, n.label, n.color, n.weight, n.props);
            nodeMap.set(n.id, nn);
            return nn;
        });

        const newEdges = this._edges.map(e => {
            return new Edge<T1, T2>(
                e.id,
                nodeMap.get(e.source.id)!,
                nodeMap.get(e.target.id)!,
                e.color,
                e.label,
                e.props
            );
        });

        const newGraph = new Graph<T1, T2>(newNodes, newEdges, this._is_directed)
        newGraph._removeDuplicateEdges();
    
        return newGraph;
    }



    public static createNumberGraph(numbers: number[]): Graph<number, any> {
        const nodes = numbers.map(num => 
            new Node<number>(
                num.toString(),
                num.toString(), 
                undefined,      
                undefined,      
                num            
            )
        );
        return new Graph<number, any>(nodes, [], false);
    }

    

    public findMatrix() : any[][]{
        const n = this.nodes.length;
        const indexMap = new Map<string, number>();
        this.nodes.forEach((node, i) => indexMap.set(node.id, i));

        const matrix = Array.from({ length: n }, () =>
            Array(n).fill(0)
        );

        for (const edge of this.edges) {
            const i = indexMap.get(edge.source.id)!;
            const j = indexMap.get(edge.target.id)!;
            matrix[i][j] = 1;
        }

        for (let i = 0; i < n; i++) {
            matrix[i][i] = 1;
        }
        return matrix;

    }

    public findDNF(disjunctions: string[][]) : Set<string>{
         const cartesianProduct = (arr: string[][]): string[][] => {
            return arr.reduce<string[][]>(
                (acc, curr) =>
                    acc.flatMap(prefix =>
                        curr.map(item => [...prefix, item])
                    ),
                [[]]
            );
        };

        const dnf = cartesianProduct(disjunctions);

        const simplified = dnf
            .map(set => Array.from(new Set(set)))
            .sort((a, b) => a.length - b.length);

        const minimalSetIds = new Set(simplified[0]);
        return minimalSetIds;

    }

    public getNeighbors(node: Node<T1>): Node<T1>[] {
        const neighbors: Node<T1>[] = [];
        for (const edge of this._edges) {
            if (edge.source.id === node.id) {
                neighbors.push(edge.target);
            }
            if (edge.target.id === node.id) {
                neighbors.push(edge.source);
            }
        }
        return neighbors;
    }

    public getNeighborsById(nodeId: string): Node<T1>[] {
        const neighbors: Node<T1>[] = [];
        for (const edge of this._edges) {
            if (edge.source.id === nodeId) {
                neighbors.push(edge.target);
            }
            if (edge.target.id === nodeId) {
                neighbors.push(edge.source);
            }
        }
        return neighbors;
    }

    public areAdjacent(id1: string, id2: string): boolean {
        return this._edges.some(edge =>
            (edge.source.id === id1 && edge.target.id === id2) ||
            (edge.source.id === id2 && edge.target.id === id1)
        );
    }


    public isConnected(): boolean {
        if (this.nodes.length === 0) return true;
        
        const visited = new Set<string>();
        const queue: Node<T1>[] = [this.nodes[0]];
        visited.add(this.nodes[0].id);

        while (queue.length > 0) {
            const currentNode = queue.shift()!;
            const neighbors = this.getNeighbors(currentNode);

            for (const neighbor of neighbors) {
                if (!visited.has(neighbor.id)) {
                    visited.add(neighbor.id);
                    queue.push(neighbor);
                }
            }
        }

        return visited.size === this.nodes.length;
    }

    public static createWeightedGraph(nodes: Node<number>[], edges: Edge<number, any>[], is_directed?: boolean): Graph<number, any> {
        // Создаем граф без вызова _makeUndirected
        const graph = new Graph<number, any>();
        graph._nodes = nodes;
        graph._edges = edges;
        
        if (is_directed !== undefined) {
            graph._is_directed = is_directed;
        }
        
        // Вручную убираем дубликаты для неориентированного графа
        if (!graph._is_directed) {
            graph._removeDuplicateEdges();
        }
        
        return graph;
    }

    // Добавьте этот метод в класс
    private _removeDuplicateEdges(): void {
        const uniqueEdges = new Map<string, Edge<T1, T2>>();
        
        this._edges.forEach(edge => {
            const key = [edge.source.id, edge.target.id].sort().join('-');
            if (!uniqueEdges.has(key)) {
                uniqueEdges.set(key, edge);
            }
        });
        
        this._edges = Array.from(uniqueEdges.values());
    }

    public createWeightedGraph(): Graph<number, any> {
        const weightedEdges: Edge<number, any>[] = [];
        const processedEdgeKeys = new Set<string>();
        
        for (const edge of this._edges) {
            const edgeKey = [edge.source.id, edge.target.id].sort().join('-');
            
            // Пропускаем дубликаты
            if (processedEdgeKeys.has(edgeKey)) {
                continue;
            }
            processedEdgeKeys.add(edgeKey);
            
            const sourceValue = edge.source.props as number;
            const targetValue = edge.target.props as number;
            
            if (typeof sourceValue === 'number' && typeof targetValue === 'number') {
                const weight = sourceValue > targetValue 
                    ? sourceValue / targetValue 
                    : targetValue / sourceValue;
                
                const weightedEdge = new Edge<number, any>(
                    edgeKey,
                    edge.source as Node<number>,
                    edge.target as Node<number>,
                    edge.color,
                    weight % 1 === 0 ? weight.toString() : weight.toFixed(2),
                    { 
                        ...(edge.props || {}),
                        weight: weight 
                    }
                );
                
                weightedEdges.push(weightedEdge);
            }
        }
        
        // Используем переопределенный конструктор
        return Graph.createWeightedGraph(
            this._nodes as Node<number>[],
            weightedEdges, 
            this._is_directed
        );
    }

    public getIncidentEdges(nodeId: string): Edge<T1, T2>[] {
        return this._edges.filter(e =>
            e.source.id === nodeId || e.target.id === nodeId
        );
    }

    


}
