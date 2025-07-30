import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { Graph } from '../lib/Graph';

cytoscape.use(dagre);

type CytoscapeElement = {
  data: {
    id: string;
    label?: string;
    value?: number;
    source?: string;
    target?: string;
  };
};

interface GraphVisualizationProps {
  graph: Graph<number, any>;
  isDirected: boolean; 
  highlightedNodes?: {
    internal?: string[];
    external?: string[];
  };
  resetTrigger?: boolean;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({ 
  graph,
  isDirected,
  highlightedNodes, 
  resetTrigger
}) => {
  console.log('isDirected:', isDirected);
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  useEffect(() => {
  if (!containerRef.current || !graph) return;

  const nodes: CytoscapeElement[] = graph.nodes.map(node => ({
    data: {
      id: node.id,
      label: node.label || node.id,
      value: node.props
    }
  }));

  const edges: CytoscapeElement[] = graph.edges.map(edge => ({
    data: {
      id: edge.id,
      source: edge.source.id,
      target: edge.target.id
    }
  }));

  const cy = cytoscape({
    container: containerRef.current,
    elements: [...nodes, ...edges],
    style: [
      {
        selector: 'node',
        style: {
          'label': 'data(label)',
          'text-valign': 'center',
          'text-halign': 'center',
          'background-color': '#666',
          'color': '#fff',
          'width': '60px',
          'height': '60px',
          'font-size': '20px'
        }
      },
      {
        selector: 'node.internal-highlight',
        style: {
          'background-color': '#4CAF50',
          'color': '#fff'
        }
      },
      {
        selector: 'node.external-highlight',
        style: {
          'background-color': '#F44336',
          'color': '#fff'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 3,
          'line-color': '#ccc',
          'target-arrow-color': '#ccc',
          'target-arrow-shape': isDirected ? 'triangle' : 'none',
          'curve-style': 'bezier',
          'arrow-scale': 1.5
        }
      }
    ],
    layout: {
      name: 'dagre',
      rankDir: 'BT',
      animate: true,
      spacingFactor: 1.5
    } as any
  });

  cyRef.current = cy;

  return () => {
    cy.destroy();
    cyRef.current = null;
  };
}, [graph, isDirected]); // 👈 isDirected добавлен сюда




  useEffect(() => {
    if (!cyRef.current || !graph || !highlightedNodes ) return;
    
    

    const cy = cyRef.current;
    
    cy.elements().removeClass('internal-highlight external-highlight');
    
    if (!highlightedNodes || (!highlightedNodes.internal && !highlightedNodes.external)) {
      return;
    }
    
    if (highlightedNodes.internal) {
      highlightedNodes.internal.forEach(id => {
        cy.getElementById(id).addClass('internal-highlight');
      });
    }

    if (highlightedNodes.external) {
      highlightedNodes.external.forEach(id => {
        cy.getElementById(id).addClass('external-highlight');
      });
    }
  }, [highlightedNodes, resetTrigger]);

   
  return <div ref={containerRef} style={{ width: '100%', height: '500px', border: '1px solid #ddd' }} />;
};

export default GraphVisualization;