import DOMPurify from 'dompurify';

type Props = {
  title?: string;
  body?: string;
  footer?: string;
};

export function getTooltipHTML({ title, body, footer }: Props): string {
  const html = `
    <div class="tooltip-detail">
      ${title ? `<div class="tooltip-detail-title">${title}</div>` : ''}
      ${body ? `<div class="tooltip-detail-body">${body}</div>` : ''}
      ${footer ? `<div class="tooltip-detail-footer">${footer}</div>` : ''}
    </div>
  `;
  return DOMPurify.sanitize(html);
}
