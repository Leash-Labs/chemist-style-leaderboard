export const pct = (x: number) => (isFinite(x) ? (100 * x).toFixed(1) + '%' : '—')
export const num = (x: number) => new Intl.NumberFormat().format(x)
export const bits = (x: number) => (isFinite(x) ? x.toFixed(2) + ' bits' : '—')
export const score = (x: number) => (isFinite(x) ? x.toFixed(3) : '—')
