import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import GraphVisualization from './GraphVisualization';
import { Edge } from '../../lib/core/Edge';
import { Graph } from '../../lib/core/Graph';
import { Node } from '../../lib/core/Node';
import { buildExpectedStudentGraph, compareStudentGraph, getVariantNumbers } from '../../lib/algorithms/StudentVariant';
import { getVariantNumber } from '../../services/auth';
import './styles/StudentPage.css';

function buildGraphFromInputs(values: number[], edges: Array<{ source: number; target: number }>): Graph<number, any> {
    const nodes = values.map((value) => new Node<number>(String(value), String(value), undefined, undefined, value));
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    const graphEdges: Edge<number, any>[] = [];

    edges.forEach((edge, idx) => {
        const source = nodeMap.get(String(edge.source));
        const target = nodeMap.get(String(edge.target));
        if (source && target) {
            graphEdges.push(new Edge<number, any>(`student-${idx}-${source.id}-${target.id}`, source, target));
        }
    });

    return new Graph<number, any>(nodes, graphEdges, true);
}

export const StudentPage: React.FC = () => {
    const navigate = useNavigate();
    const variant = getVariantNumber();
    const safeVariant = variant ?? 1;
    const taskNumbers = useMemo(() => getVariantNumbers(safeVariant), [safeVariant]);
    const expectedGraph = useMemo(() => buildExpectedStudentGraph(safeVariant), [safeVariant]);

    const [nodeValueInput, setNodeValueInput] = useState('');
    const [values, setValues] = useState<number[]>([]);
    const [sourceValue, setSourceValue] = useState('');
    const [targetValue, setTargetValue] = useState('');
    const [edges, setEdges] = useState<Array<{ source: number; target: number }>>([]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'info' | 'success' | 'error'>('info');

    const studentGraph = useMemo(() => buildGraphFromInputs(values, edges), [values, edges]);

    const addNode = () => {
        const parsed = Number(nodeValueInput);
        if (!Number.isInteger(parsed) || parsed <= 0) {
            setMessageType('error');
            setMessage('Значение вершины должно быть положительным целым числом.');
            return;
        }
        if (values.includes(parsed)) {
            setMessageType('error');
            setMessage('Такая вершина уже добавлена.');
            return;
        }
        setValues((prev) => [...prev, parsed].sort((a, b) => a - b));
        setNodeValueInput('');
        setMessage('');
    };

    const addEdge = () => {
        const source = Number(sourceValue);
        const target = Number(targetValue);
        if (!Number.isInteger(source) || !Number.isInteger(target)) {
            setMessageType('error');
            setMessage('Выберите исходную и целевую вершины.');
            return;
        }
        if (source === target) {
            setMessageType('error');
            setMessage('Петли не допускаются.');
            return;
        }
        if (!values.includes(source) || !values.includes(target)) {
            setMessageType('error');
            setMessage('Обе вершины должны быть добавлены заранее.');
            return;
        }
        if (edges.some((edge) => edge.source === source && edge.target === target)) {
            setMessageType('error');
            setMessage('Такое ребро уже есть.');
            return;
        }
        setEdges((prev) => [...prev, { source, target }]);
        setMessage('');
    };

    const removeNode = (valueToDelete: number) => {
        setValues((prev) => prev.filter((value) => value !== valueToDelete));
        setEdges((prev) =>
            prev.filter((edge) => edge.source !== valueToDelete && edge.target !== valueToDelete)
        );
        if (Number(sourceValue) === valueToDelete) {
            setSourceValue('');
        }
        if (Number(targetValue) === valueToDelete) {
            setTargetValue('');
        }
    };

    const removeEdge = (source: number, target: number) => {
        setEdges((prev) => prev.filter((edge) => !(edge.source === source && edge.target === target)));
    };

    const checkAnswer = () => {
        const isCorrect = compareStudentGraph(studentGraph, expectedGraph);
        setMessageType(isCorrect ? 'success' : 'error');
        setMessage(
            isCorrect
                ? 'Верно! Диаграмма Хассе построена правильно.'
                : 'Пока неверно. Проверьте вершины и отношения покрытий для вашего варианта.'
        );
    };

    return (
        <div className="app-container">
            <AppHeader onLogout={() => navigate('/auth')} />

            <section className="student-card">
                <h2>Страница студента</h2>
                <p>Вариант: <b>{safeVariant}</b></p>
                <p>Постройте диаграмму Хассе для чисел: {taskNumbers.join(', ')}</p>
                <p>Важно: в диаграмме должна быть вершина с НОК множества (она уже входит в список).</p>

                <div className="student-grid">
                    <div className="student-panel">
                        <h3>Вершины</h3>
                        <div className="student-row">
                            <input
                                type="number"
                                value={nodeValueInput}
                                onChange={(e) => setNodeValueInput(e.target.value)}
                                placeholder="Число вершины"
                            />
                            <button type="button" onClick={addNode}>Добавить вершину</button>
                        </div>
                        <div className="chips">
                            {values.map((value) => (
                                <span key={value} className="chip">
                                    {value}
                                    <button type="button" className="delete-chip" onClick={() => removeNode(value)} aria-label={`Удалить вершину ${value}`}>x</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="student-panel">
                        <h3>Ребра</h3>
                        <div className="student-row">
                            <select value={sourceValue} onChange={(e) => setSourceValue(e.target.value)}>
                                <option value="">Откуда</option>
                                {values.map((value) => <option key={`s-${value}`} value={value}>{value}</option>)}
                            </select>
                            <select value={targetValue} onChange={(e) => setTargetValue(e.target.value)}>
                                <option value="">Куда</option>
                                {values.map((value) => <option key={`t-${value}`} value={value}>{value}</option>)}
                            </select>
                            <button type="button" onClick={addEdge}>Добавить ребро</button>
                        </div>
                        <div className="edge-list">
                            {edges.map((edge, idx) => (
                                <div key={`${edge.source}-${edge.target}-${idx}`} className="edge-row">
                                    <span>{edge.source} -&gt; {edge.target}</span>
                                    <button type="button" onClick={() => removeEdge(edge.source, edge.target)}>Удалить</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <button type="button" className="check-button" onClick={checkAnswer}>
                    Проверить решение
                </button>
                {message && <div className={`student-message ${messageType}`}>{message}</div>}
            </section>

            {studentGraph.nodes.length > 0 && (
                <section className="student-card">
                    <h3>Ваш граф</h3>
                    <GraphVisualization graph={studentGraph} isDirected={true} />
                </section>
            )}
        </div>
    );
};
