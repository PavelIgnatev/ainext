import { ObjectId } from 'mongodb';

export type GroupIdUsers = {
  _id: ObjectId;
  g: string;
  u: string;
  c?: number;
  s?: boolean;
  f?: boolean;
  r?: string;
  p?: Date | null;
};
