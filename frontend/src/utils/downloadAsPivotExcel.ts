import { utils, writeFile } from 'xlsx';

export default function exportPivotExcel(
  tableSelector: string,
  fileName: string,
) {
  const table = document.querySelector(tableSelector);
  const workbook = utils.table_to_book(table);
  writeFile(workbook, `${fileName}.xlsx`);
}
