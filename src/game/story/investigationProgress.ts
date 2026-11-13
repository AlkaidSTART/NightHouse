import type {
  InvestigationThreadDefinition,
  InvestigationThreadStep,
} from '../../content/investigationThreads';
import type { StoryFlags } from './conditions.ts';

export interface InvestigationStepView extends InvestigationThreadStep {
  found: boolean;
}

export interface InvestigationThreadView {
  id: string;
  title: string;
  hint: string;
  found: number;
  total: number;
  complete: boolean;
  steps: readonly InvestigationStepView[];
}

/** 调查线只由现有剧情标记推导，不额外写入存档。 */
export function resolveInvestigationThreads(
  flags: StoryFlags,
  threads: readonly InvestigationThreadDefinition[],
): readonly InvestigationThreadView[] {
  return threads.map((thread) => {
    const steps = thread.steps.map((step) => ({
      ...step,
      found: flags[step.flag] === true,
    }));
    const found = steps.filter((step) => step.found).length;
    return {
      id: thread.id,
      title: thread.title,
      hint: thread.hint,
      found,
      total: steps.length,
      complete: found === steps.length,
      steps,
    };
  });
}
