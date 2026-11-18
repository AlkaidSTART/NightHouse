import assert from 'node:assert/strict';
import { test } from 'node:test';
import type {
  DialogueChoiceView,
  DialogueGuideStepView,
  DialogueGuideView,
} from '../src/shared/types/dialogue.ts';
import { buildDialogueQuestionFlow } from '../src/ui/dialogue/dialogueQuestionFlow.ts';

function choice(
  id: string,
  options: {
    guideStatus?: DialogueChoiceView['guideStatus'];
    isNavigation?: boolean;
    isExit?: boolean;
  } = {},
): DialogueChoiceView {
  return {
    id,
    text: id,
    guideOrder: null,
    guideStatus: options.guideStatus ?? null,
    isNavigation: options.isNavigation ?? false,
    isExit: options.isExit ?? false,
  };
}

function step(
  choiceId: string,
  status: DialogueGuideStepView['status'],
): DialogueGuideStepView {
  return { choiceId, label: choiceId, status };
}

function guide(
  steps: readonly DialogueGuideStepView[],
): DialogueGuideView {
  return { hint: '按顺序追问', steps };
}

const choices: readonly DialogueChoiceView[] = [
  choice('ask_evelyn', { guideStatus: 'next' }),
  choice('ask_will', { guideStatus: 'later' }),
  choice('ask_house', { guideStatus: 'later' }),
  choice('back', { isNavigation: true }),
  choice('leave', { isExit: true, isNavigation: true }),
];

test('渐进提问默认只显示当前问题与导航选项', () => {
  const flow = buildDialogueQuestionFlow(
    choices,
    guide([
      step('ask_evelyn', 'next'),
      step('ask_will', 'later'),
      step('ask_house', 'later'),
    ]),
  );

  assert.equal(flow.primaryChoice?.id, 'ask_evelyn');
  assert.deepEqual(
    flow.visibleChoices.map((entry) => entry.id),
    ['ask_evelyn', 'back', 'leave'],
  );
  assert.deepEqual(
    flow.additionalChoices.map((entry) => entry.id),
    ['ask_will', 'ask_house'],
  );
  assert.equal(flow.position, 1);
  assert.equal(flow.total, 3);
});

test('答完上一问后，下一个未问问题成为唯一主问题', () => {
  const flow = buildDialogueQuestionFlow(
    [
      choice('ask_evelyn', { guideStatus: 'asked' }),
      choice('ask_will', { guideStatus: 'next' }),
      choice('ask_house', { guideStatus: 'later' }),
      choice('leave', { isExit: true, isNavigation: true }),
    ],
    guide([
      step('ask_evelyn', 'asked'),
      step('ask_will', 'next'),
      step('ask_house', 'later'),
    ]),
  );

  assert.equal(flow.primaryChoice?.id, 'ask_will');
  assert.deepEqual(
    flow.visibleChoices.map((entry) => entry.id),
    ['ask_will', 'leave'],
  );
  assert.deepEqual(
    flow.additionalChoices.map((entry) => entry.id),
    ['ask_evelyn', 'ask_house'],
  );
  assert.equal(flow.position, 2);
});

test('全部追问完成后恢复显示全部选项', () => {
  const completedChoices = [
    choice('ask_evelyn', { guideStatus: 'asked' }),
    choice('ask_will', { guideStatus: 'asked' }),
    choice('leave', { isExit: true, isNavigation: true }),
  ];
  const flow = buildDialogueQuestionFlow(
    completedChoices,
    guide([step('ask_evelyn', 'asked'), step('ask_will', 'asked')]),
  );

  assert.equal(flow.primaryChoice, null);
  assert.equal(flow.nextStep, null);
  assert.deepEqual(
    flow.visibleChoices.map((entry) => entry.id),
    ['ask_evelyn', 'ask_will', 'leave'],
  );
  assert.equal(flow.position, 2);
  assert.equal(flow.total, 2);
});

test('没有提问参考时保持原来的完整选项列表', () => {
  const flow = buildDialogueQuestionFlow(choices, null);

  assert.equal(flow.primaryChoice, null);
  assert.deepEqual(
    flow.visibleChoices.map((entry) => entry.id),
    choices.map((entry) => entry.id),
  );
  assert.equal(flow.total, 0);
});
