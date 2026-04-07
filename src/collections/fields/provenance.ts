import type { Field } from 'payload'

export type ProvenanceSourceType =
  | 'manual'
  | 'beehiiv-api'
  | 'beehiiv-rss'
  | 'scraper'
  | 'outscraper'
  | 'google-api'
  | 'csv-import'
  | 'adzuna-api'
  | 'partner-submitted'
  | 'legacy-obit-scraper'
  | 'funeral-home-api'
  | 'mls-feed'
  | 'zillow-api'
  | 'realtor-api'
  | 'eventbrite-api'
  | 'facebook-events'
  | 'community-submitted'

export const provenanceFields = (
  sourceOptions: { label: string; value: string }[],
): Field[] => [
  {
    name: 'provenance',
    type: 'group',
    label: 'Provenance / Data Source',
    admin: {
      condition: (data, siblingData, { user }) => {
        // Always show for admins, collapsed for others
        return true
      },
    },
    fields: [
      {
        name: 'source',
        type: 'select',
        options: sourceOptions,
        defaultValue: 'manual',
        admin: {
          description: 'Where this record originated from',
        },
      },
      {
        name: 'sourceUrl',
        type: 'text',
        label: 'Source URL',
        admin: {
          description: 'Original URL of the source content',
        },
      },
      {
        name: 'sourceId',
        type: 'text',
        label: 'Source ID',
        index: true,
        admin: {
          description: 'Unique ID from the source system for deduplication',
        },
      },
      {
        name: 'ingestedAt',
        type: 'date',
        label: 'Ingested At',
        admin: {
          date: {
            pickerAppearance: 'dayAndTime',
          },
          description: 'When this record was last ingested/synced',
        },
      },
      {
        name: 'syncStatus',
        type: 'select',
        label: 'Sync Status',
        defaultValue: 'manual',
        options: [
          { label: 'Synced', value: 'synced' },
          { label: 'Stale', value: 'stale' },
          { label: 'Conflict', value: 'conflict' },
          { label: 'Manual', value: 'manual' },
        ],
      },
    ],
  },
]
