import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { Graph } from '../../lib/core/Graph';

cytoscape.use(dagre);

type CytoscapeElement = {
  data: {
    id: string;
    label?: string;
    value?: number;
    source?: string;
    target?: string;
    weight?: number;
    color?: string;
  };
};

interface GraphVisualizationProps {
  graph: Graph<number, any>;
  isDirected: boolean; 
  highlightedNodes?: {
    internal?: string[];
    external?: string[];
  };
  highlightedBlocks?: Graph<number, any>[];
  resetTrigger?: boolean;
  minimumSpanningTree?: Graph<number, any> | null;
  addedEdges?: string[] | Set<string>;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({ 
  graph,
  isDirected,
  highlightedNodes, 
  highlightedBlocks,
  resetTrigger,
  minimumSpanningTree,
  addedEdges
  
}) => {
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

    const edges: CytoscapeElement[] = graph.edges.map(edge => {
        const edgeData: CytoscapeElement['data'] = {
          id: edge.id,
          source: edge.source.id,
          target: edge.target.id,
          label: edge.props && (edge.props as any).weight !== undefined 
                ? `${(edge.props as any).weight}` 
                : '' 
        };

        if ((edge as any).getColor) {
          const edgeColor = (edge as any).getColor();
          if (edgeColor) {
            edgeData.color = edgeColor;
          }
        }

        if (edge.props && (edge.props as any).weight !== undefined) {
          edgeData.weight = (edge.props as any).weight;
        }

        return { data: edgeData };
      });


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
            'arrow-scale': 1.5,
            'label': 'data(label)',
            'text-rotation': 'autorotate',
            'text-margin-y': -10,
            'font-size': '14px',
            'color': '#333',
            'text-background-color': '#fff',
            'text-background-opacity': 0.8,
            'text-background-padding': '2px'
          }
        },
         {
          selector: 'edge.added-highlight',
          style: {
            'line-color': '#FF9800',
            'target-arrow-color': '#FF9800',
            'width': 6,
            'line-style': 'solid',
            'z-index': 20
          }
        },
        {
          selector: 'edge[color]',
          style: {
            'line-color': 'data(color)',
            'target-arrow-color': 'data(color)'
          }
        },
        {
          selector: 'node.block-highlight',
          style: {
            'border-width': '3px',
            'border-color': '#333',
            'border-opacity': 1
          }
        },
        {
          selector: 'edge.block-highlight', 
          style: {
            'width': 5,
            'line-style': 'solid'
          }
        },
        {
          selector: 'edge.mst-highlight',
          style: {
            'line-color': '#27ae60',
            'target-arrow-color': '#27ae60',
            'width': 6,
            'line-style': 'solid',
            'z-index': 10
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
  }, [graph, isDirected]); 


  useEffect(() => {
    if (!cyRef.current || !graph) return;
    
    const cy = cyRef.current;
    
    cy.elements().removeClass('internal-highlight external-highlight block-highlight mst-highlight added-highlight');
    cy.edges().style('line-color', null);
    cy.edges().style('target-arrow-color', null);
    cy.edges().style('width', null);
    cy.edges().style('line-style', null);

    if (addedEdges) {
      const addedEdgeIds = addedEdges instanceof Set ? Array.from(addedEdges) : addedEdges;
      addedEdgeIds.forEach(edgeId => {
        const element = cy.getElementById(edgeId);
        if (element) {
          element.addClass('added-highlight');
        }
      });
    }
    
    if (highlightedBlocks && highlightedBlocks.length > 0) {
      const blockColors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
      ];
      
      highlightedBlocks.forEach((block, blockIndex) => {
        const color = blockColors[blockIndex % blockColors.length];
        
        block.edges.forEach(edge => {
          const element = cy.getElementById(edge.id);
          if (element) {
            element.addClass('block-highlight');
            element.style('line-color', color);
            element.style('target-arrow-color', color);
          }
        });
      });
    }
    
  
    if (minimumSpanningTree) {
      minimumSpanningTree.edges.forEach(mstEdge => {
        const element = cy.getElementById(mstEdge.id);
        if (element) {
          element.addClass('mst-highlight');
        }
      });
    }

    if (highlightedNodes?.internal) {
      highlightedNodes.internal.forEach(id => {
        const element = cy.getElementById(id);
        if (element) {
          element.addClass('internal-highlight');
        }
      });
    }

    if (highlightedNodes?.external) {
      highlightedNodes.external.forEach(id => {
        const element = cy.getElementById(id);
        if (element) {
          element.addClass('external-highlight');
        }
      });
    }
  }, [graph, highlightedNodes, highlightedBlocks, minimumSpanningTree, resetTrigger]);

  return <div ref={containerRef} style={{ width: '100%', height: '500px', border: '1px solid #ddd' }} />;
};

export default GraphVisualization;