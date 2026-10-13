import { describe, expect, it } from 'vitest'
import { createCsv, csvCell } from './csv'

describe('CSV export', () => {
  it('escapes commas, quotes and multiline task text', () => expect(csvCell('one,"two"\nthree')).toBe('"one,""two""\nthree"'))
  it.each(['=HYPERLINK("evil")', ' +1', '-1+2', '@SUM(A1)'])('neutralizes spreadsheet formula %s', value => expect(csvCell(value)).toBe(`"'${value.replace(/"/g, '""')}"`))
  it('preserves Vietnamese text with a UTF-8 BOM', () => expect(createCsv([['Chiến dịch', 'Hồ sơ'], ['FungoLabs', null]])).toBe('\ufeff"Chiến dịch","Hồ sơ"\r\n"FungoLabs",""'))
})
