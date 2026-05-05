import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Graph } from './lib/core/Graph';
import GraphVisualization from './components/ui/GraphVisualization';
import { Stability } from './lib/algorithms/Stability';
import { EulerGraph } from './lib/algorithms/EulerGraph';
import { HamiltonianGraph } from './lib/algorithms/HamiltonianGraph';
import HasseDiagramForm from './components/ui/HasseDiagramForm';
import { LoginPage } from './components/ui/LoginPage';
import { AppHeader } from './components/ui/AppHeader';
import { getRole, isAuthenticated } from './services/auth';
import { StudentPage } from './components/ui/StudentPage';
import './App.css';

const TeacherPage: React.FC = () => {
  const navigate = useNavigate();
  const [graph, setGraph] = useState<Graph<number, any> | null>(null);
  const [resetFlag, setResetFlag] = useState(false);
  const [highlightedNodes, setHighlightedNodes] = useState<{
    internal?: string[];
    external?: string[];
  }>({});
  const [highlightedBlocks, setHighlightedBlocks] = useState<Graph<number, any>[]>([]);
  const [isBlockModeActive, setIsBlockModeActive] = useState(false);
  const [minimumSpanningTree, setMinimumSpanningTree] = useState<Graph<number, any> | null>(null);
  const [addedEdgeIds, setAddedEdgeIds] = useState<string[]>([]);
  const [isEulerianMode, setIsEulerianMode] = useState(false);
  const [isHamiltonianMode, setIsHamiltonianMode] = useState(false);

  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }
  if (getRole() !== 'TEACHER') {
    return <Navigate to="/student" replace />;
  }

  const handleInternalStability = () => {
    if (!graph) return;
    const internalSet = Stability.findMaxInternalStableSet(graph);
    setHighlightedNodes({ internal: internalSet.map(n => n.id), external: undefined });
    setHighlightedBlocks([]);
    setIsBlockModeActive(false);
    setIsEulerianMode(false);
    setIsHamiltonianMode(false);
  };

  const handleExternalPositiveStability = () => {
    if (!graph) return;
    const externalSet = Stability.findExternalStabilityPositive(graph);
    setHighlightedNodes({ external: externalSet.map(n => n.id), internal: undefined });
    setHighlightedBlocks([]);
    setIsBlockModeActive(false);
    setIsEulerianMode(false);
    setIsHamiltonianMode(false);
  };

  const handleExternalNegativeStability = () => {
    if (!graph) return;
    const externalSet = Stability.findExternalStabilityNegative(graph);
    setHighlightedNodes({ external: externalSet.map(n => n.id), internal: undefined });
    setHighlightedBlocks([]);
    setIsBlockModeActive(false);
    setIsEulerianMode(false);
    setIsHamiltonianMode(false);
  };

  const handleResetHighlighting = () => {
    setHighlightedNodes({});
    setHighlightedBlocks([]);
    setMinimumSpanningTree(null);
    setIsBlockModeActive(false);
    setResetFlag(prev => !prev);
    setIsEulerianMode(false);
    setIsHamiltonianMode(false);
    setAddedEdgeIds([]);
    setResetFlag(prev => !prev);
  };

  const handleDiagramBuilt = (builtGraph: Graph<number, any>) => {
    setGraph(builtGraph);
    setHighlightedNodes({});
    setHighlightedBlocks([]);
    setIsBlockModeActive(false);
    setIsEulerianMode(false);
    setIsHamiltonianMode(false);
    setAddedEdgeIds([]);
  };

  const handleConvertToUndirected = () => {
    if (graph && graph.is_directed) {
      const undirectedGraph = graph.convertToUndirected();
      setGraph(undirectedGraph);
      setHighlightedNodes({});
      setHighlightedBlocks([]);
      setIsBlockModeActive(false);
      setIsEulerianMode(false);
      setIsHamiltonianMode(false);
      setAddedEdgeIds([]);
    }
  };

  const handleImageBuilt = (builtGraph: Graph<number, any>) => {
    setGraph(builtGraph);
    setHighlightedNodes({});
    setHighlightedBlocks([]);
    setIsBlockModeActive(false);
    setIsEulerianMode(false);
    setIsHamiltonianMode(false);
    setAddedEdgeIds([]);
  };

  const handleFindBlocks = (blocks: Graph<number, any>[]) => {
    setHighlightedBlocks(blocks);
    setIsBlockModeActive(true);
    setHighlightedNodes({});
    setIsEulerianMode(false);
    setIsHamiltonianMode(false);
    setAddedEdgeIds([]);
  };

  const handleAddWeights = () => {
    if (!graph) return;
    const weightGraph = graph.createWeightedGraph();
    setGraph(weightGraph);
    setHighlightedNodes({});
    setHighlightedBlocks([]);
    setIsBlockModeActive(false);
    setIsEulerianMode(false);
    setIsHamiltonianMode(false);
    setAddedEdgeIds([]);
  };

  const handleFindMinimumSpanningTree = (mst: Graph<number, any>) => {
    setMinimumSpanningTree(mst);
    setHighlightedNodes({});
    setHighlightedBlocks([]);
    setIsBlockModeActive(false);
    setIsEulerianMode(false);
    setIsHamiltonianMode(false);
    setAddedEdgeIds([]);
  };

  const handleMakeEulerian = (g: Graph<number, any>) => {
    setGraph(g);
    const newEdgeIds = EulerGraph.getAddedEdgeIds?.() || [];
    setAddedEdgeIds(newEdgeIds);
    setIsEulerianMode(true);
    setIsHamiltonianMode(false);
    setHighlightedNodes({});
    setHighlightedBlocks([]);
    setIsBlockModeActive(false);
    setMinimumSpanningTree(null);
  };

  const handleMakeHamiltonian = (g: Graph<number, any>) => {
    setGraph(g);
    const newEdgeIds = HamiltonianGraph.getAddedEdgeIds?.() || [];
    setAddedEdgeIds(newEdgeIds);
    setIsHamiltonianMode(true);
    setIsEulerianMode(false);
    setHighlightedNodes({});
    setHighlightedBlocks([]);
    setIsBlockModeActive(false);
    setMinimumSpanningTree(null);
  };

  return (
    <div className="app-container">
      <AppHeader onLogout={() => navigate('/auth')} />

      <HasseDiagramForm
        currentGraph={graph}
        onDiagramBuilt={handleDiagramBuilt}
        onInternalStability={handleInternalStability}
        onExternalPositiveStability={handleExternalPositiveStability}
        onExternalNegativeStability={handleExternalNegativeStability}
        onResetHighlighting={handleResetHighlighting}
        handleConvertToUndirected={handleConvertToUndirected}
        isDirected={graph ? graph.is_directed : true}
        onImageBuilt={handleImageBuilt}
        onFindBlocks={handleFindBlocks}
        isBlockModeActive={isBlockModeActive}
        onAddWeights={handleAddWeights}
        onFindMinimumSpanningTree={handleFindMinimumSpanningTree}
        onMakeEulerian={handleMakeEulerian}
        onMakeHamiltonian={handleMakeHamiltonian}
      />

      {graph && (
        <GraphVisualization
          graph={graph}
          isDirected={graph.is_directed}
          highlightedNodes={highlightedNodes}
          highlightedBlocks={highlightedBlocks}
          minimumSpanningTree={minimumSpanningTree}
          resetTrigger={resetFlag}
          addedEdges={isEulerianMode || isHamiltonianMode ? addedEdgeIds : []}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/auth" element={<AuthRoute />} />
      <Route path="/student" element={<StudentRoute />} />
      <Route path="/*" element={<TeacherPage />} />
    </Routes>
  );
};

const AuthRoute: React.FC = () => {
  const navigate = useNavigate();

  if (isAuthenticated()) {
    return <Navigate to={getRole() === 'STUDENT' ? '/student' : '/'} replace />;
  }

  return <LoginPage onLoginSuccess={() => navigate(getRole() === 'STUDENT' ? '/student' : '/')} />;
};

const StudentRoute: React.FC = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }
  if (getRole() !== 'STUDENT') {
    return <Navigate to="/" replace />;
  }
  return <StudentPage />;
};

export default App;
