import type { QuestDefinition } from '../shared/types/content';

/**
 * 主线任务。步骤按剧情标记推进：对话选项写入的 flag 一旦满足某一步的
 * `doneWhen`，目标面板就会自动切到下一步，不需要额外的事件通道。
 *
 * 路线坐标依据 `villaGreybox.regions` 的区域 ID；面板据此计算方向、距离
 * 和楼层，小地图据此绘制目标标记。
 */
export const quests: readonly QuestDefinition[] = [
  {
    id: 'quest_main_midnight',
    title: '午夜的遗嘱',
    description: '在午夜前查明伊芙琳的死因，并决定是否签下那份遗嘱。',
    steps: [
      {
        id: 'step_arrive',
        objective: '进入别墅门厅',
        hint: '沿车道走到别墅正门，推门进去。',
        locationId: 'villa_hall',
        doneWhen: [[{ flag: 'story.arrived' }]],
      },
      {
        id: 'step_housekeeper',
        objective: '与霍尔太太交谈，安顿下来',
        hint: '她就在门厅正门内侧。',
        locationId: 'villa_hall',
        doneWhen: [[{ flag: 'story.met_housekeeper' }]],
      },
      {
        id: 'step_arthur',
        objective: '在客厅壁炉旁与亚瑟交谈',
        hint: '从门厅往西进入客厅，亚瑟在壁炉边。',
        locationId: 'villa_parlor',
        doneWhen: [[{ flag: 'story.met_arthur' }]],
      },
      {
        id: 'step_doctor',
        objective: '向格雷医生打听伊芙琳的死',
        hint: '格雷医生已经到了，在门厅正门内侧。',
        locationId: 'villa_hall',
        doneWhen: [
          [{ flag: 'story.summer_mentioned' }],
          [{ flag: 'story.doctor_slip' }],
          [{ flag: 'story.doctor_time_conflict' }],
          [{ flag: 'story.doctor_admits_exam' }],
          [{ flag: 'story.doctor_confessed' }],
        ],
      },
      {
        id: 'step_coverup',
        objective: '找霍尔太太问出那晚的真相',
        hint: '她会在餐厅门边。先让她信任你，再问那晚的事。',
        locationId: 'villa_dining',
        doneWhen: [[{ flag: 'story.knows_coverup' }]],
      },
      {
        id: 'step_confront',
        objective: '去书房对质亚瑟',
        hint: '亚瑟已回到书房。从一层走廊向西走到书房。',
        locationId: 'villa_study',
        doneWhen: [[{ flag: 'story.midnight' }]],
      },
      {
        id: 'step_midnight',
        objective: '午夜到门厅，决定签字还是拒绝',
        hint: '回到门厅，亚瑟在签字桌边等你。',
        locationId: 'villa_hall',
        doneWhen: [
          [{ flag: 'choice.midnight', equals: 'sign' }],
          [{ flag: 'choice.midnight', equals: 'refuse' }],
        ],
      },
    ],
  },
];
