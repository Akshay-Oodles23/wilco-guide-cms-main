import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { tenantAccess, franchiseFieldAccess } from '@/access/tenantAccess'
import { provenanceFields } from './fields/provenance'

export const Events: CollectionConfig = {
  slug: 'events',
  labels: {
    singular: 'Event',
    plural: 'Events',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'city', 'startDate', 'status', 'franchise'],
    group: 'Content',
    listSearchableFields: ['title', 'slug', 'venueName'],
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
        description: 'Event name',
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
      name: 'description',
      type: 'richText',
      editor: lexicalEditor({}),
      admin: {
        description: 'Full event description',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 280,
      admin: {
        description: 'Short summary for cards and previews',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Featured Image',
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Community', value: 'community' },
        { label: 'Music & Arts', value: 'music-arts' },
        { label: 'Food & Drink', value: 'food-drink' },
        { label: 'Sports & Fitness', value: 'sports-fitness' },
        { label: 'Family & Kids', value: 'family-kids' },
        { label: 'Education', value: 'education' },
        { label: 'Business & Networking', value: 'business-networking' },
        { label: 'Holiday & Seasonal', value: 'holiday-seasonal' },
        { label: 'Charity & Fundraiser', value: 'charity-fundraiser' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      label: 'Start Date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'endDate',
      type: 'date',
      label: 'End Date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'isAllDay',
      type: 'checkbox',
      label: 'All Day Event',
      defaultValue: false,
    },
    {
      name: 'isRecurring',
      type: 'checkbox',
      label: 'Recurring Event',
      defaultValue: false,
    },
    {
      name: 'recurrenceRule',
      type: 'text',
      label: 'Recurrence Rule',
      admin: {
        description: 'iCal RRULE string for recurring events',
        condition: (data) => data?.isRecurring,
      },
    },
    {
      name: 'venueName',
      type: 'text',
      label: 'Venue Name',
    },
    {
      name: 'venueAddress',
      type: 'group',
      label: 'Venue Address',
      fields: [
        { name: 'street', type: 'text', label: 'Street' },
        { name: 'city', type: 'text', label: 'City' },
        { name: 'state', type: 'text', label: 'State', defaultValue: 'TX' },
        { name: 'zip', type: 'text', label: 'ZIP' },
        { name: 'lat', type: 'number', label: 'Latitude', admin: { step: 0.000001 } },
        { name: 'lng', type: 'number', label: 'Longitude', admin: { step: 0.000001 } },
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
      name: 'business',
      type: 'relationship',
      relationTo: 'businesses',
      admin: {
        description: 'Associated business (if applicable)',
      },
    },
    {
      name: 'ticketUrl',
      type: 'text',
      label: 'Ticket URL',
      admin: {
        description: 'External link to purchase tickets',
      },
    },
    {
      name: 'price',
      type: 'text',
      admin: {
        description: 'Price or price range (e.g., "Free", "$10-$25")',
      },
    },
    {
      name: 'organizer',
      type: 'text',
      label: 'Organizer',
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
      defaultValue: 'published',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      name: 'externalEventId',
      type: 'text',
      label: 'External Event ID',
      index: true,
      admin: {
        description: 'External ID for deduplication (Eventbrite, Facebook, etc.)',
      },
    },
    ...provenanceFields([
      { label: 'Manual', value: 'manual' },
      { label: 'Eventbrite API', value: 'eventbrite-api' },
      { label: 'Facebook Events', value: 'facebook-events' },
      { label: 'Community Submitted', value: 'community-submitted' },
      { label: 'CSV Import', value: 'csv-import' },
    ]),
  ],
}

export default Events
