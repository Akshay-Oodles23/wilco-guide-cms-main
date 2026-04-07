import path from 'path'
import fs from 'fs'

const SENIORS_DATA_DIR = path.join(process.cwd(), 'src', 'data', 'seniors')

let guides: any[] | null = null

function loadGuides(): any[] {
  if (!guides) {
    const filePath = path.join(SENIORS_DATA_DIR, 'guides.json')
    const fileContents = fs.readFileSync(filePath, 'utf8')
    guides = JSON.parse(fileContents)
  }
  return guides || []
}

export function getGuides() {
  return loadGuides()
}

export function getGuideBySlug(slug: string) {
  const all = loadGuides()
  return all.find((g: any) => g.slug === slug)
}
