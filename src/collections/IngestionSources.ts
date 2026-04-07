import type { CollectionConfig } from 'payload'

export const IngestionSources: CollectionConfig = {
  slug: 'ingestion-sources',
  labels: {
    singular: 'Ingestion Source',
    plural: 'Ingestion Sources',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'franchise', 'enabled', 'lastRunAt', 'lastRunStatus'],
    group: 'System',
  },
  access: {
    read: ({ req }) => req.user?.role === 'super-admin' || req.user?.role === 'franchise-admin',
    create: ({ req }) => req.user?.role === 'super-admin',
    update: ({ req }) => req.user?.role === 'super-admin',
    delete: ({ req }) => req.user?.role === 'super-admin',
  },
  timestamps: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Human-readable name for this ingestion source',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Beehiiv API', value: 'beehiiv-api' },
        { label: 'Beehiiv RSS', value: 'beehiiv-rss' },
        { label: 'Outscraper', value: 'outscraper' },
        { label: 'Google API', value: 'google-api' },
        { label: 'Adzuna API', value: 'adzuna-api' },
        { label: 'CSV Import', value: 'csv-import' },
        { label: 'Scraper', value: 'scraper' },
        { label: 'Legacy Obit Scraper', value: 'legacy-obit-scraper' },
        { label: 'Funeral Home API', value: 'funeral-home-api' },
        { label: 'MLS Feed', value: 'mls-feed' },
        { label: 'Zillow API', value: 'zillow-api' },
        { label: 'Realtor API', value: 'realtor-api' },
        { label: 'Eventbrite API', value: 'eventbrite-api' },
        { label: 'Facebook Events', value: 'facebook-events' },
        { label: 'Community Submitted', value: 'community-submitted' },
        { label: 'Partner Submitted', value: 'partner-submitted' },
      ],
      admin: {
        description: 'Type of ingestion source',
      },
    },
    {
      name: 'franchise',
      type: 'relationship',
      relationTo: 'franchises',
      required: true,
      index: true,
      admin: {
        description: 'Franchise this ingestion source feeds data into',
      },
    },
    {
      name: 'config',
      type: 'json',
      label: 'Configuration',
      admin: {
        description: 'JSON configuration for the ingestion source (API keys, endpoints, filters, etc.)',
      },
    },
    {
      name: 'schedule',
      type: 'text',
      label: 'Schedule',
      admin: {
        description: 'Cron expression for scheduled runs (e.g., "0 */6 * * *" for every 6 hours)',
      },
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this ingestion source is active',
      },
    },
    {
      name: 'lastRunAt',
      type: 'date',
      label: 'Last Run At',
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the last ingestion run occurred',
      },
    },
    {
      name: 'lastRunStatus',
      type: 'select',
      label: 'Last Run Status',
      admin: {
        readOnly: true,
      },
      options: [
        { label: 'Success', value: 'success' },
        { label: 'Partial', value: 'partial' },
        { label: 'Failed', value: 'failed' },
        { label: 'Running', value: 'running' },
      ],
    },
    {
      name: 'recordsLastRun',
      type: 'number',
      label: 'Records Last Run',
      admin: {
        readOnly: true,
        description: 'Number of records processed in the last run',
      },
    },
  ],
}

export default IngestionSources
