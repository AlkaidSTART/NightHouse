import type { EventBus } from '../../shared/events/EventBus';
import type { Vec3Tuple } from '../../shared/types/save';

export interface GameEventMap {
  'game.ready': { sceneId: string };
  'game.error': { message: string };
  'interaction.prompt': { text: string | null };
  'interaction.activated': { id: string; message: string };
  'pause.changed': { paused: boolean };
  'player.position': { position: Vec3Tuple; rotation: Vec3Tuple };
}

export type GameEventBus = EventBus<GameEventMap>;
