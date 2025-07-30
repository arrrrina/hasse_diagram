import React, { useState} from 'react';
import HasseDiagramForm from './components/HasseDiagramForm';
import { Graph } from './lib/Graph';
import GraphVisualization from './components/GraphVisualization';

const App: React.FC = () => {
  const [graph, setGraph] = useState<Graph<number, any> | null>(null);
  const [resetFlag, setResetFlag] = useState(false);
  const [highlightedNodes, setHighlightedNodes] = useState<{
    internal?: string[];
    external?: string[];
  }>({});
  

  const handleInternalStability = () => {
    if (!graph) return;
    const internalSet = graph.findMaxInternalStableSet();
    setHighlightedNodes({
      internal: internalSet.map(n => n.id),
      external: undefined
    });
  };

  const handleExternalPositiveStability = () => {
    if (!graph) return;
    const externalSet = graph.findExternalStabilityPositive();
    setHighlightedNodes({
      external: externalSet.map(n => n.id),
      internal: undefined
    });
  };
  const handleExternalNegativeStability = () => {
    if (!graph) return;
    const externalSet = graph.findExternalStabilityNegative();
    setHighlightedNodes({
      external: externalSet.map(n => n.id),
      internal: undefined
    });
  };

  const handleResetHighlighting = () => {
    setHighlightedNodes({});
    setResetFlag(prev => !prev);
  };
  
  const handleDiagramBuilt = (builtGraph: Graph<number, any>) => {
     console.log('handleDiagramBuilt called, isDirected:', builtGraph.isDirected);
    setGraph(builtGraph);
  };

  const handleConvertToUndirected = () => {
    if (graph && graph.isDirected) {
        const undirectedGraph = graph.convertToUndirected(); // ← это вызывает твой метод внутри Graph
        setGraph(undirectedGraph); 
        
    }
    
};
console.log('graph:', graph);
console.log('App render, graph isDirected:', graph?.isDirected);
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Диаграмма Хассе для отношения делимости</h1>
      
      
      <HasseDiagramForm 
      onDiagramBuilt={handleDiagramBuilt}
      onInternalStability={handleInternalStability}
      onExternalPositiveStability={handleExternalPositiveStability}
      onExternalNegativeStability={handleExternalNegativeStability}
      onResetHighlighting = {handleResetHighlighting}
      handleConvertToUndirected={handleConvertToUndirected}
      isDirected={graph ? graph.isDirected : true} 
       />
      
      {graph && (
        <GraphVisualization
         graph={graph}
         isDirected={graph.isDirected} 
         highlightedNodes={highlightedNodes}
         resetTrigger={resetFlag}
          />
        )}
    </div>
  );
};

export default App;
