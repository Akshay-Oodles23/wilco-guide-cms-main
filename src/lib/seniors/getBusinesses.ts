import path from 'path'
import fs from 'fs'

const SENIORS_DATA_DIR = path.join(process.cwd(), 'src', 'data', 'seniors')

let businesses: any[] | null = null

function loadBusinesses(): any[] {
  if (!businesses) {
    const filePath = path.join(SENIORS_DATA_DIR, 'businesses.json')
    const fileContents = fs.readFileSync(filePath, 'utf8')
    businesses = JSON.parse(fileContents)
  }
  return businesses
}

export function getBusinesses() {
  return loadBusinesses()
}

export function getBusinessesByCategory(categorySlug: string) {
  const all = loadBusinesses()
  return all.filter((b: any) => b.category === categorySlug)
}

export function getBusinessesByCity(citySlug: string) {
  const all = loadBusinesses()
  return all.filter((b: any) => b.citySlug === citySlug)
}

export function getBusinessesByCityAndCategory(citySlug: string, categorySlug: string) {
  const all = loadBusinesses()
  return all.filter(
    (b: any) => b.citySlug === citySlug && b.category === categorySlug
  )
}

export function getBusinessBySlug(slug: string) {
  const all = loadBusinesses()
  return all.find((b: any) => b.slug === slug)
}

export function getFeaturedBusinesses() {
  const all = loadBusinesses()
  return all.filter((b: any) => b.featured === true)
}

export function getRelatedBusinesses(business: any, limit = 4) {
  const all = loadBusinesses()
  return all
    .filter(
      (b: any) => b.category === business.category && b.slug !== business.slug
    )
    .slice(0, limit)
}
