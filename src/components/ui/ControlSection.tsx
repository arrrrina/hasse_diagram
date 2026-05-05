
import React from 'react';
import { Graph } from '../../lib/core/Graph';
import { BuildingMatrix } from '../../lib/algorithms/BuildingMatrix';
import { ReconstructOriginalGraph } from '../../lib/algorithms/ReconstructOriginalGraph';
import { GraphConnectivity } from '../../lib/algorithms/GraphConnectivity';
import { BlockFinder } from '../../lib/algorithms/BlockFinder';
import './styles/ControlsSection.css';
import { BuildingOstov } from '../../lib/algorithms/BuildingOstov';
import { CycleAndCutMatrix } from '../../lib/algorithms/CycleAndCutMatrix';
import { EulerGraph } from '../../lib/algorithms/EulerGraph';
import { HamiltonianGraph } from '../../lib/algorithms/HamiltonianGraph';

interface ControlsSectionProps {
    currentGraph: Graph<number, any> | null;
    activeMode: 'internal' | 'external-positive' | 'external-negative' | null;
    onInternalStability: () => void;
    onExternalPositiveStability: () => void;
    onExternalNegativeStability: () => void;
    onResetHighlighting: () => void;
    onConvertToUndirected: () => void;
    onImageBuilt: (graph: Graph<number, any>) => void;
    onErrorChange: (error: string) => void;
    onAdjacencyMatrixChange: (matrix: any) => void;
    onIncidenceMatrixChange: (matrix: any) => void;
    onDistanceMatrixChange: (matrix: any) => void;
    onGraphRadiusChange: (radius: number) => void;
    onGraphDiameterChange: (diameter: number) => void;
    onEdgeConnectivityChange: (connectivity: number | null) => void;
    onVertexConnectivityChange: (connectivity: number | null) => void;
    onFindBlocks: (blocks: Graph<number, any>[]) => void;
    isBlockModeActive?: boolean;
    onClearAllMatrices: () => void;
    onAddWeights: () => void; 
    onFindMinimumSpanningTree: (mst: Graph<number, any>) => void;
    onCycleMatrixChange: (matrix: any) => void; 
    onCutMatrixChange: (matrix: any) => void;  
    onMakeEulerian?: (graph: Graph<number, any>) => void;
    onCheckEulerian?: (isEulerian: boolean) => void;
    onMakeHamiltonian?: (graph: Graph<number, any>) => void;
    onCheckHamiltonian?: (isHamiltonian: boolean) => void;

}

export const ControlSection: React.FC<ControlsSectionProps> = ({
    currentGraph,
    activeMode,
    onInternalStability,
    onExternalPositiveStability,
    onExternalNegativeStability,
    onResetHighlighting,
    onConvertToUndirected,
    onImageBuilt,
    onErrorChange,
    onAdjacencyMatrixChange,
    onIncidenceMatrixChange,
    onDistanceMatrixChange,
    onGraphRadiusChange,
    onGraphDiameterChange,
    onEdgeConnectivityChange,
    onVertexConnectivityChange,
    onFindBlocks,
    isBlockModeActive = false,
    onAddWeights,
    onFindMinimumSpanningTree,
    onCycleMatrixChange,
    onCutMatrixChange,
    onMakeEulerian,
    onCheckEulerian,
    onMakeHamiltonian,
    onCheckHamiltonian,
    onClearAllMatrices
}) => {
    const handleBuildAdjacencyMatrix = () => {
        if (!currentGraph) {
            onErrorChange('Сначала постройте диаграмму Хассе');
            return;
        }
        try {
            const matrixData = BuildingMatrix.buildHasseAdjacencyMatrix(currentGraph);
            onAdjacencyMatrixChange({
                matrix: matrixData.matrix,
                nodes: matrixData.nodeValues
            });
            onIncidenceMatrixChange(null);
            onDistanceMatrixChange(null);
            onCutMatrixChange(null);
        } catch (err) {
            onErrorChange(err instanceof Error ? err.message : String(err));
        }
    };

    const handleBuildIncidenceMatrix = () => {
        if (!currentGraph) {
            onErrorChange('Сначала постройте диаграмму Хассе');
            return;
        }
        try {
            const matrixData = BuildingMatrix.buildHasseIncidenceMatrix(currentGraph);
            onIncidenceMatrixChange({
                matrix: matrixData.matrix,
                nodes: matrixData.vertices.map(v => parseInt(v.toString())),
                edges: matrixData.edges
            });
            onAdjacencyMatrixChange(null);
            onDistanceMatrixChange(null);
            onCutMatrixChange(null);
            onCycleMatrixChange(null);
        } catch (err) {
            onErrorChange(err instanceof Error ? err.message : String(err));
        }
    };

    const handleBuildDistanceMatrix = () => {
        if (!currentGraph) {
            onErrorChange('Сначала постройте диаграмму Хассе');
            return;
        }
        try {
            const matrixData = BuildingMatrix.getDistanceMatrix(currentGraph);
            onDistanceMatrixChange({
                matrix: matrixData.matrix,
                nodes: matrixData.nodeValues
            });
            const { radius, diameter } = BuildingMatrix.getRadius(matrixData.matrix);
            onGraphRadiusChange(radius);
            onGraphDiameterChange(diameter);
            onAdjacencyMatrixChange(null);
            onIncidenceMatrixChange(null);
            onCutMatrixChange(null);
            onCycleMatrixChange(null);
        } catch (err) {
            onErrorChange(err instanceof Error ? err.message : String(err));
        }
    };

    const handleBuildCycleMatrix = () => {
        if (!currentGraph) {
            onErrorChange('Сначала постройте диаграмму Хассе');
            return;
        }
        try {
            const matrixData = CycleAndCutMatrix.buildCycleMatrix(currentGraph);
            onCycleMatrixChange(matrixData);
            onAdjacencyMatrixChange(null);
            onIncidenceMatrixChange(null);
            onDistanceMatrixChange(null);
            onCutMatrixChange(null);
        } catch (err) {
            onErrorChange(err instanceof Error ? err.message : String(err));
        }
    };

    const handleBuildCutMatrix = () => {
        if (!currentGraph) {
            onErrorChange('Сначала постройте диаграмму Хассе');
            return;
        }
        try {
            const matrixData = CycleAndCutMatrix.buildCutMatrix(currentGraph);
            onCutMatrixChange(matrixData);
            onAdjacencyMatrixChange(null);
            onIncidenceMatrixChange(null);
            onDistanceMatrixChange(null);
            onCycleMatrixChange(null);
        } catch (err) {
            onErrorChange(err instanceof Error ? err.message : String(err));
        }
    };

    const handleImageBuilt = () => {
        try {
            if (!currentGraph) {
                throw new Error("Граф не определен");
            }
            
            const builtGraph = ReconstructOriginalGraph.reconstructOriginalGraph(currentGraph);
            onImageBuilt(builtGraph);
        } catch (error) {
            onErrorChange('Граф не является реберным');
        }  
    };

    const handleCalculateEdgeConnectivity = () => {
        if (!currentGraph) {
            onErrorChange('Сначала постройте диаграмму Хассе');
            return;
        }
        try {
            const connectivity = GraphConnectivity.getEdgeConnectivity(currentGraph);
            onEdgeConnectivityChange(connectivity);
        } catch (error) {
            console.error('Error calculating edge connectivity:', error);
            onEdgeConnectivityChange(null);
            onErrorChange('Ошибка при вычислении реберной связности');
        }
    };

    const handleCalculateVertexConnectivity = () => {
        if (!currentGraph) {
            onErrorChange('Сначала постройте диаграмму Хассе');
            return;
        }
        try {
            const connectivity = GraphConnectivity.getVertexConnectivity(currentGraph);
            onVertexConnectivityChange(connectivity);
        } catch (error) {
            console.error('Error calculating vertex connectivity:', error);
            onVertexConnectivityChange(null);
            onErrorChange('Ошибка при вычислении вершинной связности');
        }
    };

    const handleFindBlocks = () => {
        if (!currentGraph) {
            onErrorChange('Сначала постройте диаграмму Хассе');
            return;
        }
        if (currentGraph.is_directed) {
            onErrorChange('Для поиска блоков граф должен быть неориентированным. Сначала преобразуйте граф в неориентированный.');
            return;
        }
        try {
            const blockFinder = new BlockFinder<number, any>();
            const blocks = blockFinder.findBlocks(currentGraph);
            onFindBlocks(blocks);
        } catch (err) {
            onErrorChange(err instanceof Error ? err.message : String(err));
        }
    };

    const handleFindMinimumSpanningTree = () => {
        if (!currentGraph) {
            onErrorChange('Сначала постройте диаграмму Хассе');
            return;
        }
        console.log('Current graph edges:', currentGraph.edges);
        console.log('Has weights:', currentGraph.edges.some((edge: { props: any; }) => 
            edge.props && (edge.props as any).weight !== undefined
        ));
        try {
            const mst = BuildingOstov.findMinimumSpanningTree(currentGraph);
            onFindMinimumSpanningTree(mst);
        } catch (err) {
            onErrorChange(err instanceof Error ? err.message : String(err));
        }
    };

    const handleMakeEulerian = () => {
        if (!currentGraph) {
            onErrorChange('Сначала постройте диаграмму Хассе');
            return;
        }

        try {
             const clonedGraph = currentGraph.clone();
            const newGraph = EulerGraph.makeEulerian(clonedGraph);
            onMakeEulerian?.(newGraph);
            onErrorChange('Граф является эйлеровым');
        } catch (err) {
            // если ошибка — граф был НЕ эйлеров
            onErrorChange(err instanceof Error ? err.message : String(err));
        }
    };

    const handleCheckEulerian = () => {
        if (!currentGraph) {
            onErrorChange('Сначала постройте диаграмму Хассе');
            return;
        }

        const isEulerian = EulerGraph.checkIfEulerian(currentGraph);

        onCheckEulerian?.(isEulerian);

        onErrorChange(
            isEulerian
                ? 'Граф является эйлеровым'
                : 'Граф не является эйлеровым'
        );
    };

    const handleMakeHamiltonian = () => {
        if (!currentGraph) {
            onErrorChange('Сначала постройте диаграмму Хассе');
            return;
        }

        try {
            const clonedGraph = currentGraph.clone();
            const newGraph = HamiltonianGraph.makeHamiltonian(clonedGraph);
            onMakeHamiltonian?.(newGraph);
            onErrorChange('Граф является эйлеровым');
        } catch (err) {
            onErrorChange(err instanceof Error ? err.message : String(err));
        }
    };

    const handleCheckHamiltonian = () => {
        if (!currentGraph) {
            onErrorChange('Сначала постройте диаграмму Хассе');
            return;
        }

        const isHamiltonian = HamiltonianGraph.isHamiltonian(currentGraph);

        onCheckEulerian?.(isHamiltonian);

        onErrorChange(
            isHamiltonian
                ? 'Граф является гамильтоновым'
                : 'Граф не является гамильтоновым'
        );
    };



    return (
        <div className="controls-section full-height">
            <div className="controls-section-header">
                <h2 className="controls-section-title">Управление графом</h2>
            </div>

            <div className="controls-grid">
                <div className="control-group">
                    <h3 className="control-group-title">Матрицы</h3>
                    <div className="control-buttons">
                        <button 
                            onClick={handleBuildAdjacencyMatrix}
                            className="control-button matrix-button"
                            disabled={!currentGraph}
                        >
                            Матрица смежности
                        </button>
                        <button 
                            onClick={handleBuildIncidenceMatrix}
                            className="control-button matrix-button"
                            disabled={!currentGraph}
                        >
                            Матрица инцидентности
                        </button>
                        <button 
                            onClick={handleBuildDistanceMatrix}
                            className="control-button matrix-button"
                            disabled={!currentGraph}
                        >
                            Матрица расстояний
                        </button>
                        <button 
                            onClick={handleBuildCycleMatrix}
                            className="control-button matrix-button"
                            disabled={!currentGraph}
                        >
                            Матрица циклов
                        </button>
                        <button 
                            onClick={handleBuildCutMatrix}
                            className="control-button matrix-button"
                            disabled={!currentGraph}
                        >
                            Матрица разрезов
                        </button>
                    </div>
                </div>

                <div className="control-group">
                    <h3 className="control-group-title">Устойчивость</h3>
                    <div className="control-buttons">
                        <button 
                            onClick={onInternalStability}
                            className={`control-button stability-button ${
                                activeMode === 'internal' ? 'active' : ''
                            }`}
                            disabled={!currentGraph}
                        >
                            Внутренняя устойчивость
                        </button>
                        <button 
                            onClick={onExternalPositiveStability}
                            className={`control-button stability-button ${
                                activeMode === 'external-positive' ? 'active' : ''
                            }`}
                            disabled={!currentGraph}
                        >
                            Положительная внешняя устойчивость
                        </button>
                        <button 
                            onClick={onExternalNegativeStability}
                            className={`control-button stability-button ${
                                activeMode === 'external-negative' ? 'active' : ''
                            }`}
                            disabled={!currentGraph}
                        >
                            Отрицательная внешняя устойчивость
                        </button>
                    </div>
                </div>

                <div className="control-group">
                    <h3 className="control-group-title">Анализ</h3>
                    <div className="control-buttons">
                        <button 
                            onClick={onConvertToUndirected}
                            className="control-button analysis-button"
                            disabled={!currentGraph}
                        >
                            Сделать неориентированным
                        </button>
                        <button 
                            onClick={handleImageBuilt}
                            className="control-button analysis-button"
                            disabled={!currentGraph}
                        >
                            Построить образ
                        </button>
                        <button 
                            onClick={handleCalculateEdgeConnectivity}
                            className="control-button analysis-button"
                            disabled={!currentGraph}
                        >
                            Поиск реберной связности
                        </button>
                        <button 
                            onClick={handleCalculateVertexConnectivity}
                            className="control-button analysis-button"
                            disabled={!currentGraph}
                        >
                            Поиск вершинной связности
                        </button>
                        <button 
                            onClick={handleFindBlocks}
                            className="control-button analysis-button"
                            disabled={!currentGraph}
                        >
                            Найти блоки графа
                        </button>
                        <button 
                            onClick={onAddWeights} // Новая кнопка
                            className="control-button analysis-button"
                            disabled={!currentGraph}
                        >
                            Добавить веса рёбер
                        </button>
                        <button 
                            onClick={handleFindMinimumSpanningTree}
                            className="control-button analysis-button"
                            disabled={!currentGraph}
                        >
                            Построить кратчайший остов
                        </button>
                    </div>
                </div>
                <div className="control-group">
                    <h3 className="control-group-title">Преобразование графов</h3>
                    <div className="control-buttons">
                        <button 
                            onClick={handleCheckEulerian}
                            className="control-button euler-button"
                            disabled={!currentGraph}
                        >
                            Проверить эйлеровость
                        </button>
                        <button 
                            onClick={handleMakeEulerian}
                            className="control-button euler-button"
                            disabled={!currentGraph}
                        >
                            Сделать граф Эйлеровым
                        </button>
                        <button 
                            onClick={handleCheckHamiltonian}
                            className="control-button euler-button"
                            disabled={!currentGraph}
                        >
                            Проверить гамильтоновость
                        </button>
                        <button 
                            onClick={handleMakeHamiltonian}
                            className="control-button euler-button"
                            disabled={!currentGraph}
                        >
                            Сделать граф Гамильтоновым
                        </button>
                    </div>
                </div>
            </div>

            <div className="control-actions">
                <button 
                    onClick={onResetHighlighting}
                    className="reset-button"
                    disabled={!currentGraph}
                >
                    Сбросить выделение
                </button>
                <button 
                    onClick={onClearAllMatrices}
                    className="reset-button"
                    disabled={!currentGraph}
                >
                    Очистить все матрицы
                </button>
            </div>
        </div>
    );
};
