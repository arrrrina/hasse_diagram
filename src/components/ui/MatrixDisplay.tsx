// components/hasse/MatrixDisplay.tsx
import React from 'react';
import './styles/MatrixDisplay.css';

interface MatrixDisplayProps {
    matrixData: {
        matrix: number[][];
        nodes: number[];
        edges?: string[];
        chords?: string[];     
        treeEdges?: string[];
    };
    title: string;
    isIncidence: boolean;
    showEdgesAsColumns?: boolean;
}

export const MatrixDisplay: React.FC<MatrixDisplayProps> = ({ 
    matrixData, 
    title, 
    isIncidence,
    showEdgesAsColumns = false 
}) => {
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

    const getDistanceCellBackground = (value: number): string => {
        if (value === -1) return '#ffcccc';
        if (value === 0) return '#e6f7ff';
        if (value === 1) return '#f0f9eb';
        return '#f0f9eb';
    };

    const formatDistanceCellValue = (value: number): string => {
        if (value === -1) return '∞';
        return value.toString();
    };

     const getColumnHeaders = () => {
        if (showEdgesAsColumns && matrixData.edges) {
            return matrixData.edges;
        }
        return Array.isArray(matrixData.nodes) ? matrixData.nodes : [];
    };

    const getRowHeaders = () => {
        if (title === "Матрица циклов" && matrixData.chords) {
            return matrixData.chords;
        }
        if (title === "Матрица разрезов" && matrixData.treeEdges) {
            return matrixData.treeEdges;
        }
        return Array.isArray(matrixData.nodes) ? matrixData.nodes : [];
    };

    const columnHeaders = getColumnHeaders();
    const rowHeaders = getRowHeaders();

    return (
        <div className="matrix-display">
            <h4 className="matrix-title">{title}</h4>
            {matrixData.chords && (
                <div className="matrix-info">
                    Хорды: {matrixData.chords.join(', ')}
                </div>
            )}
            {matrixData.treeEdges && (
                <div className="matrix-info">
                    Ребра дерева: {matrixData.treeEdges.join(', ')}
                </div>
            )}
            <div className="matrix-container">
                <table className="matrix-table">
                    <thead>
                        <tr>
                            <th className="matrix-corner"></th>
                            {columnHeaders.map((header, index) => (
                                <th key={index} className="matrix-header-cell">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {matrixData.matrix.map((row, i) => (
                            <tr key={i}>
                                <th className="matrix-header-cell">
                                    {i < rowHeaders.length ? rowHeaders[i] : `Цикл ${i + 1}`}
                                </th>
                                {row.map((cell, j) => (
                                    <td 
                                        key={j} 
                                        className="matrix-cell"
                                        style={{ 
                                            backgroundColor: cell === 1 ? '#e6f7ff' : 'white'
                                        }}
                                    >
                                        {cell}
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