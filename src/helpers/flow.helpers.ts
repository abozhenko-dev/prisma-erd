import { Edge, Node } from "reactflow";

import { ApiService } from "@services";

import { fixSVGZIndex } from "./svg.helpers";

/* ---------------------------------------------------------------------------------------------- */

export const calcSourcePosition = (
  sourceNodeWidth: number,
  sourceNodeX: number,
  targetNodeWidth: number,
  targetNodeX: number
) => {
  let position: string;

  switch (true) {
    case sourceNodeX > targetNodeX + targetNodeWidth:
      position = "left";
      break;

    case sourceNodeX + sourceNodeWidth > targetNodeX:
      position = "left";
      break;

    case sourceNodeX > targetNodeX && sourceNodeX < targetNodeX + targetNodeWidth:
      position = "right";
      break;

    default:
      position = "right";
      break;
  }

  return position;
};

/* ---------------------------------------------------------------------------------------------- */

export const calcTargetPosition = (
  sourceNodeWidth: number,
  sourceNodeX: number,
  targetNodeWidth: number,
  targetNodeX: number
) => {
  let position: string;

  switch (true) {
    case sourceNodeX > targetNodeX + targetNodeWidth:
      position = "right";
      break;

    case sourceNodeX > targetNodeX && sourceNodeX < targetNodeX + targetNodeWidth:
      position = "right";
      break;

    case sourceNodeX + sourceNodeWidth > targetNodeX:
      position = "left";
      break;

    default:
      position = "left";
      break;
  }

  return position;
};

/* ---------------------------------------------------------------------------------------------- */

export const edgeMarker = (relation: string) => {
  relation += "Reversed";
  return relation;
};

/* ---------------------------------------------------------------------------------------------- */

export const edgeClass = (relation: string) => {
  let className = relation === "hasOne" ? "has-one-edge" : "has-many-edge";
  className += "-reversed";
  return className;
};

/* ---------------------------------------------------------------------------------------------- */

export const calculateEdges = (nodes: Node[], edges: Edge[]) => {
  const recalculatedEdges: Edge[] = [];

  for (const edge of edges) {
    const sourceNode = nodes.find((node) => node.id === edge.source);
    const targetNode = nodes.find((node) => node.id === edge.target);

    if (sourceNode && targetNode) {
      const sourcePosition = calcSourcePosition(
        sourceNode.width as number,
        sourceNode!.position.x,
        targetNode.width as number,
        targetNode!.position.x
      );

      const targetPosition = calcTargetPosition(
        sourceNode.width as number,
        sourceNode!.position.x,
        targetNode.width as number,
        targetNode!.position.x
      );

      const sourceHandle = `${edge.data.initialSourceHandle}-${sourcePosition}`;
      const targetHandle = `${edge.data.initialTargetHandle}-${targetPosition}`;

      recalculatedEdges.push({
        ...edge,
        sourceHandle,
        targetHandle,
        markerStart: edgeMarker(edge.data.relation),
        className: edgeClass(edge.data.relation)
      });
    }
  }

  return recalculatedEdges;
};

/* ---------------------------------------------------------------------------------------------- */

export const calculateNodes = async (nodes: Node[]) => {
  const recalculatedNodes: Node[] = [];

  const gapSize = 40;
  let gridX = -240; // Начальное значение координаты X
  let gridY = -192; // Начальное значение координаты Y

  const maxRowWidth = 1000;
  let maxRowHeight = 0; // Максимальная высота ноды на текущей строке

  for (const node of nodes) {
    let position = await ApiService.getPosition(node.id);

    const nodeWidth = node.width || 150;
    const nodeHeight = node.height || 150;

    if (gridX + nodeWidth > maxRowWidth) {
      // Переход на новую строку сетки
      gridX = -240;
      gridY += maxRowHeight + gapSize; // Добавляем максимальную высоту ноды на предыдущей строке
      maxRowHeight = 0; // Сбрасываем максимальную высоту
    }

    if (position.x === 0 || position.y === 0) {
      position = await ApiService.updatePosition(node.id, { x: gridX, y: gridY });
    }

    recalculatedNodes.push({ ...node, position: { x: position.x, y: position.y } });

    gridX += nodeWidth + gapSize;
    maxRowHeight = Math.max(maxRowHeight, nodeHeight);
  }

  return recalculatedNodes;
};

/* ---------------------------------------------------------------------------------------------- */

export const setEdgeHighlightClass = (edge: Edge) => {
  let className, markerStart;

  switch (true) {
    case edge.className?.includes("has-many-edge-reversed"):
      className = "has-many-edge-reversed has-many-edge-reversed--highlighted";
      markerStart = "hasManyReversedHighlighted";
      break;

    case edge.className?.includes("has-many-edge"):
      className = "has-many-edge has-many-edge--highlighted";
      markerStart = "hasManyHighlighted";
      break;

    case edge.className?.includes("has-one-edge-reversed"):
      className = "has-one-edge-reversed has-one-edge-reversed--highlighted";
      markerStart = "hasOneReversedHighlighted";
      break;

    case edge.className?.includes("has-one-edge"):
      className = "has-one-edge has-one-edge--highlighted";
      markerStart = "hasOneHighlighted";
      break;

    default:
      return;
  }

  edge.className = className;
  edge.markerStart = markerStart;

  const svg = document.querySelector(".react-flow__edges")?.querySelector(`[data-testid="rf__edge-${edge.id}"]`);
  fixSVGZIndex(svg);
};

/* ---------------------------------------------------------------------------------------------- */

export const setEdgeClass = (edge: Edge) => {
  switch (true) {
    case edge.className?.includes("has-many-edge-reversed"):
      edge.className = "has-many-edge-reversed";
      edge.markerStart = "hasManyReversed";
      break;

    case edge.className?.includes("has-many-edge"):
      edge.className = "has-many-edge";
      edge.markerStart = "hasMany";
      break;

    case edge.className?.includes("has-one-edge-reversed"):
      edge.className = "has-one-edge-reversed";
      edge.markerStart = "hasOneReversed";
      break;

    case edge.className?.includes("has-one-edge"):
      edge.className = "has-one-edge";
      edge.markerStart = "hasOne";
      break;

    default:
      break;
  }

  return edge;
};
