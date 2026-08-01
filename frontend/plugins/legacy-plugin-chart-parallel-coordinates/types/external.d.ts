
declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module 'd3v3' {
  const d3: Record<string, Function>;
  export = d3;
}
