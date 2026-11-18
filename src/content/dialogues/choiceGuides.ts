import type { DialogueChoiceGuide } from '../../shared/types/content';

/**
 * NPC 提问参考顺序。
 *
 * 这里描述“怎样问更顺”，并决定面板当前先展示哪个问题。其他非导航
 * 话题会折叠在“其他话题”中；选项条件、剧情效果和自由退出不受影响。
 * 条件未满足或被当前剧情白名单过滤的话题不会出现在面板提示中。
 */
export const DIALOGUE_CHOICE_GUIDES: Readonly<
  Record<string, DialogueChoiceGuide>
> = {
  npc_housekeeper_intro: {
    hint: '先回应她的招待，让她愿意开口；信件与后续追问会在对应节点继续提示。',
    sequence: [
      { choiceId: 'warm', label: '回应招待，建立信任' },
    ],
  },
  npc_housekeeper_warm: {
    sequence: [{ choiceId: 'ask_evelyn', label: '问伊芙琳是个怎样的人' }],
  },
  npc_housekeeper_cold: {
    hint: '如果刚才显得疏远，可以先缓和一句，再继续问。',
    sequence: [{ choiceId: 'warm_up', label: '缓和态度' }],
  },
  npc_housekeeper_letter_b1: {
    sequence: [{ choiceId: 'ask_evelyn', label: '追问写信时的伊芙琳' }],
  },
  npc_housekeeper_b5_01: {
    hint: '先问伊芙琳，再逐项拿出已经掌握的物证；没有把握的话题可以稍后再问。',
    sequence: [
      { choiceId: 'ask_evelyn', label: '先问伊芙琳的往事' },
      { choiceId: 'show_letter', label: '有信时出示信件' },
      { choiceId: 'ask_burned_pages', label: '追问书房烧纸' },
      { choiceId: 'ask_study_cleanup', label: '核对书房清理' },
      { choiceId: 'ask_cloak', label: '追问湿斗篷' },
      { choiceId: 'ask_thirteenth', label: '补问第十三副餐具' },
      { choiceId: 'ask_letters', label: '补问旧信' },
    ],
  },
  npc_housekeeper_evelyn_b5: {
    hint: '请她交出二楼伊芙琳房间的钥匙，并追问那晚她看见的搬运经过。',
    sequence: [
      { choiceId: 'ask_room', label: '索取伊芙琳房间的钥匙' },
      { choiceId: 'ask_night', label: '问夜间搬运' },
    ],
  },
  npc_housekeeper_room_01: {
    hint: '收好钥匙后，如果还没问清那晚的搬运经过，可以顺势继续追问。',
    sequence: [
      { choiceId: 'ask_night', label: '继续追问那晚的搬运经过' },
    ],
  },
  npc_housekeeper_night_01: {
    sequence: [{ choiceId: 'press', label: '继续追问搬运经过' }],
  },
  npc_housekeeper_night_02: {
    hint: '确认她当时是否还活着、为何多年沉默，并向她索取二楼房间的钥匙。',
    sequence: [
      { choiceId: 'ask_alive', label: '确认伊芙琳当时是否还活着' },
      { choiceId: 'ask_why_silent', label: '问她为什么沉默' },
      { choiceId: 'ask_room', label: '索取伊芙琳房间的钥匙' },
    ],
  },
  npc_housekeeper_night_03: {
    hint: '了解她的苦衷后，可请她把二楼伊芙琳房间的钥匙交给你。',
    sequence: [
      { choiceId: 'ask_room', label: '索取伊芙琳房间的钥匙' },
    ],
  },
  npc_housekeeper_night_04: {
    hint: '拿到她的目击证词后，请她把二楼伊芙琳房间的钥匙交给你。',
    sequence: [
      { choiceId: 'ask_room', label: '索取伊芙琳房间的钥匙' },
    ],
  },
  npc_housekeeper_letter_01: {
    hint: '先索取房间钥匙或问那晚的经过，再问她为什么直到现在才寄信。',
    sequence: [
      { choiceId: 'ask_room', label: '索取伊芙琳房间的钥匙' },
      { choiceId: 'ask_night', label: '问那晚发生了什么' },
      { choiceId: 'ask_why', label: '问她为何现在才寄信' },
    ],
  },
  npc_housekeeper_letter_02: {
    sequence: [
      { choiceId: 'ask_room', label: '索取伊芙琳房间的钥匙' },
    ],
  },
  npc_housekeeper_study_01: {
    sequence: [{ choiceId: 'press', label: '追问伊芙琳在查什么' }],
  },
  npc_housekeeper_confront_01: {
    hint: '如果她信任你，先直接请求作证；不要一开口就用代价逼她。',
    sequence: [
      { choiceId: 'need_testimony', label: '请求她作证' },
    ],
  },
  npc_housekeeper_hesitate: {
    sequence: [{ choiceId: 'promise', label: '先保证她的安全' }],
  },

  npc_arthur_intro: {
    hint: '先谈伊芙琳的死，再问午夜文件，最后再聊这栋房子。',
    sequence: [
      { choiceId: 'ask_evelyn', label: '先问伊芙琳' },
      { choiceId: 'ask_will', label: '再问午夜文件' },
      { choiceId: 'ask_house', label: '最后问这栋房子' },
    ],
  },
  npc_arthur_evelyn_01: {
    hint: '先追问她为什么去崖边；若持有全家福，再出示照片。',
    sequence: [
      { choiceId: 'ask_why_cliff', label: '追问崖边经过' },
      { choiceId: 'show_photo', label: '出示全家福' },
    ],
  },
  npc_arthur_evelyn_02: {
    sequence: [{ choiceId: 'ask_study', label: '追问那晚他在哪里' }],
  },
  npc_arthur_will_01: {
    hint: '先问孤儿院，再问为什么一定要在午夜签字。',
    sequence: [
      { choiceId: 'ask_orphanage', label: '问孤儿院' },
      { choiceId: 'ask_midnight', label: '问午夜签字' },
    ],
  },
  npc_arthur_dinner_01: {
    hint: '先问伊芙琳当晚的状态，再问餐具与遗嘱；最后再决定是否沉默观察。',
    sequence: [
      { choiceId: 'ask_evelyn', label: '问伊芙琳的状态' },
      { choiceId: 'ask_seat', label: '问多出的餐具' },
      { choiceId: 'look_will', label: '查看遗嘱' },
      { choiceId: 'watch', label: '观察三人反应' },
    ],
  },
  npc_arthur_b5_dining_01: {
    hint: '按你手里已取得的证据逐项追问，先问最能动摇他的部分。',
    sequence: [
      { choiceId: 'ask_scratch', label: '追问腕上抓痕' },
      { choiceId: 'ask_cloak', label: '追问湿斗篷' },
      { choiceId: 'ask_recording', label: '提伊芙琳的录音' },
      { choiceId: 'ask_ledger', label: '提书房账本' },
    ],
  },
  npc_arthur_b5_study_01: {
    hint: '按你手里已取得的证据逐项追问，先问最能动摇他的部分。',
    sequence: [
      { choiceId: 'ask_scratch', label: '追问腕上抓痕' },
      { choiceId: 'ask_cloak', label: '追问湿斗篷' },
      { choiceId: 'ask_recording', label: '提伊芙琳的录音' },
      { choiceId: 'ask_ledger', label: '提书房账本' },
    ],
  },
  npc_arthur_b5_gallery_01: {
    hint: '按你手里已取得的证据逐项追问，先问最能动摇他的部分。',
    sequence: [
      { choiceId: 'ask_scratch', label: '追问腕上抓痕' },
      { choiceId: 'ask_cloak', label: '先提湿斗篷' },
      { choiceId: 'ask_recording', label: '提伊芙琳的录音' },
      { choiceId: 'ask_ledger', label: '再提账本' },
    ],
  },
  npc_arthur_confront_01: {
    hint: '先出示一项你最有把握的硬证据；证据不足时，再直接质问或放软语气。',
    sequence: [
      { choiceId: 'show_testimony', label: '优先：霍尔太太的证词' },
      { choiceId: 'play_recording', label: '其次：伊芙琳的录音' },
      { choiceId: 'show_log', label: '其次：船长日志' },
      { choiceId: 'show_policy', label: '其次：赔付单' },
      { choiceId: 'accuse', label: '无证据时：直接质问' },
      { choiceId: 'ask_father', label: '追问父亲的命令' },
      { choiceId: 'mercy', label: '放软语气，引他自己开口' },
    ],
  },
  npc_arthur_midnight_01: {
    hint: '签字前可以先问她会怎么选；这不会替你做最终决定。',
    sequence: [{ choiceId: 'ask_evelyn', label: '先问伊芙琳会怎么选' }],
  },
  npc_arthur_refuse_01: {
    hint: '如果账本与赔付单都在手里，先出示证据再拒签。',
    sequence: [
      { choiceId: 'present_evidence', label: '出示账本与赔付单' },
    ],
  },

  npc_doctor_intro: {
    hint: '先顺着问诊开场，再问那个夏天，最后把话题转到伊芙琳的死。',
    sequence: [
      { choiceId: 'polite', label: '先顺着问诊开场' },
      { choiceId: 'ask_summer', label: '再问那个夏天' },
      { choiceId: 'ask_evelyn', label: '最后问伊芙琳的死' },
    ],
  },
  npc_doctor_purpose: {
    sequence: [{ choiceId: 'ask_sleep', label: '追问亚瑟为什么睡不着' }],
  },
  npc_doctor_evelyn_01: {
    hint: '先锁定到场时间；拿到诊疗记录后，再出示记录。',
    sequence: [
      { choiceId: 'ask_time', label: '先问到场时间' },
      { choiceId: 'show_record', label: '再出示诊疗记录' },
    ],
  },
  npc_doctor_record_01: {
    sequence: [{ choiceId: 'press', label: '追问后枕挫伤' }],
  },
  npc_doctor_b5_01: {
    sequence: [
      { choiceId: 'ask_evelyn', label: '先转入伊芙琳的死因' },
      { choiceId: 'ask_motive', label: '崩溃后再问他为何隐瞒' },
    ],
  },
  npc_doctor_evelyn_b5: {
    hint: '先出示诊疗记录；浴室痕迹也拿到后，再追问毛巾。',
    sequence: [
      { choiceId: 'show_record', label: '先出示诊疗记录' },
      { choiceId: 'ask_towel', label: '再追问浴室毛巾' },
    ],
  },
  npc_doctor_record_b5_01: {
    sequence: [{ choiceId: 'press', label: '追问后枕挫伤' }],
  },
  npc_doctor_challenge_01: {
    sequence: [{ choiceId: 'press', label: '用浴室痕迹继续施压' }],
  },
  npc_doctor_midnight_01: {
    hint: '若他已崩溃，先直接请求作证；威胁会让他配合，但关系会进一步恶化。',
    sequence: [{ choiceId: 'ask_testify', label: '先请求作证' }],
  },
};
