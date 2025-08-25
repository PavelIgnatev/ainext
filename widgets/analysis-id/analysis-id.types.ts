export type MessagePositionInGroup = 'single' | 'top' | 'middle' | 'bottom';

export interface BaseMessage {
  id: number;
  text: string;
  fromId: string;
  positionInGroup?: MessagePositionInGroup;
  think?: string | null;
}
