import type { Vec3Tuple } from '../../shared/types/save';
import type { SceneMaterialId } from '../../shared/types/scene';

/**
 * 场景材质与贴图集定义。纯数据，不依赖 PlayCanvas：
 * 运行时（SceneManager）和 GLB 导出脚本共用同一份，避免两边材质漂移。
 */

export type TextureSetId =
  | 'plaster'
  | 'wood'
  | 'woodGrain'
  | 'stone'
  | 'roof'
  | 'ground'
  | 'foliage'
  | 'hedge'
  | 'bark'
  | 'fabric'
  | 'tile'
  | 'grime'
  | 'docLetter'
  | 'docPhoto';

export interface TextureSetPaths {
  baseColor: string;
  normal?: string;
  roughness?: string;
  ao?: string;
}

export const TEXTURE_SETS: Record<TextureSetId, TextureSetPaths> = {
  plaster: {
    baseColor: '/assets/textures/T_Wall_OldPlaster_01_BaseColor.png',
    normal: '/assets/textures/T_Wall_OldPlaster_01_Normal.png',
    roughness: '/assets/textures/T_Wall_OldPlaster_01_Roughness.png',
    ao: '/assets/textures/T_Wall_OldPlaster_01_AO.png',
  },
  wood: {
    baseColor: '/assets/textures/T_Floor_WoodWorn_01_BaseColor.png',
    normal: '/assets/textures/T_Floor_WoodWorn_01_Normal.png',
    roughness: '/assets/textures/T_Floor_WoodWorn_01_Roughness.png',
    ao: '/assets/textures/T_Floor_WoodWorn_01_AO.png',
  },
  woodGrain: {
    baseColor: '/assets/textures/T_Wood_Mahogany_01_BaseColor.png',
    normal: '/assets/textures/T_Wood_Mahogany_01_Normal.png',
    roughness: '/assets/textures/T_Wood_Mahogany_01_Roughness.png',
    ao: '/assets/textures/T_Wood_Mahogany_01_AO.png',
  },
  stone: {
    baseColor: '/assets/textures/T_Stone_Ashlar_01_BaseColor.png',
    normal: '/assets/textures/T_Stone_Ashlar_01_Normal.png',
    roughness: '/assets/textures/T_Stone_Ashlar_01_Roughness.png',
    ao: '/assets/textures/T_Stone_Ashlar_01_AO.png',
  },
  roof: {
    baseColor: '/assets/textures/T_Roof_Slate_01_BaseColor.png',
    normal: '/assets/textures/T_Roof_Slate_01_Normal.png',
    roughness: '/assets/textures/T_Roof_Slate_01_Roughness.png',
    ao: '/assets/textures/T_Roof_Slate_01_AO.png',
  },
  ground: {
    baseColor: '/assets/textures/T_Ground_WetMud_01_BaseColor.png',
    normal: '/assets/textures/T_Ground_WetMud_01_Normal.png',
    roughness: '/assets/textures/T_Ground_WetMud_01_Roughness.png',
    ao: '/assets/textures/T_Ground_WetMud_01_AO.png',
  },
  foliage: {
    baseColor: '/assets/textures/T_Foliage_Pine_01_BaseColor.png',
    normal: '/assets/textures/T_Foliage_Pine_01_Normal.png',
    roughness: '/assets/textures/T_Foliage_Pine_01_Roughness.png',
    ao: '/assets/textures/T_Foliage_Pine_01_AO.png',
  },
  hedge: {
    baseColor: '/assets/textures/T_Foliage_Hedge_01_BaseColor.png',
    normal: '/assets/textures/T_Foliage_Hedge_01_Normal.png',
    roughness: '/assets/textures/T_Foliage_Hedge_01_Roughness.png',
    ao: '/assets/textures/T_Foliage_Hedge_01_AO.png',
  },
  bark: {
    baseColor: '/assets/textures/T_Bark_Pine_01_BaseColor.png',
    normal: '/assets/textures/T_Bark_Pine_01_Normal.png',
    roughness: '/assets/textures/T_Bark_Pine_01_Roughness.png',
    ao: '/assets/textures/T_Bark_Pine_01_AO.png',
  },
  fabric: {
    baseColor: '/assets/textures/T_Fabric_Worn_01_BaseColor.png',
    normal: '/assets/textures/T_Fabric_Worn_01_Normal.png',
    roughness: '/assets/textures/T_Fabric_Worn_01_Roughness.png',
    ao: '/assets/textures/T_Fabric_Worn_01_AO.png',
  },
  tile: {
    baseColor: '/assets/textures/T_Tile_Bathroom_01_BaseColor.png',
    normal: '/assets/textures/T_Tile_Bathroom_01_Normal.png',
    roughness: '/assets/textures/T_Tile_Bathroom_01_Roughness.png',
    ao: '/assets/textures/T_Tile_Bathroom_01_AO.png',
  },
  grime: {
    baseColor: '/assets/textures/T_Grime_DustWear_Set_01_BaseColor.png',
    normal: '/assets/textures/T_Grime_DustWear_Set_01_Normal.png',
    roughness: '/assets/textures/T_Grime_DustWear_Set_01_Roughness.png',
    ao: '/assets/textures/T_Grime_DustWear_Set_01_AO.png',
  },
  docLetter: {
    baseColor: '/assets/textures/documents/TEX_Document_LetterPage.png',
  },
  docPhoto: {
    baseColor: '/assets/textures/documents/TEX_Document_PhotoImage.png',
  },
};

export type DocumentTextureId =
  | 'TEX_Document_LetterPage'
  | 'TEX_Document_DiaryPage'
  | 'TEX_Document_PhotoImage'
  | 'TEX_Document_Will'
  | 'TEX_Document_TideTable'
  | 'TEX_Document_MedicalRecord'
  | 'TEX_Document_ShippingLedger'
  | 'TEX_Document_InsurancePolicy'
  | 'TEX_Document_CaptainsLog'
  | 'TEX_Document_CrewNames'
  | 'TEX_Document_ShipPainting'
  | 'TEX_Document_ShipPainting_Back'
  | 'TEX_Document_FamilyPortrait'
  | 'TEX_Document_Newspaper'
  | 'TEX_Document_CutPhoto'
  | 'TEX_Document_OldLetters'
  | 'TEX_MemorialStone_Inscription'
  | 'TEX_Document_WaxCylinderLabel';

/** 场景与线索 UI 共用的 2D 书证、画作、照片与碑铭贴图路径表。 */
export const DOCUMENT_TEXTURES: Record<DocumentTextureId, string> = {
  TEX_Document_LetterPage: '/assets/textures/documents/TEX_Document_LetterPage.png',
  TEX_Document_DiaryPage: '/assets/textures/documents/TEX_Document_DiaryPage.png',
  TEX_Document_PhotoImage: '/assets/textures/documents/TEX_Document_PhotoImage.png',
  TEX_Document_Will: '/assets/textures/documents/TEX_Document_Will.png',
  TEX_Document_TideTable: '/assets/textures/documents/TEX_Document_TideTable.png',
  TEX_Document_MedicalRecord: '/assets/textures/documents/TEX_Document_MedicalRecord.png',
  TEX_Document_ShippingLedger: '/assets/textures/documents/TEX_Document_ShippingLedger.png',
  TEX_Document_InsurancePolicy: '/assets/textures/documents/TEX_Document_InsurancePolicy.png',
  TEX_Document_CaptainsLog: '/assets/textures/documents/TEX_Document_CaptainsLog.png',
  TEX_Document_CrewNames: '/assets/textures/documents/TEX_Document_CrewNames.png',
  TEX_Document_ShipPainting: '/assets/textures/documents/TEX_Document_ShipPainting.png',
  TEX_Document_ShipPainting_Back: '/assets/textures/documents/TEX_Document_ShipPainting_Back.png',
  TEX_Document_FamilyPortrait: '/assets/textures/documents/TEX_Document_FamilyPortrait.png',
  TEX_Document_Newspaper: '/assets/textures/documents/TEX_Document_Newspaper.png',
  TEX_Document_CutPhoto: '/assets/textures/documents/TEX_Document_CutPhoto.png',
  TEX_Document_OldLetters: '/assets/textures/documents/TEX_Document_OldLetters.png',
  TEX_MemorialStone_Inscription: '/assets/textures/documents/TEX_MemorialStone_Inscription.png',
  TEX_Document_WaxCylinderLabel: '/assets/textures/documents/TEX_Document_WaxCylinderLabel.png',
};

export interface MaterialSpec {
  /** 贴图未就绪时的回退颜色。 */
  color: Vec3Tuple;
  /** 贴图就绪后乘在 diffuseMap 上的色调系数。 */
  mapTint?: Vec3Tuple;
  emissive?: Vec3Tuple;
  gloss?: number;
  metalness?: number;
  bumpiness?: number;
  textureSet?: TextureSetId;
  /** 世界空间平铺尺度（米 / 次重复）；未定义或 <= 0 时每个面保持 0..1 UV。 */
  tileSize?: number;
}

export const MATERIALS: Record<SceneMaterialId, MaterialSpec> = {
  wall: {
    color: [0.22, 0.21, 0.2],
    mapTint: [0.58, 0.56, 0.54],
    gloss: 0.88,
    bumpiness: 0.75,
    textureSet: 'plaster',
    tileSize: 2.4,
  },
  floor: {
    color: [0.18, 0.13, 0.09],
    mapTint: [0.88, 0.8, 0.72],
    gloss: 0.92,
    bumpiness: 0.8,
    textureSet: 'wood',
    tileSize: 2.2,
  },
  ceiling: {
    color: [0.12, 0.12, 0.13],
    mapTint: [0.38, 0.37, 0.39],
    gloss: 0.85,
    bumpiness: 0.5,
    textureSet: 'plaster',
    tileSize: 2.8,
  },
  ground: {
    color: [0.08, 0.09, 0.08],
    mapTint: [0.62, 0.66, 0.64],
    gloss: 0.88,
    bumpiness: 0.9,
    textureSet: 'ground',
    tileSize: 3.5,
  },
  roof: {
    color: [0.1, 0.12, 0.15],
    mapTint: [0.68, 0.72, 0.8],
    gloss: 0.86,
    bumpiness: 0.85,
    textureSet: 'roof',
    tileSize: 2.4,
  },
  wood: {
    color: [0.26, 0.16, 0.1],
    mapTint: [0.92, 0.78, 0.65],
    gloss: 0.92,
    bumpiness: 0.65,
    textureSet: 'woodGrain',
    tileSize: 1.4,
  },
  fabric: {
    color: [0.22, 0.13, 0.14],
    mapTint: [0.92, 0.84, 0.82],
    gloss: 0.88,
    bumpiness: 0.65,
    textureSet: 'fabric',
    tileSize: 1.2,
  },
  tile: {
    color: [0.26, 0.3, 0.31],
    mapTint: [0.78, 0.82, 0.82],
    gloss: 0.94,
    bumpiness: 0.85,
    textureSet: 'tile',
    tileSize: 1.4,
  },
  stone: {
    color: [0.3, 0.32, 0.35],
    mapTint: [0.76, 0.78, 0.82],
    gloss: 0.88,
    bumpiness: 0.9,
    textureSet: 'stone',
    tileSize: 2.0,
  },
  metal: {
    color: [0.32, 0.28, 0.2],
    mapTint: [0.9, 0.78, 0.58],
    gloss: 0.92,
    metalness: 0.72,
    bumpiness: 0.55,
    textureSet: 'grime',
    tileSize: 1.0,
  },
  paper: {
    color: [0.62, 0.56, 0.44],
    mapTint: [0.85, 0.82, 0.76],
    emissive: [0.06, 0.05, 0.03],
    gloss: 0.2,
    textureSet: 'docLetter',
  },
  photo: {
    color: [0.55, 0.5, 0.42],
    mapTint: [0.88, 0.85, 0.8],
    emissive: [0.05, 0.04, 0.03],
    gloss: 0.3,
    textureSet: 'docPhoto',
  },
  mirror: {
    color: [0.3, 0.36, 0.4],
    emissive: [0.04, 0.05, 0.06],
    gloss: 0.88,
    metalness: 0.85,
  },
  foliage: {
    color: [0.07, 0.11, 0.08],
    mapTint: [0.68, 0.78, 0.7],
    gloss: 0.85,
    bumpiness: 0.85,
    textureSet: 'foliage',
    tileSize: 1.5,
  },
  sea: {
    color: [0.02, 0.04, 0.07],
    gloss: 0.75,
    metalness: 0.2,
  },
  door: {
    color: [0.22, 0.13, 0.08],
    mapTint: [0.8, 0.64, 0.5],
    gloss: 0.92,
    bumpiness: 0.7,
    textureSet: 'woodGrain',
    tileSize: 1.6,
  },
  windowLit: { color: [0.92, 0.72, 0.42], emissive: [0.95, 0.68, 0.34] },
  windowDark: { color: [0.02, 0.03, 0.045], gloss: 0.78 },
  npcArthur: { color: [0.2, 0.3, 0.55], emissive: [0.06, 0.1, 0.2] },
  npcHousekeeper: { color: [0.5, 0.42, 0.2], emissive: [0.18, 0.14, 0.05] },
  npcDoctor: { color: [0.22, 0.45, 0.32], emissive: [0.06, 0.16, 0.1] },
};
