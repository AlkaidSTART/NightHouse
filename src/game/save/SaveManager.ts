import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { StoryFlagValue } from '../../shared/types/content';
import type {
  NPCState,
  PlayerSettings,
  SaveData,
  Vec3Tuple,
} from '../../shared/types/save';
import { DEFAULT_SETTINGS } from './defaults';

export const SAVE_SCHEMA_VERSION = 1;

const DB_NAME = 'midnight-villa';
const DB_VERSION = 1;
const SAVE_KEY = 'primary';
const SETTINGS_KEY = 'player';
const DEFAULT_SCENE_ID = 'villa_entry';
const DEFAULT_PLAYER_POSITION: Vec3Tuple = [0, 1.7, 4];
const DEFAULT_PLAYER_ROTATION: Vec3Tuple = [0, 0, 0];

interface VillaDB extends DBSchema {
  saves: { key: string; value: SaveData };
  settings: { key: string; value: PlayerSettings };
}

type SaveMigration = (data: Record<string, unknown>) => Record<string, unknown>;

const SAVE_MIGRATIONS: Record<number, SaveMigration> = {};

export function createNewSave(sceneId: string = DEFAULT_SCENE_ID): SaveData {
  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    updatedAt: Date.now(),
    currentSceneId: sceneId,
    player: {
      position: [...DEFAULT_PLAYER_POSITION],
      rotation: [...DEFAULT_PLAYER_ROTATION],
    },
    storyFlags: {},
    discoveredClueIds: [],
    completedPuzzleIds: [],
    completedQuestIds: [],
    npcStates: {},
    choices: {},
  };
}

export class SaveManager {
  private dbPromise: Promise<IDBPDatabase<VillaDB>> | null = null;

  async hasSave(): Promise<boolean> {
    const db = await this.open();
    const save = await db.get('saves', SAVE_KEY);
    return save !== undefined;
  }

  async loadSave(): Promise<SaveData | null> {
    const db = await this.open();
    const raw: unknown = await db.get('saves', SAVE_KEY);
    return migrateSave(raw);
  }

  async writeSave(save: SaveData): Promise<void> {
    const db = await this.open();
    await db.put('saves', { ...save, updatedAt: Date.now() }, SAVE_KEY);
  }

  async deleteSave(): Promise<void> {
    const db = await this.open();
    await db.delete('saves', SAVE_KEY);
  }

  async loadSettings(): Promise<PlayerSettings> {
    const db = await this.open();
    const raw: unknown = await db.get('settings', SETTINGS_KEY);
    return normalizeSettings(raw);
  }

  async saveSettings(settings: PlayerSettings): Promise<void> {
    const db = await this.open();
    await db.put('settings', normalizeSettings(settings), SETTINGS_KEY);
  }

  async close(): Promise<void> {
    const pending = this.dbPromise;
    this.dbPromise = null;
    if (!pending) {
      return;
    }
    try {
      (await pending).close();
    } catch {
      // The database may already be unavailable; closing is best effort.
    }
  }

  private open(): Promise<IDBPDatabase<VillaDB>> {
    if (!this.dbPromise) {
      this.dbPromise = openDB<VillaDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('saves')) {
            db.createObjectStore('saves');
          }
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings');
          }
        },
      });
    }
    return this.dbPromise;
  }
}

function migrateSave(raw: unknown): SaveData | null {
  if (!isRecord(raw)) {
    return null;
  }

  const version = raw.schemaVersion;
  if (!isFiniteNumber(version) || version > SAVE_SCHEMA_VERSION) {
    return null;
  }

  let data = raw;
  for (let next = version + 1; next <= SAVE_SCHEMA_VERSION; next += 1) {
    const migrate = SAVE_MIGRATIONS[next];
    if (!migrate) {
      return null;
    }
    data = migrate(data);
  }

  return validateSave(data);
}

function validateSave(raw: unknown): SaveData | null {
  if (!isRecord(raw)) {
    return null;
  }

  const player = raw.player;
  if (
    !isRecord(player) ||
    !isVec3(player.position) ||
    !isVec3(player.rotation)
  ) {
    return null;
  }

  if (typeof raw.currentSceneId !== 'string') {
    return null;
  }

  if (
    !isFiniteNumber(raw.updatedAt) ||
    !isRecord(raw.storyFlags) ||
    !isRecord(raw.npcStates) ||
    !isRecord(raw.choices)
  ) {
    return null;
  }

  if (
    !isStringArray(raw.discoveredClueIds) ||
    !isStringArray(raw.completedPuzzleIds) ||
    !isStringArray(raw.completedQuestIds)
  ) {
    return null;
  }

  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    updatedAt: raw.updatedAt,
    currentSceneId: raw.currentSceneId,
    player: {
      position: player.position,
      rotation: player.rotation,
    },
    storyFlags: raw.storyFlags as Record<string, StoryFlagValue>,
    discoveredClueIds: raw.discoveredClueIds,
    completedPuzzleIds: raw.completedPuzzleIds,
    completedQuestIds: raw.completedQuestIds,
    npcStates: raw.npcStates as Record<string, NPCState>,
    choices: raw.choices as Record<string, string>,
  };
}

function normalizeSettings(raw: unknown): PlayerSettings {
  const source = isRecord(raw) ? raw : {};
  return {
    mouseSensitivity: clamp(
      readNumber(source.mouseSensitivity, DEFAULT_SETTINGS.mouseSensitivity),
      0.05,
      2,
    ),
    masterVolume: clamp(
      readNumber(source.masterVolume, DEFAULT_SETTINGS.masterVolume),
      0,
      1,
    ),
    effectsVolume: clamp(
      readNumber(source.effectsVolume, DEFAULT_SETTINGS.effectsVolume),
      0,
      1,
    ),
  };
}

function readNumber(value: unknown, fallback: number): number {
  return isFiniteNumber(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isVec3(value: unknown): value is Vec3Tuple {
  return Array.isArray(value) && value.length === 3 && value.every(isFiniteNumber);
}
