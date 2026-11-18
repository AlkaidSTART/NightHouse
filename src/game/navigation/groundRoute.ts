import type {
  GroundNavigationGraph,
  GroundNavigationNode,
} from '../../content/scenes/villaNavigation.ts';
import type { Vec3Tuple } from '../../shared/types/save';

export interface GroundRouteQuery {
  graph: GroundNavigationGraph;
  /** 当前任务目标区域；玩家进入该区域后返回空路径。 */
  targetRegionId: string;
  playerRegionId: string | null;
  playerPosition: Vec3Tuple;
}


/**
 * 在固定导航图上求从玩家所在区域到目标区域中心的最短路径。
 *
 * 返回空数组表示玩家已经进入目标区域；返回 null 表示区域未知或图不连通。
 * 结果包含玩家当前脚底位置作为首点，便于地面指示从玩家脚下开始。
 */
export function findGroundRoute(
  query: GroundRouteQuery,
): Vec3Tuple[] | null {
  const { graph, targetRegionId, playerRegionId, playerPosition } = query;
  if (playerRegionId === targetRegionId) {
    return [];
  }
  if (!playerRegionId) {
    return null;
  }

  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
  const targetNodes = graph.nodes.filter(
    (node) => node.regionId === targetRegionId && node.focus,
  );
  const startNodes = graph.nodes.filter(
    (node) => node.regionId === playerRegionId,
  );
  if (targetNodes.length === 0 || startNodes.length === 0) {
    return null;
  }

  const adjacency = new Map<string, string[]>();
  for (const [from, to] of graph.edges) {
    if (!nodesById.has(from) || !nodesById.has(to)) {
      continue;
    }
    const fromEdges = adjacency.get(from) ?? [];
    fromEdges.push(to);
    adjacency.set(from, fromEdges);
    const toEdges = adjacency.get(to) ?? [];
    toEdges.push(from);
    adjacency.set(to, toEdges);
  }

  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const queue: Array<{ id: string; distance: number }> = [];
  for (const start of startNodes) {
    const initialDistance = distance3d(playerPosition, start.position);
    distances.set(start.id, initialDistance);
    previous.set(start.id, null);
    queue.push({ id: start.id, distance: initialDistance });
  }

  const visited = new Set<string>();
  while (queue.length > 0) {
    let nextIndex = 0;
    for (let index = 1; index < queue.length; index += 1) {
      if ((queue[index]?.distance ?? Infinity) < (queue[nextIndex]?.distance ?? Infinity)) {
        nextIndex = index;
      }
    }
    const current = queue.splice(nextIndex, 1)[0];
    if (!current || visited.has(current.id)) {
      continue;
    }
    visited.add(current.id);
    const currentDistance = distances.get(current.id);
    if (currentDistance === undefined) {
      continue;
    }

    for (const nextId of adjacency.get(current.id) ?? []) {
      const next = nodesById.get(nextId);
      const currentNode = nodesById.get(current.id);
      if (!next || !currentNode) {
        continue;
      }
      const candidateDistance =
        currentDistance + distance3d(currentNode.position, next.position);
      if (candidateDistance >= (distances.get(nextId) ?? Infinity)) {
        continue;
      }
      distances.set(nextId, candidateDistance);
      previous.set(nextId, current.id);
      queue.push({ id: nextId, distance: candidateDistance });
    }
  }

  let destination: GroundNavigationNode | null = null;
  let destinationDistance = Infinity;
  for (const target of targetNodes) {
    const candidate = distances.get(target.id);
    if (candidate !== undefined && candidate < destinationDistance) {
      destination = target;
      destinationDistance = candidate;
    }
  }
  if (!destination) {
    return null;
  }

  const pathIds: string[] = [];
  let cursor: string | null = destination.id;
  while (cursor) {
    pathIds.push(cursor);
    cursor = previous.get(cursor) ?? null;
  }
  pathIds.reverse();

  const points: Vec3Tuple[] = [playerPosition];
  for (const id of pathIds) {
    const node = nodesById.get(id);
    if (node) {
      points.push(node.position);
    }
  }
  return removeDuplicatePoints(points);
}

export function distance3d(a: Vec3Tuple, b: Vec3Tuple): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
}

function removeDuplicatePoints(points: readonly Vec3Tuple[]): Vec3Tuple[] {
  const result: Vec3Tuple[] = [];
  for (const point of points) {
    const previous = result.at(-1);
    if (previous && distance3d(previous, point) < 0.02) {
      continue;
    }
    result.push([point[0], point[1], point[2]]);
  }
  return result;
}
