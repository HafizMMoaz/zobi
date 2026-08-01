declare module './vendor/parcoords/d3.parcoords' {
  function parcoords(config?: Record<string, unknown>): (
    selection: Element | null,
  ) => Record<string, Function> & {
    width: Function;
    height: Function;
    color: Function;
    alpha: Function;
    composite: Function;
    data: Function;
    dimensions: Function;
    types: Function;
    render: Function;
    createAxes: Function;
    shadows: Function;
    reorderable: Function;
    brushMode: Function;
    highlight: Function;
    unhighlight: Function;
    on: Function;
  };
  export default parcoords;
}

declare module './vendor/parcoords/divgrid' {
  function divgrid(config?: Record<string, unknown>): Function;
  export default divgrid;
}
