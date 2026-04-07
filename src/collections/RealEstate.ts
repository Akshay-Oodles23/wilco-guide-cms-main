import type { CollectionConfig } from 'payload'
import { tenantAccess, franchiseFieldAccess } from '@/access/tenantAccess'
import { provenanceFields } from './fields/provenance'

export const RealEstate: CollectionConfig = {
  slug: 'real-estate',
  labels: {
    singular: 'Real Estate Listing',
    plural: 'Real Estate Listings',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'city', 'price', 'propertyType', 'status', 'franchise'],
    group: 'Content',
    listSearchableFields: ['title', 'slug', 'mlsNumber'],
  },
  access: {
    read: tenantAccess.read,
    create: tenantAccess.create,
    update: tenantAccess.update,
    delete: tenantAccess.delete,
  },
  timestamps: true,
  fields: [
    {
      name: 'franchise',
      type: 'relationship',
      relationTo: 'franchises',
      required: true,
      index: true,
      access: {
        update: franchiseFieldAccess,
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Listing title or address headline',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'mlsNumber',
      type: 'text',
      label: 'MLS Number',
      index: true,
      admin: {
        description: 'MLS listing number for deduplication',
      },
    },
    {
      name: 'propertyType',
      type: 'select',
      label: 'Property Type',
      required: true,
      options: [
        { label: 'Single Family', value: 'single-family' },
        { label: 'Condo/Townhome', value: 'condo-townhome' },
        { label: 'Multi-Family', value: 'multi-family' },
        { label: 'Land', value: 'land' },
        { label: 'Commercial', value: 'commercial' },
      ],
    },
    {
      name: 'listingType',
      type: 'select',
      label: 'Listing Type',
      required: true,
      options: [
        { label: 'For Sale', value: 'for-sale' },
        { label: 'For Rent', value: 'for-rent' },
        { label: 'Sold', value: 'sold' },
        { label: 'Pending', value: 'pending' },
      ],
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      admin: {
        description: 'Listing price in dollars',
      },
    },
    {
      name: 'address',
      type: 'group',
      label: 'Address',
      fields: [
        { name: 'street', type: 'text', label: 'Street Address' },
        { name: 'city', type: 'text', label: 'City' },
        { name: 'state', type: 'text', label: 'State', defaultValue: 'TX' },
        { name: 'zip', type: 'text', label: 'ZIP Code' },
        { name: 'neighborhood', type: 'text', label: 'Neighborhood/Subdivision' },
        { name: 'lat', type: 'number', label: 'Latitude', admin: { step: 0.000001 } },
        { name: 'lng', type: 'number', label: 'Longitude', admin: { step: 0.000001 } },
      ],
    },
    {
      name: 'details',
      type: 'group',
      label: 'Property Details',
      fields: [
        { name: 'bedrooms', type: 'number', label: 'Bedrooms' },
        { name: 'bathrooms', type: 'number', label: 'Bathrooms', admin: { step: 0.5 } },
        { name: 'sqft', type: 'number', label: 'Square Feet' },
        { name: 'lotSize', type: 'number', label: 'Lot Size (acres)', admin: { step: 0.01 } },
        { name: 'yearBuilt', type: 'number', label: 'Year Built' },
        { name: 'garage', type: 'number', label: 'Garage Spaces' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Property description',
      },
    },
    {
      name: 'photos',
      type: 'array',
      label: 'Photos',
      maxRows: 20,
      fields: [
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'agent',
      type: 'group',
      label: 'Listing Agent',
      fields: [
        { name: 'name', type: 'text', label: 'Agent Name' },
        { name: 'phone', type: 'text', label: 'Agent Phone' },
        { name: 'email', type: 'email', label: 'Agent Email' },
        { name: 'company', type: 'text', label: 'Brokerage' },
      ],
    },
    {
      name: 'city',
      type: 'select',
      options: [
        { label: 'Georgetown', value: 'georgetown' },
        { label: 'Round Rock', value: 'round-rock' },
        { label: 'Cedar Park', value: 'cedar-park' },
        { label: 'Leander', value: 'leander' },
        { label: 'Liberty Hill', value: 'liberty-hill' },
        { label: 'Hutto', value: 'hutto' },
        { label: 'Taylor', value: 'taylor' },
        { label: 'Jarrell', value: 'jarrell' },
        { label: 'Florence', value: 'florence' },
      ],
      admin: {
        description: 'City for filtering',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Pending', value: 'pending' },
        { label: 'Sold', value: 'sold' },
        { label: 'Expired', value: 'expired' },
      ],
    },
    {
      name: 'listedAt',
      type: 'date',
      label: 'Listed At',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    ...provenanceFields([
      { label: 'Manual', value: 'manual' },
      { label: 'MLS Feed', value: 'mls-feed' },
      { label: 'Zillow API', value: 'zillow-api' },
      { label: 'Realtor API', value: 'realtor-api' },
      { label: 'CSV Import', value: 'csv-import' },
    ]),
  ],
}

export default RealEstate
