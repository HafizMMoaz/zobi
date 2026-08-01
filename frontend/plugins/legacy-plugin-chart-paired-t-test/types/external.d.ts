declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module 'distributions' {
  class Studentt {
    constructor(degreesOfFreedom: number);
    cdf(x: number): number;
  }
  const dist: {
    Studentt: typeof Studentt;
  };
  export default dist;
}

declare module 'reactable' {
  import { ComponentType, ReactNode } from 'react';

  interface TableProps {
    className?: string;
    id?: string;
    sortable?: (
      | string
      | {
          column: string;
          sortFunction: (a: string, b: string) => number;
        }
    )[];
    children?: ReactNode;
  }

  interface TrProps {
    className?: string;
    onClick?: () => void;
    children?: ReactNode;
  }

  interface TdProps {
    className?: string;
    column?: string;
    data?: string | number | boolean;
    children?: ReactNode;
  }

  interface ThProps {
    column?: string;
    children?: ReactNode;
  }

  interface TheadProps {
    children?: ReactNode;
  }

  export const Table: ComponentType<TableProps>;
  export const Tr: ComponentType<TrProps>;
  export const Td: ComponentType<TdProps>;
  export const Th: ComponentType<ThProps>;
  export const Thead: ComponentType<TheadProps>;
}
