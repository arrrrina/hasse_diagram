import React, { useState, useEffect } from 'react';
import { Graph } from '../../lib/core/Graph';
import { InputSection } from './InputSection';
import { ControlSection } from './ControlSection';
import { MatrixSection } from './MatrixSection';
import './styles/HasseDiagramForm.css';
import './styles/InputSection.css'; 
import './styles/ControlsSection.css';
import { EulerGraph } from '../../lib/algorithms/EulerGraph';



interface HasseDiagramFormProps {
    currentGraph: Graph<number, any> | null;
    onDiagramBuilt: (graph: Graph<number, any>) => void;
    onInternalStability?: () => void;
    onExternalPositiveStability?: () => void;
    onExternalNegativeStability?: () => void;
    onResetHighlighting?: () => void;
    handleConvertToUndirected: () => void;
    isDirected: boolean;
    onImageBuilt: (graph: Graph<number, any>) => void;
    onFindBlocks: (blocks: Graph<number, any>[]) => void; // Добавляем
    isBlockModeActive: boolean;
    onAddWeights: () => void;
    onFindMinimumSpanningTree: (mst: Graph<number, any>) => void;
    onMakeEulerian?: (graph: Graph<number, any>) => void;
    onCheckEulerian?: (isEulerian: boolean) => void;
    onMakeHamiltonian?: (graph: Graph<number, any>) => void;
    onCheckHamiltonian?: (isHamiltonian: boolean) => void;
}

const HasseDiagramForm: React.FC<HasseDiagramFormProps> = ({ 
    currentGraph,
    onDiagramBuilt,
    onInternalStability,
    onExternalPositiveStability,
    onExternalNegativeStability,
    onResetHighlighting,
    handleConvertToUndirected,
    isDirected,
    onImageBuilt,
    onFindBlocks, 
    isBlockModeActive,
    onAddWeights,
    onFindMinimumSpanningTree,
    onMakeEulerian,  
    onCheckEulerian,
    onMakeHamiltonian,
    onCheckHamiltonian
 }) => {
    const [input1, setInput1] = useState('');
    const [input2, setInput2] = useState('');
    const [error, setError] = useState('');
    const [adjacencyMatrix, setAdjacencyMatrix] = useState<any>(null);
    const [incidenceMatrix, setIncidenceMatrix] = useState<any>(null);
    const [activeMode, setActiveMode] = useState<'internal' | 'external-positive' | 'external-negative' | null>(null);
    const [distanceMatrix, setDistanceMatrix] = useState<any>(null);
    const [graphRadius, setGraphRadius] = useState<number>(-1);
    const [graphDiameter, setGraphDiameter] = useState<number>(-1);
    const [edgeConnectivity, setEdgeConnectivity] = useState<number | null>(null);
    const [vertexConnectivity, setVertexConnectivity] = useState<number | null>(null);
    const [cycleMatrix, setCycleMatrix] = useState<any>(null);
    const [cutMatrix, setCutMatrix] = useState<any>(null);
    const [addedEdgeIds, setAddedEdgeIds] = useState<string[]>(); 

    useEffect(() => {
        console.log('error state changed:', error);
    }, [error]);

    const handleFindBlocks = (blocks: Graph<number, any>[]) => {
        onFindBlocks(blocks); // Передаем блоки родительскому компоненту
        setActiveMode(null);
    };



    const clearAllMatrices = () => {
        setAdjacencyMatrix(null);
        setIncidenceMatrix(null);
        setDistanceMatrix(null);
        setGraphRadius(-1);
        setGraphDiameter(-1);
        setEdgeConnectivity(null);
        setVertexConnectivity(null);
        setCycleMatrix(null); 
        setCutMatrix(null); 
        setActiveMode(null);
        setAddedEdgeIds([]);
        setError('');
    };
     const handleGraphBuilt = (graph: Graph<number, any>) => {
        clearAllMatrices(); // Сбрасываем все матрицы при новом построении
        onDiagramBuilt(graph);
    };

    const handleMakeEulerian = (graph: Graph<number, any>) => {
        const newEdgeIds = EulerGraph.getAddedEdgeIds();
        setAddedEdgeIds(newEdgeIds);
        onMakeEulerian?.(graph);
        clearAllMatrices();
    };


    const handleCheckEulerian = (isEulerian: boolean) => {
        onCheckEulerian?.(isEulerian);

    };

    const handleMakeHamiltonian = (graph: Graph<number, any>) => {
        onMakeHamiltonian?.(graph);
        clearAllMatrices();
    };


    const handleCheckHamiltonian = (isHamiltonian: boolean) => {
        onCheckHamiltonian?.(isHamiltonian);
        
    };



    const hasResults = adjacencyMatrix || incidenceMatrix || distanceMatrix || cycleMatrix || cutMatrix || edgeConnectivity !== null;


    return (
        <div className="hasse-diagram-form">
            {/* Верхняя часть: форма ввода + управление */}
            <div className="top-section">
                <div className="input-container">
                    <InputSection
                        input1={input1}
                        input2={input2}
                        error={error}
                        onInput1Change={setInput1}
                        onInput2Change={setInput2}
                        onErrorChange={setError}
                        onGraphBuilt={handleGraphBuilt}
                        onDiagramBuilt={onDiagramBuilt}
                        isDirected={isDirected}
                    />
                </div>
                
                <div className="controls-container">
                    <ControlSection
                        currentGraph={currentGraph}
                        activeMode={activeMode}
                        onInternalStability={() => {
                            setActiveMode('internal');
                            onInternalStability?.();
                        } }
                        onExternalPositiveStability={() => {
                            setActiveMode('external-positive');
                            onExternalPositiveStability?.();
                        } }
                        onExternalNegativeStability={() => {
                            setActiveMode('external-negative');
                            onExternalNegativeStability?.();
                        } }
                        onResetHighlighting={() => {
                            setActiveMode(null);
                            onResetHighlighting?.();
                        } }
                        onConvertToUndirected={handleConvertToUndirected}
                        onImageBuilt={(graph) => {
                            onImageBuilt(graph);
                            currentGraph;
                            clearAllMatrices(); // Сбрасываем матрицы при построении образа
                        } }
                        onClearAllMatrices={clearAllMatrices} // Передаем функцию сброса
                        onErrorChange={setError}
                        onAdjacencyMatrixChange={setAdjacencyMatrix}
                        onIncidenceMatrixChange={setIncidenceMatrix}
                        onDistanceMatrixChange={setDistanceMatrix}
                        onGraphRadiusChange={setGraphRadius}
                        onGraphDiameterChange={setGraphDiameter}
                        onEdgeConnectivityChange={setEdgeConnectivity}
                        onVertexConnectivityChange={setVertexConnectivity} 
                        onFindBlocks={handleFindBlocks}
                        isBlockModeActive={isBlockModeActive}
                        onAddWeights={onAddWeights} 
                        onFindMinimumSpanningTree={onFindMinimumSpanningTree} 
                        onCycleMatrixChange={setCycleMatrix}
                        onCutMatrixChange={setCutMatrix}
                        onMakeEulerian={handleMakeEulerian}
                        onCheckEulerian={handleCheckEulerian}
                        onMakeHamiltonian={handleMakeHamiltonian}
                        onCheckHamiltonian={handleCheckHamiltonian}
                                         />
                </div>
            </div>


            {hasResults && (
                <div className="bottom-section">
                    <MatrixSection
                        adjacencyMatrix={adjacencyMatrix}
                        incidenceMatrix={incidenceMatrix}
                        distanceMatrix={distanceMatrix}
                        graphRadius={graphRadius}
                        graphDiameter={graphDiameter}
                        edgeConnectivity={edgeConnectivity}
                        vertexConnectivity={vertexConnectivity}
                        cycleMatrix={cycleMatrix}
                        cutMatrix={cutMatrix}
                        onClearAll={clearAllMatrices} 
                    />
                </div>
            )}
        </div>
    );
};

export default HasseDiagramForm;

