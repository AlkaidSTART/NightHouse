import { useMemo } from 'react';
import { villaGreybox } from '../../content/scenes/villaGreybox';
import type { Vec3Tuple } from '../../shared/types/save';
import {
  buildMinimapLevel,
  resolveMinimapLevel,
  worldToMinimap,
} from './minimapModel';

export interface MinimapPlayerPose {
  position: Vec3Tuple;
  yaw: number;
}

export interface MinimapProps {
  regionId: string | null;
  player: MinimapPlayerPose | null;
}

const MIN_LABEL_WIDTH = 30;
const MIN_LABEL_HEIGHT = 13;

export function Minimap({ regionId, player }: MinimapProps) {
  const feetY = player?.position[1] ?? 0;
  const level = resolveMinimapLevel(regionId, feetY);
  const model = useMemo(() => buildMinimapLevel(villaGreybox, level), [level]);

  const marker = player
    ? worldToMinimap(model.viewport, player.position[0], player.position[2])
    : null;

  return (
    <div className="hud-minimap">
      <div className="hud-minimap-header">
        <span className="hud-minimap-level">{model.label}</span>
        <span className="hud-minimap-north" aria-label="北">
          N
        </span>
      </div>
      <svg
        className="hud-minimap-map"
        viewBox={`0 0 ${model.size} ${model.size}`}
        role="img"
        aria-label={`小地图（${model.label}）`}
      >
        <rect
          className="minimap-backdrop"
          width={model.size}
          height={model.size}
        />
        {model.rooms.map((room, index) => {
          const current = !room.muted && room.id === regionId;
          const showLabel =
            !room.muted &&
            room.width >= MIN_LABEL_WIDTH &&
            room.height >= MIN_LABEL_HEIGHT;
          return (
            <g key={`${room.id}-${index}`}>
              <rect
                className={[
                  'minimap-room',
                  room.muted ? 'minimap-room-muted' : '',
                  current ? 'minimap-room-current' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                x={room.x}
                y={room.y}
                width={room.width}
                height={room.height}
                rx={1}
              />
              {showLabel && (
                <text
                  className="minimap-room-label"
                  x={room.x + room.width / 2}
                  y={room.y + room.height / 2}
                >
                  {room.name}
                </text>
              )}
            </g>
          );
        })}
        {model.doors.map((door) => (
          <line
            key={door.id}
            className="minimap-door"
            x1={door.x1}
            y1={door.y1}
            x2={door.x2}
            y2={door.y2}
          />
        ))}
        {marker && player && (
          <g
            className="minimap-player"
            transform={`translate(${marker.x.toFixed(2)} ${marker.y.toFixed(2)}) rotate(${(-player.yaw).toFixed(2)})`}
          >
            <path className="minimap-player-cone" d="M0 0 L-8 -16 L8 -16 Z" />
            <path
              className="minimap-player-arrow"
              d="M0 -6.4 L4.2 4.4 L0 2.1 L-4.2 4.4 Z"
            />
          </g>
        )}
      </svg>
    </div>
  );
}
