import type { Vec3Tuple } from '../../shared/types/save';
import type { Aabb, SceneDoor } from '../../shared/types/scene';

/** 门扇厚度略大于 0.2 m 的墙厚，保证装饰门在墙面两侧都能看见。 */
export const DOOR_THICKNESS = 0.24;

/** 关闭状态下门扇占据的包围盒。 */
export function doorBounds(door: SceneDoor): Aabb {
  const [x, y, z] = door.hinge;
  const half = DOOR_THICKNESS / 2;
  return door.axis === 'x'
    ? {
        min: [x, y, z - half],
        max: [x + door.width, y + door.height, z + half],
      }
    : {
        min: [x - half, y, z],
        max: [x + half, y + door.height, z + door.width],
      };
}

export function doorCenter(door: SceneDoor): Vec3Tuple {
  const [x, y, z] = door.hinge;
  const mid = door.width / 2;
  return door.axis === 'x'
    ? [x + mid, y + door.height / 2, z]
    : [x, y + door.height / 2, z + mid];
}

export function doorColliderId(doorId: string): string {
  return `door:${doorId}`;
}
