import assert from 'node:assert/strict';
import { test } from 'node:test';
import { content } from '../src/content/index.ts';
import { inspectables } from '../src/content/inspectables.ts';
import { villaGreybox } from '../src/content/scenes/villaGreybox.ts';
import { InspectionSystem } from '../src/game/inspection/InspectionSystem.ts';
import type { InspectionView } from '../src/shared/types/inspection.ts';

const clueIds = new Set(content.clues.map((clue) => clue.id));

test('检视内容：ID 唯一，且覆盖每个场景交互点', () => {
  const ids = inspectables.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length, '检视内容 ID 有重复');
  assert.ok(ids.every((id) => id.startsWith('INT_')));

  const sceneIds = new Set(villaGreybox.interactables.map((item) => item.id));
  for (const id of sceneIds) {
    assert.ok(ids.includes(id), `交互点 ${id} 缺少检视内容`);
  }
});

test('检视内容：每个对象都有标题、类别与可直接显示的正文', () => {
  for (const item of inspectables) {
    assert.ok(item.title.trim().length > 0, `${item.id} 缺少标题`);
    assert.ok(item.category.trim().length > 0, `${item.id} 缺少类别`);
    assert.ok(item.variants.length > 0, `${item.id} 没有变体`);

    const fallbackIndexes = item.variants.flatMap((variant, index) =>
      variant.when ? [] : [index],
    );
    assert.equal(fallbackIndexes.length, 1, `${item.id} 应有一个兜底变体`);
    assert.equal(
      fallbackIndexes[0],
      item.variants.length - 1,
      `${item.id} 的兜底变体必须放在最后`,
    );

    for (const variant of item.variants) {
      assert.ok(variant.sections.length > 0, `${item.id} 有空白变体`);
      for (const section of variant.sections) {
        assert.ok(section.paragraphs.length > 0, `${item.id} 有空白段落组`);
        for (const paragraph of section.paragraphs) {
          assert.ok(paragraph.trim().length > 0, `${item.id} 有空白段落`);
        }
      }
    }
  }
});

test('检视内容：效果只引用已存在的线索', () => {
  for (const item of inspectables) {
    for (const variant of item.variants) {
      for (const effect of variant.effects ?? []) {
        if (effect.type === 'discover-clue') {
          assert.ok(
            clueIds.has(effect.key),
            `${item.id} 引用了不存在的线索 ${effect.key}`,
          );
        }
      }
    }
  }
});

interface FakeHost {
  flags: Record<string, boolean | number | string>;
  discovered: Set<string>;
  view: InspectionView | null;
}

function createHost(): {
  state: FakeHost;
  host: ConstructorParameters<typeof InspectionSystem>[0]['host'];
} {
  const state: FakeHost = { flags: {}, discovered: new Set(), view: null };
  return {
    state,
    host: {
      getFlags: () => state.flags,
      setFlag: (key, value) => {
        state.flags[key] = value;
      },
      discoverClue: (clueId) => {
        if (state.discovered.has(clueId)) {
          return false;
        }
        state.discovered.add(clueId);
        return true;
      },
      getClueTitle: (clueId) => {
        const clue = content.clues.find((entry) => entry.id === clueId);
        return clue?.title ?? null;
      },
      onChange: (view) => {
        state.view = view;
      },
    },
  };
}

test('检视系统：首次阅读写入线索与剧情标记，重复阅读不重复记录', () => {
  const fake = createHost();
  const system = new InspectionSystem({
    inspectables,
    host: fake.host,
  });

  assert.equal(system.open('INT_prop_family_portrait'), true);
  assert.ok(system.active);
  assert.deepEqual(fake.state.view?.newClueTitles, ['被剪掉的全家福']);
  assert.equal(fake.state.flags['story.photo_cut'], true);
  assert.ok(fake.state.discovered.has('clue_family_photo'));

  system.close();
  assert.equal(fake.state.view, null);

  system.open('INT_prop_family_portrait');
  assert.deepEqual(fake.state.view?.newClueTitles, []);
});

test('检视系统：按剧情标记选择变体，拿到蜡筒后才播放录音', () => {
  const fake = createHost();
  const system = new InspectionSystem({ inspectables, host: fake.host });

  system.open('INT_prop_phonograph');
  assert.equal(fake.state.view?.newClueTitles.length, 0);
  assert.ok(
    fake.state.view?.sections.some((section) =>
      section.paragraphs.some((paragraph) => paragraph.includes('空着')),
    ),
  );
  system.close();

  fake.state.flags['item.cylinder'] = true;
  system.open('INT_prop_phonograph');
  assert.deepEqual(fake.state.view?.newClueTitles, ['留声机蜡筒']);
  assert.equal(fake.state.flags['story.heard_recording'], true);
});

test('检视系统：未知交互点不打开面板', () => {
  const fake = createHost();
  const system = new InspectionSystem({ inspectables, host: fake.host });
  assert.equal(system.open('INT_prop_missing'), false);
  assert.equal(fake.state.view, null);
});

test('检视系统：修好落地钟后暗格内容与两条线索一起出现', () => {
  const fake = createHost();
  const system = new InspectionSystem({ inspectables, host: fake.host });

  fake.state.flags['story.clock_repaired'] = true;
  system.open('INT_prop_longcase_clock');
  assert.deepEqual(fake.state.view?.newClueTitles, [
    '船长日志',
    '四名船员的名字',
  ]);
  assert.equal(fake.state.flags['story.knows_shipwreck'], true);
  assert.equal(fake.state.flags['story.knows_crew_names'], true);
});

test('检视系统：普通陈设也能补全世界档案', () => {
  const fake = createHost();
  const system = new InspectionSystem({ inspectables, host: fake.host });

  system.open('INT_prop_telephone');
  assert.deepEqual(fake.state.view?.newClueTitles, ['1897 年的宅内技术']);
  assert.ok(fake.state.discovered.has('clue_1897_technology'));
});

test('检视系统：返潮旧斗篷会成为亚瑟行动线的辅助线索', () => {
  const fake = createHost();
  const system = new InspectionSystem({ inspectables, host: fake.host });

  system.open('INT_prop_cloak');
  assert.deepEqual(fake.state.view?.newClueTitles, ['返潮的旧斗篷']);
  assert.equal(fake.state.flags['story.knows_wet_cloak'], true);
  assert.ok(fake.state.discovered.has('clue_arthur_cloak'));
});

test('检视系统：证据齐全后在书桌整理案情并解锁对质', () => {
  const fake = createHost();
  const system = new InspectionSystem({ inspectables, host: fake.host });
  fake.state.flags['story.doctor_confessed'] = true;
  fake.state.flags['story.heard_recording'] = true;
  fake.state.flags['story.safe_opened'] = true;

  system.open('INT_prop_study_desk_drawer');
  assert.equal(fake.state.flags['story.case_ready'], true);
  assert.equal(fake.state.view?.newClueTitles.length, 0);
  assert.ok(
    fake.state.view?.sections.some((section) =>
      section.paragraphs.some((paragraph) => paragraph.includes('三样东西')),
    ),
  );
});

test('检视系统：修好钟也能用船长日志完成书桌整理', () => {
  const fake = createHost();
  const system = new InspectionSystem({ inspectables, host: fake.host });
  fake.state.flags['story.doctor_confessed'] = true;
  fake.state.flags['story.heard_recording'] = true;
  fake.state.flags['story.clock_repaired'] = true;

  system.open('INT_prop_study_desk_drawer');
  assert.equal(fake.state.flags['story.case_ready'], true);
  assert.ok(
    fake.state.view?.sections.some((section) =>
      section.paragraphs.some((paragraph) => paragraph.includes('第十三下')),
    ),
  );
});
