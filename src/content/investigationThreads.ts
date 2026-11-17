/**
 * 调查线是玩家侧的推理检查表，不新增剧情事实。
 *
 * 每个步骤都指向已经存在或由本轮内容补充的线索 / 剧情标记。任务步骤负责
 * 告诉玩家“现在做什么”，调查线负责回答“还有哪些问题没有闭合”。
 */
export interface InvestigationThreadStep {
  flag: string;
  label: string;
}

export interface InvestigationThreadDefinition {
  id: string;
  title: string;
  hint: string;
  steps: readonly InvestigationThreadStep[];
}

export const investigationThreads: readonly InvestigationThreadDefinition[] = [
  {
    id: 'thread_scene',
    title: '她真是坠海死的吗？',
    hint: '书房书桌 → 二楼浴室 → 回门厅追问格雷医生',
    steps: [
      { flag: 'clue.medical_record', label: '诊疗记录里的 23:40' },
      { flag: 'clue.bathroom_trace', label: '浴室里的宅内伤情' },
      { flag: 'story.doctor_confessed', label: '让格雷承认死亡现场' },
      { flag: 'story.doctor_motive_known', label: '问出格雷为何替他隐瞒' },
    ],
  },
  {
    id: 'thread_arthur',
    title: '亚瑟那晚在哪里？',
    hint: '初见亚瑟时追问；门厅斗篷与书房对质能拼出他的行动',
    steps: [
      { flag: 'clue.arthur_scratch', label: '亚瑟左腕的旧抓痕' },
      { flag: 'clue.arthur_cloak', label: '衣帽架最里侧的湿斗篷' },
      { flag: 'story.arthur_admits_study', label: '亚瑟承认那晚在书房' },
      { flag: 'story.arthur_cloak_admitted', label: '亚瑟承认忌日前去过崖边' },
    ],
  },
  {
    id: 'thread_shipping',
    title: '阿什克罗夫特家欠了什么？',
    hint: '旧账不会自己开口，日期也不会只写在一个地方。',
    steps: [
      { flag: 'clue.ship_painting', label: '油画背面的沉船日期' },
      { flag: 'clue.newspaper', label: '旧纸堆里留下的另一份记录' },
      { flag: 'story.safe_opened', label: '打开书房里锁着的旧账' },
      { flag: 'clue.shipping_ledger', label: '账本里的保险赔款' },
      { flag: 'clue.insurance_policy', label: '埃德蒙签下的赔付单' },
    ],
  },
  {
    id: 'thread_voice',
    title: '伊芙琳留下了什么？',
    hint: '拿到卧室钥匙后检查梳妆台，再回书房播放蜡筒',
    steps: [
      { flag: 'clue.evelyn_old_letters', label: '十年间没有回音的旧信' },
      { flag: 'clue.gramophone_cylinder', label: '梳妆台里的留声机蜡筒' },
      { flag: 'story.heard_recording', label: '在她死去的书房里听完留言' },
    ],
  },
  {
    id: 'thread_clock',
    title: '第十三下从哪里来？',
    hint: '要让它重新开口，先得找回它缺的东西。',
    steps: [
      { flag: 'clue.clock_key', label: '能重新唤醒发条的旧钥匙' },
      { flag: 'clue.pendulum', label: '该在钟里晃动的重物' },
      { flag: 'story.saw_mantel_clock', label: '客厅里停住的另一面钟' },
      { flag: 'clue.tide_table', label: '书房里与潮水有关的旧纸' },
      { flag: 'story.clock_repaired', label: '让落地钟敲出第十三下' },
    ],
  },
];
