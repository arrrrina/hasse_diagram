import React, { useState } from 'react';
import { Graph } from '../lib/Graph';

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);
const lcmOfArray = (numbers: number[]): number => {
    if (numbers.length === 0) return 1;
    return numbers.reduce((acc, num) => lcm(acc, num), numbers[0]);
};

interface MatrixData {
    matrix: number[][];
    nodes: number[];
    edges?: string[]; // Добавлено для матрицы инцидентности
}

interface HasseDiagramFormProps {
    onDiagramBuilt: (graph: Graph<number, any>) => void;
    onInternalStability?: () => void;
    onExternalPositiveStability?: () => void;
    onExternalNegativeStability?: () => void;
    onResetHighlighting?: () => void;
    handleConvertToUndirected: () =>void;
    isDirected: boolean; 
}

const HasseDiagramForm: React.FC<HasseDiagramFormProps> = ({ 
    onDiagramBuilt,
    onInternalStability,
    onExternalPositiveStability,
    onExternalNegativeStability,
    onResetHighlighting,
    handleConvertToUndirected,
    isDirected
 }) => {
    const [input1, setInput1] = useState('');
    const [input2, setInput2] = useState('');
    const [error, setError] = useState('');
    const [adjacencyMatrix, setAdjacencyMatrix] = useState<MatrixData | null>(null);
    const [incidenceMatrix, setIncidenceMatrix] = useState<MatrixData | null>(null);
    const [currentGraph, setCurrentGraph] = useState<Graph<number, any> | null>(null);
    const [activeMode, setActiveMode] = useState<'internal' | 'external' | null>(null);
    

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError('');
            setAdjacencyMatrix(null);
            setIncidenceMatrix(null);
            
            const numbers = Array.from(new Set([
                ...input1.split(' ').map(num => num.trim()).filter(num => num !== ''),
                ...input2.split(' ').map(num => num.trim()).filter(num => num !== '')
            ].map(num => {
                const parsed = parseInt(num, 10);
                if (isNaN(parsed)) throw new Error(`"${num}" не является числом`);
                return parsed;
            })));

            if (numbers.length === 0) {
                throw new Error('Не найдено допустимых чисел для обработки');
            }
            
            const lcmValue = lcmOfArray(numbers);
            const numbersWithLCM = Array.from(new Set([...numbers, lcmValue]));

            const numberGraph = Graph.createNumberGraph(numbersWithLCM);
            const hasseDiagram = numberGraph.buildHasseDivisionDiagram();
            
            setCurrentGraph(hasseDiagram);
            if (isDirected) {
                onDiagramBuilt(hasseDiagram);
            } else {
                // Если сейчас неориентированный граф, не обновляем основной граф из формы
                console.log('Пропускаем onDiagramBuilt, граф неориентирован');
            }

           
            
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    };

    const handleBuildAdjacencyMatrix = () => {
        if (!currentGraph) {
            setError('Сначала постройте диаграмму Хассе');
            return;
        }
        try {
            const matrixData = currentGraph.buildHasseAdjacencyMatrix();
            setAdjacencyMatrix({
                matrix: matrixData.matrix,
                nodes: matrixData.nodeValues
            });
            setIncidenceMatrix(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    };

    const handleBuildIncidenceMatrix = () => {
        if (!currentGraph) {
            setError('Сначала постройте диаграмму Хассе');
            return;
        }
        try {
            const matrixData = currentGraph.buildHasseIncidenceMatrix();
            setIncidenceMatrix({
                matrix: matrixData.matrix,
                nodes: matrixData.vertices.map(v => parseInt(v.toString())),
                edges: matrixData.edges
            });
            setAdjacencyMatrix(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    };
    
    const handleInternalStability = () => {
        if (!currentGraph) return;
        onInternalStability?.();
    };

    const handleExternalPositiveStability = () => {
        if (!currentGraph) return;
        onExternalPositiveStability?.();
    };

    const handleExternalNegativeStability = () => {
        if (!currentGraph) return;
        onExternalNegativeStability?.();
    };

    const handleResetHighlighting = () => {
        console.log('Сброс выделения, текущий activeMode:', activeMode);
        setActiveMode(null);
        if (onResetHighlighting) {
            console.log('Вызываю onResetHighlighting');
            onResetHighlighting();
        }
    };

    const renderMatrix = (matrixData: MatrixData | null, isIncidence = false) => {
        if (!matrixData) return null;

        return (
            <div style={{ marginTop: '20px' }}>
                <h3>{isIncidence ? 'Матрица инцидентности' : 'Матрица смежности'}</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ 
                        borderCollapse: 'collapse', 
                        margin: '10px 0', 
                        border: '1px solid #ddd',
                        minWidth: '500px'
                    }}>
                        <thead>
                            <tr>
                                <th style={{ 
                                    border: '1px solid #ddd', 
                                    padding: '8px',
                                    backgroundColor: '#f2f2f2',
                                    position: 'sticky',
                                    left: 0,
                                    zIndex: 1
                                }}></th>
                                {isIncidence 
                                    ? matrixData.edges?.map((edge, index) => (
                                        <th key={index} style={{ 
                                            border: '1px solid #ddd', 
                                            padding: '8px',
                                            backgroundColor: '#f2f2f2'
                                        }}>
                                            {edge}
                                        </th>
                                    ))
                                    : matrixData.nodes.map((value, index) => (
                                        <th key={index} style={{ 
                                            border: '1px solid #ddd', 
                                            padding: '8px',
                                            backgroundColor: '#f2f2f2'
                                        }}>
                                            {value}
                                        </th>
                                    ))}
                            </tr>
                        </thead>
                        <tbody>
                            {matrixData.matrix.map((row, i) => (
                                <tr key={i}>
                                    <th style={{ 
                                        border: '1px solid #ddd', 
                                        padding: '8px',
                                        backgroundColor: '#f2f2f2',
                                        position: 'sticky',
                                        left: 0
                                    }}>
                                        {matrixData.nodes[i]}
                                    </th>
                                    {row.map((cell, j) => (
                                        <td 
                                            key={j} 
                                            style={{ 
                                                border: '1px solid #ddd', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                backgroundColor: getCellBackground(cell, isIncidence)
                                            }}
                                        >
                                            {formatCellValue(cell, isIncidence)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const getCellBackground = (value: number, isIncidence: boolean) => {
        if (!isIncidence) {
            return value === 1 ? '#e6f7ff' : 'white';
        }
        return value === 1 ? '#e6ffe6' : 
               value === -1 ? '#ffe6e6' : 'white';
    };

    const formatCellValue = (value: number, isIncidence: boolean) => {
        if (!isIncidence) return value;
        return value === 1 ? '+1' : 
               value === -1 ? '-1' : '0';
    };

    return (
        <div style={{ maxWidth: '100%' }}>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <div>
                        <label htmlFor="numbers-input1">Введите числа: </label>
                        <input
                            id="numbers-input1"
                            type="text"
                            value={input1}
                            onChange={(e) => setInput1(e.target.value)}
                            placeholder="Например: 2 4 8"
                            style={{ padding: '8px', width: '200px' }}
                        />
                    </div>
                    <div>
                        <label htmlFor="numbers-input2">Введите числа: </label>
                        <input
                            id="numbers-input2"
                            type="text"
                            value={input2}
                            onChange={(e) => setInput2(e.target.value)}
                            placeholder="Например: 3 6 12"
                            style={{ padding: '8px', width: '200px' }}
                        />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <button 
                        type="submit" 
                        style={{ 
                            padding: '8px 16px',
                            backgroundColor: '#1890ff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Построить диаграмму
                    </button>
                    <button 
                        type="button" 
                        onClick={handleBuildAdjacencyMatrix}
                        style={{ 
                            padding: '8px 16px',
                            backgroundColor: adjacencyMatrix ? '#4CAF50' : '#f1f1f1',
                            color: adjacencyMatrix ? 'white' : 'inherit',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                        disabled={!currentGraph}
                    >
                        Матрица смежности
                    </button>
                    <button 
                        type="button" 
                        onClick={handleBuildIncidenceMatrix}
                        style={{ 
                            padding: '8px 16px',
                            backgroundColor: incidenceMatrix ? '#4CAF50' : '#f1f1f1',
                            color: incidenceMatrix ? 'white' : 'inherit',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                        disabled={!currentGraph}
                    >
                        Матрица инцидентности
                    </button>
                    <button 
                        type="button" 
                        onClick={handleInternalStability}
                        style={{ 
                            padding: '8px 16px',
                            backgroundColor: activeMode === 'internal' ? '#4CAF50' : '#f1f1f1',
                            color: activeMode === 'internal' ? 'white' : 'inherit',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                        disabled={!currentGraph}
                    >
                        Внутренняя устойчивость
                    </button>
                    <button 
                        type="button" 
                        onClick={handleExternalPositiveStability}
                        style={{ 
                            padding: '8px 16px',
                            backgroundColor: activeMode === 'external' ? '#F44336' : '#f1f1f1',
                            color: activeMode === 'external' ? 'white' : 'inherit',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                        disabled={!currentGraph}
                    >
                       Положительная внешняя устойчивость
                    </button>
                    <button 
                        type="button" 
                        onClick={handleExternalNegativeStability}
                        style={{ 
                            padding: '8px 16px',
                            backgroundColor: activeMode === 'external' ? '#F44336' : '#f1f1f1',
                            color: activeMode === 'external' ? 'white' : 'inherit',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                        disabled={!currentGraph}
                    >
                       Отрицательная внешняя устойчивость
                    </button>
                    <button 
                        type="button" 
                        onClick={handleResetHighlighting}
                        style={{ 
                            padding: '8px 16px',
                            backgroundColor: '#f1f1f1',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                        disabled={!currentGraph}
                    >
                        Сбросить выделение
                    </button>
                    <button 
                    onClick={handleConvertToUndirected}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        margin: '10px 0'
                    }}
                    >
                    Сделать неориентированным
                </button>
                </div>
                {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
            </form>
            {renderMatrix(adjacencyMatrix)}
            {renderMatrix(incidenceMatrix, true)}
        </div>

    );
};

export default HasseDiagramForm;