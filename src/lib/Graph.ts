//import React from 'react';
import { Node } from './Node';
import { Edge } from './Edge';
//import CytoscapeComponent from 'react-cytoscapejs';
//import { ElementDefinition } from 'cytoscape';
//import { Template } from '../Template';


const ERROR_MSG_INCORRECT_TYPES = "Incorrect input types!"


interface IGraph<T1, T2> {
    nodes: Node<T1>[]
    edges: Edge<T1, T2>[]
    is_directed: boolean
}


export class Graph<T1, T2> implements IGraph<T1, T2> {

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


    
    get isDirected(): boolean {
        return this._is_directed;
    }

    // для диаграммы хассе
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

    public isAcyclic(): boolean {
        const visited = new Set<string>();
        const recursionStack = new Set<string>();

        for (const node of this._nodes) {
            if (this._isCyclicUtil(node.id, visited, recursionStack)) {
                return false;
            }
        }
        return true;
    }

    private _isCyclicUtil(nodeId: string, visited: Set<string>, recursionStack: Set<string>): boolean {
        if (recursionStack.has(nodeId)) return true;
        if (visited.has(nodeId)) return false;

        visited.add(nodeId);
        recursionStack.add(nodeId);

        const node = this.getNode(nodeId);
        if (node) {
            const adjNodes = this.getAdjNodes(node);
            for (const adjNode of adjNodes) {
                if (this._isCyclicUtil(adjNode.id, visited, recursionStack)) {
                    return true;
                }
            }
        }

        recursionStack.delete(nodeId);
        return false;
    }


    public buildHasseDivisionDiagram(): Graph<number, any> {
        if (!this.isAcyclic()) {
            throw new Error("Граф содержит циклы");
        }
    
        if (!this._nodes.every(node => typeof node.props === 'number')) {
            throw new Error("Все вершины должны содержать числовые значения в props");
        }
    
        const numberNodes = this._nodes as unknown as Node<number>[];
        const sortedNodes = [...this._nodes].sort((a, b) => {
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

    
    public buildHasseAdjacencyMatrix(): { matrix: number[][], nodeValues: number[] } {
        if (!this._nodes.every(node => typeof node.props === 'number')) {
            throw new Error("Все вершины должны содержать числовые значения в props");
        }

        const sortedNodes = [...this._nodes].sort((a, b) => (a.props as number) - (b.props as number));
        const size = sortedNodes.length;
        const matrix: number[][] = Array.from({ length: size }, () => Array(size).fill(0));
    
        const nodeValues = sortedNodes.map(node => node.props as number);
    
        const nodeIndexMap = new Map<string, number>();
        sortedNodes.forEach((node, index) => {
            nodeIndexMap.set(node.id, index);
        });
    
        this._edges.forEach(edge => {
            const fromIndex = nodeIndexMap.get(edge.source.id);
            const toIndex = nodeIndexMap.get(edge.target.id);
            
            if (fromIndex !== undefined && toIndex !== undefined) {
                matrix[fromIndex][toIndex] = 1;
            }
        });
    
        return { matrix, nodeValues };
    }

    public buildHasseIncidenceMatrix(): {
        matrix: number[][],
        vertices: number[],
        edges: string[]
    } {
        if (!this._nodes.every(node => typeof node.props === 'number')) {
            throw new Error("Все вершины должны содержать числовые значения в props");
        }
    
        const sortedNodes = [...this._nodes].sort((a, b) => (a.props as number) - (b.props as number));
        const sortedEdges = [...this._edges].sort((a, b) =>
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

   
    

    public findMaxInternalStableSet(): Node<T1>[] {
        let maxSet: Node<T1>[] = [];
        let bestSize = 0;

        const isStable = (nodes: Node<T1>[], nodeToAdd: Node<T1>): boolean => {
            for (let node of nodes) {
                if (this.getEdge(node, nodeToAdd) || this.getEdge(nodeToAdd, node)) {
                    return false;
                }
            }
            return true;
        };

        const branchAndBound = (start: number, current: Node<T1>[]) => {
            console.log(maxSet);
            if (current.length + (this._nodes.length - start) <= bestSize) {
                return;
            }
            
            if (current.length > bestSize) {
                bestSize = current.length;
                maxSet = [...current];

            }

            for (let i = start; i < this._nodes.length; i++) {
                const node = this._nodes[i];
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



    public findExternalStabilityNegative(): Node<number>[] {
        const n = this.nodes.length;
        const matrix = this.findMatrix();
        const disjunctions: string[][] = [];

        for (let i = 0; i < n; i++) {
            const rowVars: string[] = [];
            for (let j = 0; j < n; j++) {
                if (matrix[i][j] === 1) {
                    rowVars.push(this.nodes[j].id);
                }
            }
            disjunctions.push(rowVars);
        }

       const minimalSetIds = this.findDNF(disjunctions)
       return this.nodes.filter(n => minimalSetIds.has(n.id)) as Node<number>[];
    }

    public findExternalStabilityPositive(): Node<number>[] {
        const n = this.nodes.length;
        const matrix = this.findMatrix();
        const disjunctions: string[][] = [];
 
        for (let j = 0; j < n; j++) {
            const colVars: string[] = [];
            for (let i = 0; i < n; i++) {
                if (matrix[i][j] === 1) {
                    colVars.push(this.nodes[i].id);
                }
            }
            disjunctions.push(colVars);
        }

        const minimalSetIds = this.findDNF(disjunctions)

        return this.nodes.filter(n => minimalSetIds.has(n.id)) as Node<number>[];
    }

}