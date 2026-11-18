import type {
  DialogueChoiceView,
  DialogueGuideStepView,
  DialogueGuideView,
} from '../../shared/types/dialogue';

export interface DialogueQuestionFlow {
  /** 当前最值得先问的话题；没有待问步骤时为 null。 */
  primaryChoice: DialogueChoiceView | null;
  /** 返回与离开选项，不参与折叠，避免玩家被渐进提问困住。 */
  navigationChoices: readonly DialogueChoiceView[];
  /** 本节点其余可问话题，仅在玩家主动展开时显示。 */
  additionalChoices: readonly DialogueChoiceView[];
  /** 默认可见选项，按主问题、导航选项排列。 */
  visibleChoices: readonly DialogueChoiceView[];
  /**
   * 全部可用选项。没有待问步骤时等同于 `visibleChoices`；
   * 展开其他话题后用于渲染完整列表。
   */
  allChoices: readonly DialogueChoiceView[];
  nextStep: DialogueGuideStepView | null;
  /** 当前问题序号；没有待问步骤时为已完成的提问总数。 */
  position: number;
  total: number;
}

/**
 * 把选项拆成“当前主问题、导航、可折叠话题”三组。
 *
 * 这里只改变呈现顺序，不改变选项是否可用，也不改变剧情条件和效果。
 * 当提问参考中的步骤都已经问过时，恢复显示全部选项，避免隐藏后续分支。
 */
export function buildDialogueQuestionFlow(
  choices: readonly DialogueChoiceView[],
  guide: DialogueGuideView | null,
): DialogueQuestionFlow {
  if (!guide) {
    return {
      primaryChoice: null,
      navigationChoices: [],
      additionalChoices: [],
      visibleChoices: choices,
      allChoices: choices,
      nextStep: null,
      position: 0,
      total: 0,
    };
  }

  const nextStep = guide.steps.find((step) => step.status === 'next') ?? null;
  const primaryChoice = nextStep
    ? (choices.find((choice) => choice.id === nextStep.choiceId) ?? null)
    : null;

  if (!nextStep || !primaryChoice) {
    return {
      primaryChoice: null,
      navigationChoices: [],
      additionalChoices: [],
      visibleChoices: choices,
      allChoices: choices,
      nextStep: null,
      position: guide.steps.length,
      total: guide.steps.length,
    };
  }

  const navigationChoices = choices.filter(
    (choice) => choice.id !== primaryChoice.id && choice.isNavigation,
  );
  const additionalChoices = choices.filter(
    (choice) =>
      choice.id !== primaryChoice.id && !choice.isNavigation,
  );
  const position =
    guide.steps.findIndex((step) => step.choiceId === primaryChoice.id) + 1;

  return {
    primaryChoice,
    navigationChoices,
    additionalChoices,
    visibleChoices: [primaryChoice, ...navigationChoices],
    allChoices: [
      primaryChoice,
      ...navigationChoices,
      ...additionalChoices,
    ],
    nextStep,
    position,
    total: guide.steps.length,
  };
}
