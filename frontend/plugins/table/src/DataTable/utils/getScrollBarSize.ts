let cached: number | undefined;

const css = (x: TemplateStringsArray) => x.join('\n');

export default function getScrollBarSize(forceRefresh = false) {
  if (typeof document === 'undefined') {
    return 0;
  }
  if (cached === undefined || forceRefresh) {
    const inner = document.createElement('div');
    const outer = document.createElement('div');
    inner.style.cssText = css`
      width: auto;
      height: 100%;
      overflow: scroll;
    `;
    outer.style.cssText = css`
      position: absolute;
      visibility: hidden;
      overflow: hidden;
      width: 100px;
      height: 50px;
    `;
    outer.append(inner);
    document.body.append(outer);
    cached = outer.clientWidth - inner.clientWidth;
    outer.remove();
  }
  return cached;
}
