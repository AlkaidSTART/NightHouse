import type { StoryEffect, StoryFlagValue } from '../../shared/types/content';

export function flag(
  key: string,
  value: StoryFlagValue = true,
): StoryEffect {
  return { type: 'set-flag', key, value };
}

export function clue(clueId: string): StoryEffect {
  return { type: 'discover-clue', key: clueId };
}
