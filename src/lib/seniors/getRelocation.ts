import path from 'path'
import fs from 'fs'

const SENIORS_DATA_DIR = path.join(process.cwd(), 'src', 'data', 'seniors')

let relocationData: any = null

function loadRelocation() {
  if (!relocationData) {
    const filePath = path.join(SENIORS_DATA_DIR, 'relocation.json')
    const fileContents = fs.readFileSync(filePath, 'utf8')
    relocationData = JSON.parse(fileContents)
  }
  return relocationData
}

export function getRelocationHub() {
  return loadRelocation().hub
}

export function getRelocationCity(citySlug: string) {
  return loadRelocation().cities[citySlug] || null
}

export function getRelocationCitySlugs() {
  return Object.keys(loadRelocation().cities)
}

export function getRelocationCities() {
  const cities = loadRelocation().cities
  return Object.entries(cities).map(([slug, data]: [string, any]) => ({ ...data, slug }))
}

export function getRelocationComparison() {
  return loadRelocation().comparison
}
