import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as pc from 'playcanvas';
import {
  DEFAULT_NPC_GESTURE_PROFILE,
  NpcGesture,
} from '../src/game/scene/NpcGesture.ts';

const BONE_NAMES = [
  'Hips',
  'Spine',
  'Chest',
  'Neck',
  'Head',
  'UpperArm.L',
  'UpperArm.R',
  'LowerArm.L',
  'LowerArm.R',
  'Hand.L',
  'Hand.R',
];

function buildMockNpc(name = 'npc_test'): pc.Entity {
  const root = new pc.Entity(name);
  for (const boneName of BONE_NAMES) {
    root.addChild(new pc.Entity(boneName));
  }
  return root;
}

function rotationMagnitude(rotation: pc.Quat): number {
  return (
    Math.abs(rotation.x) +
    Math.abs(rotation.y) +
    Math.abs(rotation.z) +
    Math.abs(rotation.w - 1)
  );
}

test('NpcGesture 在对话中驱动头部、胸腔与重心微动作', () => {
  const root = buildMockNpc();
  const gesture = new NpcGesture(root, DEFAULT_NPC_GESTURE_PROFILE, {
    reducedMotion: false,
    animated: false,
  });

  for (let i = 0; i < 40; i++) {
    gesture.update(1 / 60, true, true);
  }

  const head = root.findByName('Head') as pc.Entity;
  const chest = root.findByName('Chest') as pc.Entity;
  const hips = root.findByName('Hips') as pc.Entity;

  assert.ok(
    rotationMagnitude(head.getLocalRotation()) > 1e-4,
    '对话中头部应有可见微动',
  );
  assert.ok(
    rotationMagnitude(chest.getLocalRotation()) > 1e-4,
    '胸腔应随呼吸和重心变化',
  );
  assert.ok(
    rotationMagnitude(hips.getLocalRotation()) > 1e-5,
    '重心应有缓慢左右转移',
  );

  gesture.dispose();
});

test('NpcGesture 的叠加偏移不会跨帧累积', () => {
  const root = buildMockNpc();
  const gesture = new NpcGesture(root, DEFAULT_NPC_GESTURE_PROFILE, {
    reducedMotion: false,
    animated: true,
  });
  const head = root.findByName('Head') as pc.Entity;

  let maxMagnitude = 0;
  for (let i = 0; i < 120; i++) {
    // 模拟动画组件每帧先把骨骼重置为动画姿态。
    head.setLocalRotation(new pc.Quat(0, 0, 0, 1));
    gesture.update(1 / 60, true, true);
    maxMagnitude = Math.max(
      maxMagnitude,
      rotationMagnitude(head.getLocalRotation()),
    );
  }

  assert.ok(
    maxMagnitude < 0.2,
    `单帧偏移应保持在小动作范围，实际最大 ${maxMagnitude}`,
  );

  gesture.dispose();
});

test('NpcGesture 尊重减少动态效果设置', () => {
  const root = buildMockNpc();
  const gesture = new NpcGesture(root, DEFAULT_NPC_GESTURE_PROFILE, {
    reducedMotion: true,
  });
  const head = root.findByName('Head') as pc.Entity;

  for (let i = 0; i < 60; i++) {
    gesture.update(1 / 60, true, true);
  }

  assert.equal(rotationMagnitude(head.getLocalRotation()), 0);

  gesture.dispose();
});

test('NpcGesture 在对话关闭后回到静息姿态', () => {
  const root = buildMockNpc();
  const gesture = new NpcGesture(root, DEFAULT_NPC_GESTURE_PROFILE, {
    reducedMotion: false,
    animated: false,
  });
  const head = root.findByName('Head') as pc.Entity;

  for (let i = 0; i < 40; i++) {
    gesture.update(1 / 60, true, false);
  }
  assert.ok(rotationMagnitude(head.getLocalRotation()) > 1e-4);

  for (let i = 0; i < 120; i++) {
    gesture.update(0.05, false, false);
  }
  assert.ok(
    rotationMagnitude(head.getLocalRotation()) < 1e-6,
    '无动画组件时应手动还原静息旋转',
  );

  gesture.dispose();
});

test('NpcGesture 在 dispose 后停止写入骨骼', () => {
  const root = buildMockNpc();
  const gesture = new NpcGesture(root, DEFAULT_NPC_GESTURE_PROFILE, {
    reducedMotion: false,
    animated: false,
  });
  const head = root.findByName('Head') as pc.Entity;

  gesture.dispose();
  head.setLocalRotation(new pc.Quat(0, 0, 0, 1));
  gesture.update(0.05, true, true);

  assert.equal(rotationMagnitude(head.getLocalRotation()), 0);
});

test('NpcGesture 缺少骨骼时不抛错', () => {
  const root = new pc.Entity('npc_without_bones');
  const gesture = new NpcGesture(root);

  gesture.update(1 / 60, true, true);
  gesture.dispose();
  assert.ok(true);
});
