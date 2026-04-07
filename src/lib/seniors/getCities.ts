import path from 'path'
import fs from 'fs'

const SENIORS_DATA_DIR = path.join(process.cwd(), 'src', 'data', 'seniors')

let cities: any[] | null = null

function loadCities(): any[] {
  if (!cities) {
    const filePath = path.join(SENIORS_DATA_DIR, 'cities.json')
    const fileContents = fs.readFileSync(filePath, 'utf8')
    cities = JSON.parse(fileContents)
  }
  return cities
}

export function getCities() {
  return loadCities()
}

export function getCityBySlug(slug: string) {
  const all = loadCities()
  return all.find((c: any) => c.slug === slug)
}
