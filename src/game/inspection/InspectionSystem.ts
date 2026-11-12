import type {
  InspectableDefinition,
  InspectVariant,
  StoryEffect,
  StoryFlagValue,
} from '../../shared/types/content';
import type {
  InspectionSectionView,
  InspectionView,
} from '../../shared/types/inspection';
import type { StoryFlags } from '../story/conditions.ts';
import { areConditionsMet } from '../story/conditions.ts';

export interface InspectionHost {
  getFlags(): StoryFlags;
  setFlag: (key: string, value: StoryFlagValue) => void;
  /** 返回 true 表示这条线索是本次新发现的。 */
  discoverClue: (clueId: string) => boolean;
  getClueTitle: (clueId: string) => string | null;
  /** 检视内容变化时回调；关闭时传 null。 */
  onChange: (view: InspectionView | null) => void;
}

export interface InspectionSystemOptions {
  inspectables: readonly InspectableDefinition[];
  host: InspectionHost;
}

/** 管理「查看物件」的正文面板。内容只来自内容层，不在这里硬编码文本。 */
export class InspectionSystem {
  private readonly definitions = new Map<string, InspectableDefinition>();
  private readonly host: InspectionHost;
  private current: InspectionView | null = null;

  constructor(options: InspectionSystemOptions) {
    this.host = options.host;
    for (const definition of options.inspectables) {
      if (this.definitions.has(definition.id)) {
        throw new Error(`检视内容 ID 重复：${definition.id}`);
      }
      this.definitions.set(definition.id, definition);
    }
  }

  get active(): boolean {
    return this.current !== null;
  }

  has(id: string): boolean {
    return this.definitions.has(id);
  }

  open(id: string): boolean {
    const definition = this.definitions.get(id);
    if (!definition) {
      return false;
    }

    const variant = selectVariant(definition, this.host.getFlags());
    if (!variant) {
      console.warn(`检视内容没有可用变体：${id}`);
      return false;
    }

    const newClueTitles: string[] = [];
    for (const effect of variant.effects ?? []) {
      this.applyEffect(effect, newClueTitles);
    }

    this.current = {
      id: definition.id,
      title: definition.title,
      category: definition.category,
      sections: variant.sections.map(toSectionView),
      newClueTitles,
    };
    this.host.onChange(this.current);
    return true;
  }

  close(): void {
    if (!this.current) {
      return;
    }
    this.current = null;
    this.host.onChange(null);
  }

  view(): InspectionView | null {
    return this.current;
  }

  private applyEffect(effect: StoryEffect, newClueTitles: string[]): void {
    switch (effect.type) {
      case 'set-flag':
        this.host.setFlag(effect.key, effect.value ?? true);
        break;
      case 'discover-clue':
        if (this.host.discoverClue(effect.key)) {
          const title = this.host.getClueTitle(effect.key);
          if (title) {
            newClueTitles.push(title);
          }
        }
        break;
      case 'unlock-dialogue':
        console.warn(`检视内容不支持解锁对话效果：${effect.key}`);
        break;
    }
  }
}

function selectVariant(
  definition: InspectableDefinition,
  flags: StoryFlags,
): InspectVariant | null {
  return (
    definition.variants.find(
      (variant) =>
        !variant.when || areConditionsMet(flags, variant.when),
    ) ?? null
  );
}

function toSectionView(section: {
  heading?: string;
  style?: 'body' | 'quote' | 'note' | 'signature';
  paragraphs: readonly string[];
}): InspectionSectionView {
  return {
    heading: section.heading ?? null,
    style: section.style ?? 'body',
    paragraphs: section.paragraphs,
  };
}
