/** 游戏层投影后的屏幕百分比坐标，UI 不读取 3D 实体。 */
export interface ObjectiveMarkerView {
  id: string;
  label: string;
  x: number;
  y: number;
  distance: number;
  direction: 'onscreen' | 'left' | 'right' | 'up' | 'down' | 'behind';
}
