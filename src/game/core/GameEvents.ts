import type { EventBus } from '../../shared/events/EventBus';
import type { ClueJournalView } from '../../shared/types/clueJournal';
import type { DialogueView } from '../../shared/types/dialogue';
import type { EndingView } from '../../shared/types/ending';
import type { InspectionView } from '../../shared/types/inspection';
import type { PuzzleView } from '../../shared/types/puzzle';
import type { Vec3Tuple } from '../../shared/types/save';

export interface GameEventMap {
  'game.ready': { sceneId: string };
  'game.error': { message: string };
  'interaction.prompt': { text: string | null };
  'interaction.activated': { id: string; message: string };
  'dialogue.changed': { view: DialogueView | null };
  'inspection.changed': { view: InspectionView | null };
  'puzzle.changed': { view: PuzzleView | null };
  'clues.changed': { view: ClueJournalView | null };
  'ending.changed': { view: EndingView | null };
  'pause.changed': { paused: boolean };
  'region.changed': { regionId: string; name: string };
  'player.position': { position: Vec3Tuple; rotation: Vec3Tuple };
}

export type GameEventBus = EventBus<GameEventMap>;
