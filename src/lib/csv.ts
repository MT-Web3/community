export function csvCell(value: unknown): string {
  let text = value == null ? '' : String(value)
  // Spreadsheet programs can interpret cells beginning with these characters as formulas.
  if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

export function createCsv(rows: unknown[][]): string {
  return '\ufeff' + rows.map(row => row.map(csvCell).join(',')).join('\r\n')
}

export function downloadCsv(filename: string, rows: unknown[][]) {
  const url = URL.createObjectURL(new Blob([createCsv(rows)], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url; link.download = filename
  document.body.appendChild(link); link.click(); link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
