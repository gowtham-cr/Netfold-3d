/**
 * Neutralizes leading formula characters in CSV cells so exported sheets are safe in Excel/Sheets,
 * and properly quotes commas, quotes, and newlines per RFC 4180.
 */
export function escapeCsvCell(value) {
  if (value === null || value === undefined) return ''
  let str = String(value)
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`
  }
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Serializes chart rows into a clean UTF-8 CSV string with headers.
 */
export function buildCsvString(columns, rows) {
  const safeCols = Array.isArray(columns) ? columns : []
  const safeRows = Array.isArray(rows) ? rows : []
  const headerLine = safeCols.map((c) => escapeCsvCell(c.label)).join(',')
  const bodyLines = safeRows.map((row) =>
    safeCols.map((c) => escapeCsvCell(row?.[c.key])).join(','),
  )
  return [headerLine, ...bodyLines].join('\n')
}

/**
 * Triggers a browser CSV file download with UTF-8 BOM for proper Indic/Unicode rendering in Excel.
 */
export function downloadCsvFile(filename, columns, rows) {
  const csvContent = `\uFEFF${buildCsvString(columns, rows)}`
  if (typeof document === 'undefined' || typeof Blob === 'undefined') {
    return csvContent
  }
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.setTimeout(() => URL.revokeObjectURL(url), 500)
  return csvContent
}

/**
 * Renders any interactive chart <svg> element cleanly onto a 2x HiDPI Canvas and downloads PNG.
 * Falls back cleanly with false if Canvas/DOM is unavailable.
 */
export async function downloadSvgAsPng(svgElement, filename, backgroundColor = '#ffffff') {
  if (
    !svgElement ||
    typeof document === 'undefined' ||
    typeof XMLSerializer === 'undefined' ||
    typeof URL === 'undefined'
  ) {
    return false
  }
  try {
    const viewBox = svgElement.viewBox?.baseVal
    const width = viewBox && viewBox.width > 0 ? viewBox.width : svgElement.clientWidth || 520
    const height = viewBox && viewBox.height > 0 ? viewBox.height : svgElement.clientHeight || 260

    const cloned = svgElement.cloneNode(true)
    cloned.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    cloned.setAttribute('width', String(width))
    cloned.setAttribute('height', String(height))

    const svgString = new XMLSerializer().serializeToString(cloned)
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const svgUrl = URL.createObjectURL(blob)

    return await new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const scale = 2
        const canvas = document.createElement('canvas')
        canvas.width = width * scale
        canvas.height = height * scale
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          URL.revokeObjectURL(svgUrl)
          resolve(false)
          return
        }
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.scale(scale, scale)
        ctx.drawImage(img, 0, 0, width, height)

        const pngUrl = canvas.toDataURL('image/png')
        const a = document.createElement('a')
        a.href = pngUrl
        a.download = filename.endsWith('.png') ? filename : `${filename}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(svgUrl)
        resolve(true)
      }
      img.onerror = () => {
        URL.revokeObjectURL(svgUrl)
        resolve(false)
      }
      img.src = svgUrl
    })
  } catch {
    return false
  }
}
