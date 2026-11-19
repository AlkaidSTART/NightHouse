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
  'Clavicle.L',
  'Clavicle.R',
  'Fingers.L',
  'Fingers.R',
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
  });

  for (let i = 0; i < 40; i++) {
    gesture.update(1 / 60, 'speak');
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

test('待机微动作驱动新增锁骨和手指，且与有关键帧的头部共用时不会漂移', () => {
  const root = buildMockNpc();
  const gesture = new NpcGesture(root, DEFAULT_NPC_GESTURE_PROFILE, { reducedMotion: false });
  const head = root.findByName('Head') as pc.Entity;
  const joints = ['Clavicle.L', 'Fingers.L', 'Fingers.R']
    .map((name) => root.findByName(name) as pc.Entity);
  const maxMagnitudes = joints.map(() => 0);
  const keyedRotation = new pc.Quat().setFromEulerAngles(0, 20, 0);

  for (let i = 0; i < 1200; i++) {
    // 只有头部有关键帧，新关节保持上一帧的局部旋转。
    head.setLocalRotation(keyedRotation);
    gesture.update(1 / 60, 'idle');
    joints.forEach((bone, index) => {
      maxMagnitudes[index] = Math.max(maxMagnitudes[index] ?? 0, rotationMagnitude(bone.getLocalRotation()));
    });
  }

  maxMagnitudes.forEach((maximum) => assert.ok(maximum > 1e-3 && maximum < 0.08));
  gesture.update(1 / 60, 'hidden');
  joints.forEach((bone) => assert.equal(rotationMagnitude(bone.getLocalRotation()), 0));
  assert.ok(head.getLocalRotation().equals(keyedRotation));
  gesture.dispose();
});

test('NpcGesture 尊重减少动态效果设置', () => {
  const root = buildMockNpc();
  const gesture = new NpcGesture(root, DEFAULT_NPC_GESTURE_PROFILE, {
    reducedMotion: true,
  });
  const head = root.findByName('Head') as pc.Entity;

  for (let i = 0; i < 60; i++) {
    gesture.update(1 / 60, 'speak');
  }

  assert.equal(rotationMagnitude(head.getLocalRotation()), 0);

  gesture.dispose();
});

test('NpcGesture 在角色隐藏后还原骨骼姿态', () => {
  const root = buildMockNpc();
  const gesture = new NpcGesture(root, DEFAULT_NPC_GESTURE_PROFILE, {
    reducedMotion: false,
  });
  const head = root.findByName('Head') as pc.Entity;

  for (let i = 0; i < 40; i++) {
    gesture.update(1 / 60, 'listen');
  }
  assert.ok(rotationMagnitude(head.getLocalRotation()) > 1e-4);

  gesture.update(0.05, 'hidden');
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
  });
  const head = root.findByName('Head') as pc.Entity;

  gesture.dispose();
  head.setLocalRotation(new pc.Quat(0, 0, 0, 1));
  gesture.update(0.05, 'speak');

  assert.equal(rotationMagnitude(head.getLocalRotation()), 0);
});

test('NpcGesture 缺少骨骼时不抛错', () => {
  const root = new pc.Entity('npc_without_bones');
  const gesture = new NpcGesture(root);

  gesture.update(1 / 60, 'speak');
  gesture.dispose();
  assert.ok(true);
});
