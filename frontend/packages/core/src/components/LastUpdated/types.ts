import { MouseEventHandler } from 'react';

export interface LastUpdatedProps {
  updatedAt: string | number | Date | undefined;
  update?: MouseEventHandler<HTMLSpanElement>;
}
