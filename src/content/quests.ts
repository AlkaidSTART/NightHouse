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
        hint: '用 W / A / S / D 沿车道前进，鼠标控制视角。靠近别墅正门，对准门按 E 推开。',
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
        objective: '与一楼的霍尔太太对话取得钥匙，并前往二楼',
        hint: '她在一楼餐厅门边。先让她信任你，问出那晚的搬运经过，并请她打开伊芙琳的房间。拿到钥匙后沿主楼梯上二楼。',
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
        objective: '把两份伤情证据拿给格雷医生看',
        hint: '诊疗记录和浴室痕迹都拿到了。回门厅或餐厅门口找格雷。',
        locationId: 'villa_hall',
        stages: [
          {
            id: 'stage_medical_record',
            objective: '在书房找到格雷的诊疗记录',
            hint: '从一层走廊向西进入书房，检查书桌最下层抽屉。',
            locationId: 'villa_study',
            until: [{ flag: 'clue.medical_record' }],
          },
          {
            id: 'stage_bathroom_trace',
            objective: '去二楼浴室找到宅内伤情痕迹',
            hint: '沿主楼梯上二楼，检查浴室里的药柜、毛巾架和地砖缝。',
            locationId: 'villa_bathroom',
            until: [{ flag: 'clue.bathroom_trace' }],
          },
        ],
        doneWhen: [[{ flag: 'story.doctor_confessed' }]],
      },
      {
        id: 'step_recording',
        objective: '把蜡筒带回书房，听完伊芙琳留下的话',
        hint: '回到一层书房，把蜡筒放上留声机。',
        locationId: 'villa_study',
        stages: [
          {
            id: 'stage_find_cylinder',
            objective: '在伊芙琳卧室找到留声机蜡筒',
            hint: '她的卧室在二楼最里面，检查梳妆台抽屉。',
            locationId: 'villa_evelyn_room',
            until: [{ flag: 'item.cylinder' }],
          },
        ],
        doneWhen: [[{ flag: 'story.heard_recording' }]],
      },
      {
        id: 'step_corroborate',
        objective: '找到能印证真相的第二份证据',
        hint: '第二份证据有两条路：打开书房保险箱，或修好门厅落地钟。保险箱从客厅帆船油画正反两面查起；修钟则先看客厅小座钟与书房潮汐表。',
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
