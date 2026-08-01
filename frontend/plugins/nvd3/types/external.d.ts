declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module 'd3' {
  const d3: Record<string, unknown>;
  export default d3;
}

declare module 'nvd3-fork' {
  const nv: Record<string, unknown>;
  export default nv;
}

declare module 'nvd3-fork/build/nv.d3.css';

declare module 'd3-tip' {
  const d3tip: () => Record<string, unknown>;
  export default d3tip;
}
