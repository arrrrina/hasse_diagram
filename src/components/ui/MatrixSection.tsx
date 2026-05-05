// components/hasse/MatrixSection.tsx
import React from 'react';
import { MatrixDisplay } from './MatrixDisplay';
import './styles/MatrixSection.css';

interface MatrixSectionProps {
    adjacencyMatrix: any;
    incidenceMatrix: any;
    distanceMatrix: any;
    graphRadius: number;
    graphDiameter: number;
    edgeConnectivity: number | null;
    vertexConnectivity: number | null;
    cycleMatrix: any;       
    cutMatrix: any; 
    onClearAll?: () => void;
}

export const MatrixSection: React.FC<MatrixSectionProps> = ({
    adjacencyMatrix,
    incidenceMatrix,
    distanceMatrix,
    cycleMatrix,   
    cutMatrix,
    graphRadius,
    graphDiameter,
    edgeConnectivity,
    vertexConnectivity,
    onClearAll
}) => {
    return (
        <div className="matrix-section">
            {/* Заголовок с кнопкой очистки */}
            <div className="matrix-header">
                <h2 className="section-title">Результаты анализа</h2>
                {onClearAll && (
                    <button 
                        onClick={onClearAll}
                        className="clear-all-button"
                    >
                        ✕ Очистить все
                    </button>
                )}
            </div>

            <div className="results-content">

                {vertexConnectivity !== null && (
                    <div className="connectivity-info">
                        <h3>Вершинная связность</h3>
                        <div className="connectivity-value">
                            k(G) = {vertexConnectivity}
                        </div>
                    </div>
                )}
                {edgeConnectivity !== null && (
                    <div className="connectivity-info">
                        <h3>Реберная связность</h3>
                        <div className="connectivity-value">
                            λ(G) = {edgeConnectivity}
                        </div>
                    </div>
                )}

                {adjacencyMatrix && (
                    <MatrixDisplay
                        matrixData={adjacencyMatrix}
                        title="Матрица смежности"
                        isIncidence={false}
                    />
                )}

                {incidenceMatrix && (
                    <MatrixDisplay
                        matrixData={incidenceMatrix}
                        title="Матрица инцидентности"
                        isIncidence={true}
                    />
                )}

                {distanceMatrix && (
                    <div className="distance-matrix-container">
                        <MatrixDisplay
                            matrixData={distanceMatrix}
                            title="Матрица расстояний"
                            isIncidence={false}
                        />
                        {(graphRadius !== -1 && graphDiameter !== -1) && (
                            <div className="graph-properties">
                                <div className="graph-property">
                                    <span className="property-label">Радиус графа:</span>
                                    <span className="property-value">{graphRadius}</span>
                                </div>
                                <div className="graph-property">
                                    <span className="property-label">Диаметр графа:</span>
                                    <span className="property-value">{graphDiameter}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {cycleMatrix && (
                    <MatrixDisplay
                        matrixData={cycleMatrix}
                        title="Матрица циклов"
                        isIncidence={false}
                        showEdgesAsColumns={true}
                    />
                )}

                {cutMatrix && (
                    <MatrixDisplay
                        matrixData={cutMatrix}
                        title="Матрица разрезов"
                        isIncidence={false}
                        showEdgesAsColumns={true} 
                    />
                )}
            </div>
        </div>
    );
};