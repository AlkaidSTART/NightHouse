/** 开场序章里交代的一件事，例如「你为什么来」。 */
export interface PrologueFact {
  label: string;
  text: string;
}

/** 序章展示的那封退回的信。 */
export interface PrologueLetter {
  heading: string;
  paragraphs: readonly string[];
  signature: string;
}

/**
 * 开场序章。
 *
 * 依据 docs/午夜别墅_故事线文档_v0.7.md §1.4：开场必须交代「为什么来、
 * 为什么是午夜、为什么不能走、为什么警惕」，并且先给出大目标，再进入探索。
 */
export interface PrologueDefinition {
  eyebrow: string;
  title: string;
  lead: readonly string[];
  facts: readonly PrologueFact[];
  letter: PrologueLetter;
  goalLabel: string;
  goal: string;
  startLabel: string;
}
