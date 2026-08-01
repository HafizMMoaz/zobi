import { t } from '@zobi.dev/extension-api/translation';
import { sanitizeHtml } from './html';

const TRUNCATION_STYLE = `
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export function tooltipHtml(
  data: string[][],
  title?: string,
  focusedRow?: number,
) {
  const titleRow = title
    ? `<span style="font-weight: 700;${TRUNCATION_STYLE}">${title}</span>`
    : '';
  return sanitizeHtml(`
    <div>
      ${titleRow}
      <table>
          ${data.length === 0 ? `<tr><td>${t('No data')}</td></tr>` : ''}
          ${data
            .map((row, i) => {
              const rowStyle =
                i === focusedRow ? 'font-weight: 700;' : 'opacity: 0.8;';
              const cells = row.map((cell, j) => {
                const cellStyle = `
                  text-align: ${j > 0 ? 'right' : 'left'};
                  padding-left: ${j === 0 ? 0 : 16}px;
                  ${TRUNCATION_STYLE}
                `;
                return `<td style="${cellStyle}">${cell}</td>`;
              });
              return `<tr style="${rowStyle}">${cells.join('')}</tr>`;
            })
            .join('')}
      </table>
    </div>`);
}
