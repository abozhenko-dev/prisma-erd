import { FC, MouseEvent, useCallback } from "react";

import { nodeTypes } from "@constants";
import {
  calcSourcePosition,
  calcTargetPosition,
  calculateEdges,
  calculateNodes,
  edgeClass,
  edgeMarker,
  fixSVGZIndex,
  setEdgeClass,
  setEdgeHighlightClass
} from "@helpers";
import { debounce } from "lodash";
import {
  Background,
  Controls,
  Edge,
  Node,
  NodeChange,
  OnSelectionChangeParams,
  ReactFlow,
  ReactFlowInstance,
  getConnectedEdges,
  getIncomers,
  getOutgoers,
  useEdgesState,
  useNodesState,
  useStoreApi
} from "reactflow";

import { Markers } from "@components/icons";

import { ApiService } from "@services";

export interface FlowProps {
  nodes: Node[];
  edges: Edge[];
}

const debouncedUpdatePosition = debounce(ApiService.updatePosition, 500);

export const Flow: FC<FlowProps> = ({ nodes: initialNodes, edges: initialEdges }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const store = useStoreApi();

  const onInit = async (instance: ReactFlowInstance) => {
    const nodes = instance.getNodes();
    const recalculatedNodes = await calculateNodes(nodes);
    setNodes(() => recalculatedNodes);

    const recalculatedEdges = calculateEdges(recalculatedNodes, initialEdges);
    setEdges(() => recalculatedEdges);
  };

  const handleNodesChange = useCallback(
    async (nodeChanges: NodeChange[]) => {
      for (const nodeChange of nodeChanges) {
        if (nodeChange.type === "position" && nodeChange.positionAbsolute) {
          await debouncedUpdatePosition(nodeChange.id, nodeChange.positionAbsolute);

          const node = nodes.find((node) => node.id === nodeChange.id);
          if (!node) return;

          const incomingNodes = getIncomers(node, nodes, edges);
          for (const incomingNode of incomingNodes) {
            const edge = edges.find((edge) => edge.id === `${incomingNode.id}To${node.id}`);

            if (nodeChange.positionAbsolute?.x) {
              setEdges((edgs) =>
                edgs.map((item) => {
                  if (edge && item.id === edge.id) {
                    const sourcePosition = calcSourcePosition(
                      incomingNode.width as number,
                      incomingNode.position.x,
                      node.width as number,
                      nodeChange.positionAbsolute!.x
                    );
                    const targetPosition = calcTargetPosition(
                      incomingNode.width as number,
                      incomingNode.position.x,
                      node.width as number,
                      nodeChange.positionAbsolute!.x
                    );

                    item.sourceHandle = `${edge.data.initialSourceHandle}-${sourcePosition}`;
                    item.targetHandle = `${edge.data.initialTargetHandle}-${targetPosition}`;
                    item.markerStart = edgeMarker(edge.data.relation);
                    item.className = edgeClass(edge.data.relation);
                  }

                  return item;
                })
              );
            }
          }

          const outgoingNodes = getOutgoers(node, nodes, edges);
          for (const outgoingNode of outgoingNodes) {
            const edge = edges.find((edge) => edge.id === `${node.id}To${outgoingNode.id}`);

            if (nodeChange.positionAbsolute?.x) {
              setEdges((edgs) =>
                edgs.map((item) => {
                  if (edge && item.id === edge.id) {
                    const sourcePosition = calcSourcePosition(
                      node.width as number,
                      nodeChange.positionAbsolute!.x,
                      outgoingNode.width as number,
                      outgoingNode.position.x
                    );
                    const targetPosition = calcTargetPosition(
                      node.width as number,
                      nodeChange.positionAbsolute!.x,
                      outgoingNode.width as number,
                      outgoingNode.position.x
                    );

                    item.sourceHandle = `${edge.data.initialSourceHandle}-${sourcePosition}`;
                    item.targetHandle = `${edge.data.initialTargetHandle}-${targetPosition}`;
                    item.markerStart = edgeMarker(edge.data.relation);
                    item.className = edgeClass(edge.data.relation);
                  }

                  return item;
                })
              );
            }
          }
        }
      }

      onNodesChange(nodeChanges);
    },
    [onNodesChange, setEdges, nodes, edges]
  );

  const handleSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    const { edges } = params;
    edges.forEach((ed) => {
      const svg = document.querySelector(".react-flow__edges")?.querySelector(`[data-testid="rf__edge-${ed.id}"]`);
      fixSVGZIndex(svg);
    });
  }, []);

  const handleNodeMouseEnter = useCallback(
    (_: MouseEvent, node: Node) => {
      const state = store.getState();

      state.resetSelectedElements();
      state.addSelectedNodes([node.id]);

      const connectedEdges = getConnectedEdges([node], edges);

      setEdges((eds) =>
        eds.map((ed) => {
          if (connectedEdges.find((e) => e.id === ed.id)) {
            setEdgeHighlightClass(ed);
          }

          return ed;
        })
      );
    },
    [edges, setEdges, store]
  );

  const handleNodeMouseLeave = useCallback(() => {
    const state = store.getState();
    state.resetSelectedElements();

    setEdges((eds) => eds.map((ed) => setEdgeClass(ed)));

    (document.activeElement as HTMLElement).blur();
  }, [setEdges, store]);

  return (
    <ReactFlow
      className="flow"
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onInit={onInit}
      onNodesChange={handleNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeMouseEnter={handleNodeMouseEnter}
      onNodeMouseLeave={handleNodeMouseLeave}
      onSelectionChange={handleSelectionChange}
      fitView
      defaultViewport={{
        x: 0,
        y: 0,
        zoom: 1
      }}
      minZoom={0.1}
      maxZoom={4}
      snapToGrid={true}
      snapGrid={[10, 10]}
    >
      <Markers />
      <Controls />
      <Background color="#aaa" gap={16} />
    </ReactFlow>
  );
};
