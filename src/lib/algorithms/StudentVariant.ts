import { Graph } from '../core/Graph';
import { HasseDiagram } from './HasseDiagram';
import { VariantGenerator } from './VariantGenerator';

function normalizeVariant(variant: number): number {
    const total = VariantGenerator.totalVariants;
    const raw = Math.floor(variant);
    if (!Number.isFinite(raw) || raw <= 0) {
        return 1;
    }
    return (((raw - 1) % total) + total) % total + 1;
}

export function getVariantNumbers(variant: number): number[] {
    const generated = VariantGenerator.generate(normalizeVariant(variant));
    return Array.from(new Set([1, ...generated.union, generated.lcm])).sort((a, b) => a - b);
}

export function buildExpectedStudentGraph(variant: number): Graph<number, any> {
    const numbers = getVariantNumbers(variant);
    const graph = Graph.createNumberGraph(numbers);
    return HasseDiagram.buildHasseDivisionDiagram(graph);
}

function edgeKey(sourceValue: number, targetValue: number): string {
    return `${sourceValue}->${targetValue}`;
}

export function compareStudentGraph(studentGraph: Graph<number, any>, expectedGraph: Graph<number, any>): boolean {
    const studentValues = studentGraph.nodes
        .map((n) => Number(n.props))
        .filter((n) => Number.isFinite(n))
        .sort((a, b) => a - b);

    const expectedValues = expectedGraph.nodes
        .map((n) => Number(n.props))
        .sort((a, b) => a - b);

    if (studentValues.length !== expectedValues.length) {
        return false;
    }

    for (let i = 0; i < studentValues.length; i++) {
        if (studentValues[i] !== expectedValues[i]) {
            return false;
        }
    }

    const studentEdgeSet = new Set(
        studentGraph.edges.map((e) => edgeKey(Number(e.source.props), Number(e.target.props)))
    );
    const expectedEdgeSet = new Set(
        expectedGraph.edges.map((e) => edgeKey(Number(e.source.props), Number(e.target.props)))
    );

    if (studentEdgeSet.size !== expectedEdgeSet.size) {
        return false;
    }

    for (const key of expectedEdgeSet) {
        if (!studentEdgeSet.has(key)) {
            return false;
        }
    }

    return true;
}
