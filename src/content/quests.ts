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
        doneWhen: [[{ flag: 'story.arthur_talked' }]],
      },
      {
        id: 'step_doctor',
        objective: '向格雷医生追问伊芙琳的死',
        hint: '格雷医生已经到了，在门厅正门内侧。先问清他到场的时间。',
        locationId: 'villa_hall',
        doneWhen: [
          [{ flag: 'story.doctor_time_conflict' }],
          [{ flag: 'story.doctor_admits_exam' }],
          [{ flag: 'story.doctor_confessed' }],
        ],
      },
      {
        id: 'step_coverup',
        objective: '取得二楼钥匙，并问出霍尔太太看见的搬运经过',
        hint: '她会在餐厅门边。先让她信任你，再问那晚的事，并请她打开伊芙琳的房间。',
        locationId: 'villa_dining',
        doneWhen: [
          [
            { flag: 'story.knows_coverup' },
            { flag: 'story.housekeeper_key' },
          ],
        ],
      },
      {
        id: 'step_medical_truth',
        objective: '把诊疗记录和浴室痕迹拿给格雷医生看',
        hint: '书房书桌能证明她死在宅内；二楼浴室的药柜、毛巾和地砖还有第二处伤情。两样都拿到后回门厅或餐厅门口找格雷。',
        locationId: 'villa_hall',
        doneWhen: [[{ flag: 'story.doctor_confessed' }]],
      },
      {
        id: 'step_recording',
        objective: '找到伊芙琳的蜡筒，在书房听完她留下的话',
        hint: '她的卧室在二楼最里面。检查梳妆台抽屉，再把蜡筒带回书房留声机播放。',
        locationId: 'villa_evelyn_room',
        doneWhen: [[{ flag: 'story.heard_recording' }]],
      },
      {
        id: 'step_corroborate',
        objective: '再取得一份书证，或修好敲出第十三下的落地钟',
        hint: '保险箱需要油画日期和旧报纸，落地钟需要潮汐表、上弦钥匙与摆锤。任选一条完整证据链。',
        locationId: 'villa_study',
        doneWhen: [
          [{ flag: 'story.safe_opened' }],
          [{ flag: 'story.clock_repaired' }],
        ],
      },
      {
        id: 'step_evidence',
        objective: '回书房，把已经拿到的证据摊在书桌上',
        hint: '确认诊疗记录、伊芙琳的录音，以及至少一份账目或十三下钟声证据。整理完再去对质亚瑟。',
        locationId: 'villa_study',
        doneWhen: [[{ flag: 'story.case_ready' }]],
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
