import type { PuzzleDefinition } from '../shared/types/content';

/**
 * 谜题文案与判定参数。状态机在 `src/game/puzzles/`，这里只放剧情文本、
 * 操作标签和答案，避免把台词硬编码在 UI 或控制器里。
 * 依据：docs/午夜别墅_故事线文档_v0.7.md §4.1–§4.2。
 */

export interface ClockCalibrationChoice {
  id: string;
  label: string;
  correct: boolean;
}

export interface ClockPuzzleContent {
  definition: PuzzleDefinition;
  title: string;
  category: string;
  actions: {
    openDoor: string;
    hangPendulum: string;
    wind: string;
  };
  calibration: readonly ClockCalibrationChoice[];
  texts: {
    lockedWithoutKey: string;
    doorReady: string;
    doorOpenedNoPendulum: string;
    pendulumReady: string;
    pendulumHung: string;
    woundNeedsClock: string;
    calibrationReady: string;
    doorOpened: string;
    pendulumInstalled: string;
    wound: string;
    wrongTime: string;
    success: string;
  };
}

export interface SafePuzzleContent {
  definition: PuzzleDefinition;
  title: string;
  category: string;
  code: string;
  texts: {
    lockedWithoutClues: string;
    ready: string;
    wrongCode: string;
    thirdFailure: string;
    success: string;
  };
}

export const clockPuzzleContent: ClockPuzzleContent = {
  definition: {
    id: 'puzzle_clock',
    title: '落地钟',
    description:
      '让门厅落地钟校准到 23:47，分针越过十二点时试响十三下，打开钟座暗格。',
    prerequisites: [
      { flag: 'item.clock_key' },
      { flag: 'item.pendulum' },
    ],
    successConditions: [{ flag: 'story.clock_repaired' }],
    failureFeedback: '钟在错误的时刻敲了十二下，暗格没有打开。',
    successEvent: 'puzzle.clock',
  },
  title: '落地钟',
  category: '谜题 · 钟座暗格',
  actions: {
    openDoor: '用黄铜钥匙打开钟门',
    hangPendulum: '把摆锤挂回摆杆',
    wind: '上弦',
  },
  calibration: [
    { id: 'clock.set-2347', label: '拨到 23:47', correct: true },
    { id: 'clock.set-0000', label: '拨到 00:00', correct: false },
    { id: 'clock.set-1200', label: '拨到 12:00', correct: false },
    { id: 'clock.set-0314', label: '拨到 03:14', correct: false },
  ],
  texts: {
    lockedWithoutKey:
      '钟门锁着。锁孔很小，边缘有一圈新鲜的黄铜划痕。你需要一把合适的钥匙。',
    doorReady:
      '钟门锁着，但书房抽屉里那串钥匙中有一把黄铜小钥匙，柄上刻着钟面图案。',
    doorOpenedNoPendulum:
      '钟门打开了。钟摆杆空着，摆锤不在钟座里。钟面停在十二点差一点的位置。',
    pendulumReady:
      '钟门开着，摆锤就在你手里。把它挂回摆杆，钟才有可能重新走起来。',
    pendulumHung: '摆锤挂回了摆杆，但钟还是停着。需要上弦。',
    woundNeedsClock:
      '你转动钥匙上弦。钟摆开始摆动，钟面却指向错误的时间。分针要拨过十二点，才能触发报时凸轮。可你得先确认现在到底几点。',
    calibrationReady:
      '客厅壁炉上的小座钟显示 23:47，潮汐表也确认午夜是满潮。把门厅钟的指针拨过十二点，校准到同一时刻。',
    doorOpened: '钟门打开了。',
    pendulumInstalled: '摆锤挂好了，钟摆轻轻晃了一下。',
    wound: '钟开始走了。齿轮咬合的声音在钟座里慢慢展开。',
    wrongTime:
      '钟在错误的时刻敲了十二下。声音在门厅里转了一圈，暗格纹丝不动。',
    success:
      '分针越过十二点的一瞬，钟锤落了下去。一下、两下……第十三下时，钟座侧板弹开，露出一个狭长的暗格。',
  },
};

export const safePuzzleContent: SafePuzzleContent = {
  definition: {
    id: 'puzzle_safe',
    title: '保险箱',
    description:
      '用油画题字与报纸日期推出四位数字，打开书房保险箱，取得航运账本与保险赔付单。',
    prerequisites: [{ flag: 'clue.ship_painting' }],
    successConditions: [{ flag: 'story.safe_opened' }],
    failureFeedback: '转盘发出干涩的卡响，箱门不动。',
    successEvent: 'puzzle.safe',
  },
  title: '保险箱',
  category: '谜题 · 四位转盘',
  code: '0314',
  texts: {
    lockedWithoutClues:
      '箱门是四位数字转盘，第 3、4 位磨得最亮。你还没有能推出密码的依据。先去看看帆船油画和旧报纸。',
    ready:
      '箱门是四位数字转盘，第 3、4 位磨得最亮。把你知道的日期换算成四位数字。',
    wrongCode: '转盘发出干涩的卡响，箱门不动。',
    thirdFailure:
      '门外传来脚步声，停在书房门口。格雷医生：「有些东西，锁着是有原因的。」',
    success:
      '最后一位数字对上的瞬间，锁舌缩了回去。箱门打开，里面是一叠用细绳捆好的文件。',
  },
};
