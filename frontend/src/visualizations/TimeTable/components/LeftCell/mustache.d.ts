declare module 'mustache' {
  interface MustacheStatic {
    render(template: string, view: any, partials?: any, config?: any): string;
  }
  const Mustache: MustacheStatic;
  export = Mustache;
}
