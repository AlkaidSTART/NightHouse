/**
 * 首页“人物档案”展示数据。
 *
 * 姓名、年龄、身高与外观特征以 assets/models/characters/references 中的
 * 三视图设定为准；身份与外在描述对应 docs/午夜别墅_世界观设定_v0.7.md 第 6 节。
 * 渲染图由 tools/blender/build_npcs.py 在 Blender 内生成。
 */

export type CharacterId = 'npc_arthur' | 'npc_housekeeper' | 'npc_doctor';

export type CharacterViewKey = 'front' | 'side' | 'back' | 'threeQuarter';

export type CharacterRenderSet = Record<CharacterViewKey | 'portrait', string>;

export interface CharacterArchiveEntry {
  id: CharacterId;
  name: string;
  latin: string;
  role: string;
  age: number;
  heightM: number;
  note: string;
  details: readonly string[];
  renders: CharacterRenderSet;
}

const RENDER_ROOT = '/assets/renders/characters';

function renderSet(folder: 'arthur' | 'housekeeper' | 'doctor'): CharacterRenderSet {
  return {
    front: `${RENDER_ROOT}/${folder}/front.jpg`,
    side: `${RENDER_ROOT}/${folder}/side.jpg`,
    back: `${RENDER_ROOT}/${folder}/back.jpg`,
    threeQuarter: `${RENDER_ROOT}/${folder}/three_quarter.jpg`,
    portrait: `${RENDER_ROOT}/${folder}/portrait.jpg`,
  };
}

export const characterArchive: readonly CharacterArchiveEntry[] = [
  {
    id: 'npc_arthur',
    name: '亚瑟·阿什克罗夫特',
    latin: 'ARTHUR ASHCROFT',
    role: '长子 · 现任家主',
    age: 32,
    heightM: 1.8,
    note: '整洁、克制，眼下有长期失眠的痕迹。',
    details: ['深色长礼服', '怀表与表链', '左腕浅白抓痕'],
    renders: renderSet('arthur'),
  },
  {
    id: 'npc_housekeeper',
    name: '霍尔太太',
    latin: 'MRS. HALL',
    role: '管家 · 在宅中服务三十年',
    age: 58,
    heightM: 1.58,
    note: '寡言、动作精确，永远站在门边而不是房间中央。',
    details: ['深色长裙与亚麻围裙', '腰间钥匙串', '手背旧烫伤'],
    renders: renderSet('housekeeper'),
  },
  {
    id: 'npc_doctor',
    name: '埃利亚斯·格雷医生',
    latin: 'DR. ELIAS GREY',
    role: '家庭医生 · 服务家族二十年',
    age: 61,
    heightM: 1.72,
    note: '温和、疲惫，习惯用医学术语转移话题。',
    details: ['圆框眼镜', '1897 皮革医疗包', '怀表与表链'],
    renders: renderSet('doctor'),
  },
];

export const characterViewLabels: ReadonlyArray<{
  key: CharacterViewKey;
  label: string;
}> = [
  { key: 'front', label: '正面' },
  { key: 'side', label: '侧面' },
  { key: 'back', label: '背面' },
  { key: 'threeQuarter', label: '四分之三' },
];
