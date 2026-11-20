import { presentEnding } from '../src/content/endings.ts';

export const ENDING_VO_MODEL = 'qwen-audio-3.1-tts-plus';
export const ENDING_VO_INSTRUCTION =
  '用普通话讲述。统一中性叙述者，冷静、克制、清晰，有温度但不煽情。语速自然偏慢，低混响干声，不要耳语、哭腔、播音腔或恐怖故事腔。引号内对白也由同一叙述者转述，不模仿角色。';

export interface EndingVoClip {
  clipId: string;
  group: 'TruthRecap' | 'Signed' | 'RefusedStrong' | 'RefusedWeak' | 'Echo';
  paragraph: number;
  text: string;
  instruction: string;
  source: string;
  review: 'draft' | 'existing-script';
  condition: string | null;
  estimatedSeconds: number;
  runtimePath: string;
}

export const ENDING_VO_CANDIDATES = [
  { voice: 'longanlingxin_v3.1', name: '龙安灵心', note: '温暖女声；已用于霍尔太太，需检查角色混淆' },
  { voice: 'longanfengyue_v3.1', name: '龙安风悦', note: '自然女声；已用于伊芙琳蜡筒，需检查角色混淆' },
  { voice: 'xunanchuan_v3.1', name: '许南川', note: '磁性男声；已用于亚瑟和格雷，需检查角色混淆' },
] as const;

/** 只是制作预算，不作为字幕或播放完成时间。 */
export function estimateEndingVoSeconds(text: string): number {
  return Math.round((text.replace(/[\s\p{P}]/gu, '').length / 3.5 + 0.8) * 10) / 10;
}

export function parseTruthRecapDraft(markdown: string): string[] {
  const section = /^## 文案草稿\r?\n([\s\S]*?)(?=^## |$(?![\s\S]))/m.exec(markdown)?.[1];
  if (!section) throw new Error('共享回收文档缺少“文案草稿”章节。');
  const paragraphs = section.split(/\r?\n/).filter((line) => line.startsWith('> ')).map((line) => line.slice(2).trim());
  if (paragraphs.length !== 6 || paragraphs.some((text) => text.length === 0)) {
    throw new Error('共享回收稿必须包含 6 个非空引用段落；文档结构变化后请复核制作清单。');
  }
  return paragraphs;
}

export function buildEndingVoClips(truthRecap: readonly string[]): EndingVoClip[] {
  if (truthRecap.length !== 6) throw new Error('共享回收稿需要 6 段。');
  const clips: EndingVoClip[] = [];
  const append = (
    group: EndingVoClip['group'],
    paragraphs: readonly string[],
    source: string,
    direction: string,
    review: EndingVoClip['review'],
  ): void => {
    for (const [index, text] of paragraphs.entries()) {
      if (text.trim().length === 0 || text.length > 600) throw new Error(`${group} 第 ${index + 1} 段为空或超过技能单次上限。`);
      const clipId = `VO_Ending_${group}_P${String(index + 1).padStart(2, '0')}`;
      clips.push({
        clipId, group, paragraph: index + 1, text,
        instruction: `${ENDING_VO_INSTRUCTION}${direction}`,
        source, review,
        condition: group === 'Signed' && index === paragraphs.length - 1
          ? 'hasAnyEvidence(storyFlags) === true' : null,
        estimatedSeconds: estimateEndingVoSeconds(text),
        runtimePath: `/assets/audio/vo/ending/${clipId}.ogg`,
      });
    }
  };
  append('TruthRecap', truthRecap, 'docs/plans/audio/ending-vo-truth-recap.md#文案草稿',
    '按因果层次讲清案件，区分意外死亡和事后掩盖；人名清楚，不加评判。', 'draft');
  const variants = [
    { group: 'Signed', id: 'ending_signed', flags: { 'clue.shipping_ledger': true }, direction: '平静、空洞，不讽刺；结尾轻收。' },
    { group: 'RefusedStrong', id: 'ending_refused', flags: { 'story.evidence_presented': true, 'clue.shipping_ledger': true, 'clue.insurance_policy': true }, direction: '前段有压力，后段降温，真话没有带来解脱。' },
    { group: 'RefusedWeak', id: 'ending_refused', flags: {}, direction: '礼貌、疏离，安静地收束挫败感，不渲染威胁。' },
    { group: 'Echo', id: 'ending_echo', flags: {}, direction: '名字逐一清晰，克制中逐渐增加重量，结尾有温度但不是胜利宣言。' },
  ] as const;
  for (const variant of variants) {
    const ending = presentEnding(variant.id, variant.flags);
    if (!ending) throw new Error(`找不到结局 ${variant.id}。`);
    append(variant.group, ending.paragraphs, 'src/content/endings.ts → presentEnding', variant.direction, 'existing-script');
  }
  return clips;
}

/** 每种候选先用三条短句，覆盖因果、专名和收束，单条目标小于 10 秒。 */
export function buildEndingVoSamples(clips: readonly EndingVoClip[]) {
  const selected = [
    { id: 'cause', text: '她挣脱时向后跌倒，后脑撞上壁炉石沿，当场死于意外。', group: 'TruthRecap' },
    { id: 'names', text: '塞缪尔·克罗斯，舱面学徒，十六岁。', group: 'Echo' },
    { id: 'closing', text: '没有人再提伊芙琳。', group: 'RefusedWeak' },
  ] as const;
  for (const sample of selected) {
    if (!clips.some((clip) => clip.group === sample.group && clip.text.includes(sample.text))) {
      throw new Error(`样音 ${sample.id} 已与正文失配，请重新选取试听句。`);
    }
  }
  return ENDING_VO_CANDIDATES.flatMap((candidate) => selected.map((sample) => ({
    clipId: `Sample_${sample.id}_${candidate.voice}`,
    voice: candidate.voice,
    voiceName: candidate.name,
    text: sample.text,
    instruction: clips.find((clip) => clip.group === sample.group)?.instruction ?? ENDING_VO_INSTRUCTION,
    estimatedSeconds: estimateEndingVoSeconds(sample.text),
    output: `assets/audio/vo/vo_ending/samples/${candidate.voice}/Sample_${sample.id}.wav`,
  })));
}
