import type { StoryCondition } from '../shared/types/content';
import type { SceneNpcSpot } from '../shared/types/scene';

export interface ObjectiveGuideDefinition {
  id: string;
  title: string;
  hint: string;
  target:
    | { kind: 'prop'; id: string; label: string }
    | { kind: 'npc'; id: SceneNpcSpot['npcId']; label: string };
  /** 全部满足后跳过此行动；未完成的调查不会因到达房间而消失。 */
  until?: readonly StoryCondition[];
}

/** 只描述现有交互的推荐顺序，不写入剧情状态，也不替玩家作出选择。 */
export const objectiveGuides: Readonly<Record<string, readonly ObjectiveGuideDefinition[]>> = {
  step_housekeeper: [{
    id: 'guide_housekeeper',
    title: '和霍尔太太打招呼',
    hint: '靠近正门内侧的霍尔太太，对准她按 E。先回应她的招待，再问伊芙琳。',
    target: { kind: 'npc', id: 'npc_housekeeper', label: '霍尔太太' },
  }],
  step_arthur: [{
    id: 'guide_arthur',
    title: '向亚瑟询问伊芙琳',
    hint: '靠近亚瑟按 E 交谈。问完感兴趣的话题，选择告辞以结束这次会面。',
    target: { kind: 'npc', id: 'npc_arthur', label: '亚瑟' },
  }],
  step_doctor: [{
    id: 'guide_doctor_time',
    title: '问格雷医生那晚几点到场',
    hint: '交谈时先问伊芙琳的死，再追问到场时间；只寒暄还不能推进调查。',
    target: { kind: 'npc', id: 'npc_doctor', label: '格雷医生' },
  }],
  step_coverup: [
    {
      id: 'guide_housekeeper_night',
      title: '向霍尔太太追问那晚的经过',
      hint: '先问「伊芙琳的事，你还记得什么？」，再问那晚看见了什么，并继续追问。',
      target: { kind: 'npc', id: 'npc_housekeeper', label: '霍尔太太' },
      until: [{ flag: 'story.knows_coverup' }],
    },
    {
      id: 'guide_housekeeper_key',
      title: '请霍尔太太交出卧室钥匙',
      hint: '向她询问伊芙琳的房间并索取钥匙；结束交谈后查看新的调查目标。',
      target: { kind: 'npc', id: 'npc_housekeeper', label: '霍尔太太' },
    },
  ],
  stage_medical_record: [{
    id: 'guide_medical_record',
    title: '搜索书桌最下层抽屉',
    hint: '走到书桌旁，低头对准最下层抽屉按 E，阅读其中的诊疗副本。',
    target: { kind: 'prop', id: 'INT_prop_study_desk_drawer', label: '书桌抽屉' },
  }],
  stage_bathroom_trace: [{
    id: 'guide_bathroom_trace',
    title: '检查浴室里的药柜',
    hint: '上二楼进入浴室，对准药柜按 E。毛巾架和地砖缝也可以调查。',
    target: { kind: 'prop', id: 'INT_prop_medicine_cabinet', label: '药柜' },
  }],
  step_medical_truth: [{
    id: 'guide_doctor_evidence',
    title: '向格雷出示诊疗记录并追问浴室痕迹',
    hint: '和格雷交谈，先出示诊疗记录，再用浴室痕迹继续追问，直到他说出现场经过。',
    target: { kind: 'npc', id: 'npc_doctor', label: '格雷医生' },
  }],
  stage_find_cylinder: [{
    id: 'guide_find_cylinder',
    title: '打开梳妆台抽屉',
    hint: '进入二楼伊芙琳的卧室，走到梳妆台旁，低头对准抽屉按 E。',
    target: { kind: 'prop', id: 'INT_prop_vanity_drawer', label: '梳妆台抽屉' },
  }],
  step_recording: [{
    id: 'guide_play_cylinder',
    title: '把蜡筒放上留声机',
    hint: '回到一层书房，对准留声机按 E，阅读并听完伊芙琳的留言。',
    target: { kind: 'prop', id: 'INT_prop_phonograph', label: '留声机' },
  }],
  step_corroborate_safe: [
    {
      id: 'guide_painting_front',
      title: '先查看客厅的帆船油画',
      hint: '前往客厅，调查墙上的帆船油画，寻找与保险箱有关的日期记录。',
      target: { kind: 'prop', id: 'INT_prop_ship_painting', label: '帆船油画' },
      until: [{ flag: 'clue.ship_painting' }],
    },
    {
      id: 'guide_painting_back',
      title: '查看帆船油画右侧的画框背面',
      hint: '画框右侧留有缝隙。向右挪一点，对准背面的小标记按 E，记下题字中的日期。',
      target: { kind: 'prop', id: 'INT_prop_ship_painting_back', label: '画框背面' },
      until: [{ flag: 'story.knows_ship_date_roman' }],
    },
    {
      id: 'guide_open_safe',
      title: '回书房打开保险箱',
      hint: '对准保险箱按 E。把画框背面的月、日各写成两位，依次输入；按 J 可回看线索。',
      target: { kind: 'prop', id: 'INT_prop_safe', label: '保险箱' },
    },
  ],
  step_corroborate_clock: [
    {
      id: 'guide_clock_key',
      title: '在书房抽屉中寻找钟门钥匙',
      hint: '搜索书桌最下层抽屉，收好带钟面图案的黄铜小钥匙。',
      target: { kind: 'prop', id: 'INT_prop_study_desk_drawer', label: '书桌抽屉' },
      until: [{ flag: 'item.clock_key' }],
    },
    {
      id: 'guide_clock_pendulum',
      title: '检查伊芙琳卧室的衣柜',
      hint: '去二楼卧室，对准衣柜按 E，检查最里面那件沉重的旧外套。',
      target: { kind: 'prop', id: 'INT_prop_wardrobe', label: '衣柜' },
      until: [{ flag: 'item.pendulum' }],
    },
    {
      id: 'guide_mantel_clock',
      title: '查看客厅壁炉边的小座钟',
      hint: '对准小座钟按 E，记下钟面停住的时间。',
      target: { kind: 'prop', id: 'INT_prop_mantel_clock', label: '小座钟' },
      until: [{ flag: 'story.saw_mantel_clock' }],
    },
    {
      id: 'guide_tide_table',
      title: '核对书房的潮汐表',
      hint: '调查书房墙上的潮汐表，将满潮时刻与小座钟的时间比对。',
      target: { kind: 'prop', id: 'INT_prop_tide_table', label: '潮汐表' },
      until: [{ flag: 'story.knows_high_tide' }],
    },
    {
      id: 'guide_repair_clock',
      title: '回门厅修理并校准落地钟',
      hint: '对准落地钟按 E，依次开钟门、挂摆锤、上弦，再按两条时间线索校准。',
      target: { kind: 'prop', id: 'INT_prop_longcase_clock', label: '落地钟' },
    },
  ],
  step_evidence: [{
    id: 'guide_arrange_evidence',
    title: '在书桌上整理已经拿到的证据',
    hint: '对准之前搜索过的书桌抽屉按 E。这次会把证据摊在桌上，推进到对质。',
    target: { kind: 'prop', id: 'INT_prop_study_desk_drawer', label: '书桌抽屉' },
  }],
  step_confront: [{
    id: 'guide_confront_arthur',
    title: '和书房里的亚瑟对质',
    hint: '靠近亚瑟按 E，出示你掌握的证据，继续追问并完成这次交谈。',
    target: { kind: 'npc', id: 'npc_arthur', label: '亚瑟' },
  }],
  step_midnight: [{
    id: 'guide_midnight_choice',
    title: '和签字桌边的亚瑟交谈',
    hint: '靠近亚瑟按 E。你可以先询问，再亲自决定签字或拒绝。',
    target: { kind: 'npc', id: 'npc_arthur', label: '亚瑟' },
  }],
};
