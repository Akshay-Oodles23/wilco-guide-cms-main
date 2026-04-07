import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { tenantAccess, franchiseFieldAccess } from '@/access/tenantAccess'
import { provenanceFields } from './fields/provenance'

export const Obituaries: CollectionConfig = {
  slug: 'obituaries',
  labels: {
    singular: 'Obituary',
    plural: 'Obituaries',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'city', 'dateOfDeath', 'status', 'franchise'],
    group: 'Content',
    listSearchableFields: ['name', 'slug'],
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
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Full name of the deceased',
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
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Photo',
    },
    {
      name: 'dateOfBirth',
      type: 'date',
      label: 'Date of Birth',
    },
    {
      name: 'dateOfDeath',
      type: 'date',
      label: 'Date of Death',
      required: true,
    },
    {
      name: 'age',
      type: 'number',
      label: 'Age',
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
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({}),
      admin: {
        description: 'Full obituary text',
      },
    },
    {
      name: 'funeralHome',
      type: 'text',
      label: 'Funeral Home',
    },
    {
      name: 'serviceDetails',
      type: 'group',
      label: 'Service Details',
      fields: [
        {
          name: 'visitation',
          type: 'group',
          label: 'Visitation',
          fields: [
            { name: 'date', type: 'date', label: 'Date' },
            { name: 'time', type: 'text', label: 'Time' },
            { name: 'location', type: 'text', label: 'Location' },
          ],
        },
        {
          name: 'funeral',
          type: 'group',
          label: 'Funeral Service',
          fields: [
            { name: 'date', type: 'date', label: 'Date' },
            { name: 'time', type: 'text', label: 'Time' },
            { name: 'location', type: 'text', label: 'Location' },
          ],
        },
        {
          name: 'burial',
          type: 'group',
          label: 'Burial',
          fields: [
            { name: 'date', type: 'date', label: 'Date' },
            { name: 'location', type: 'text', label: 'Location' },
          ],
        },
      ],
    },
    {
      name: 'condolenceUrl',
      type: 'text',
      label: 'Condolence URL',
      admin: {
        description: 'External link for sending condolences',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'published',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Published At',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    ...provenanceFields([
      { label: 'Manual', value: 'manual' },
      { label: 'Legacy Obit Scraper', value: 'legacy-obit-scraper' },
      { label: 'Funeral Home API', value: 'funeral-home-api' },
      { label: 'CSV Import', value: 'csv-import' },
    ]),
  ],
}

export default Obituaries
