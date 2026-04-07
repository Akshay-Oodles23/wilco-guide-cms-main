import type { CollectionConfig } from 'payload'
import { tenantAccess, franchiseFieldAccess } from '@/access/tenantAccess'

export const IngestionRuns: CollectionConfig = {
  slug: 'ingestion-runs',
  labels: {
    singular: 'Ingestion Run',
    plural: 'Ingestion Runs',
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['source', 'franchise', 'status', 'startedAt', 'completedAt'],
    group: 'System',
  },
  access: {
    read: tenantAccess.read,
    create: ({ req }) => req.user?.role === 'super-admin',
    update: ({ req }) => req.user?.role === 'super-admin',
    delete: ({ req }) => req.user?.role === 'super-admin',
  },
  timestamps: true,
  fields: [
    {
      name: 'franchise',
      type: 'relationship',
      relationTo: 'franchises',
      required: true,
      index: true,
      admin: {
        description: 'Franchise this ingestion run belongs to',
      },
      access: {
        update: franchiseFieldAccess,
      },
    },
    {
      name: 'source',
      type: 'relationship',
      relationTo: 'ingestion-sources',
      required: true,
      admin: {
        description: 'The ingestion source that triggered this run',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'running',
      options: [
        { label: 'Running', value: 'running' },
        { label: 'Success', value: 'success' },
        { label: 'Partial', value: 'partial' },
        { label: 'Failed', value: 'failed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    {
      name: 'startedAt',
      type: 'date',
      label: 'Started At',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      label: 'Completed At',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'counts',
      type: 'group',
      label: 'Record Counts',
      fields: [
        {
          name: 'recordsFound',
          type: 'number',
          label: 'Records Found',
          defaultValue: 0,
        },
        {
          name: 'recordsCreated',
          type: 'number',
          label: 'Records Created',
          defaultValue: 0,
        },
        {
          name: 'recordsUpdated',
          type: 'number',
          label: 'Records Updated',
          defaultValue: 0,
        },
        {
          name: 'recordsSkipped',
          type: 'number',
          label: 'Records Skipped',
          defaultValue: 0,
        },
        {
          name: 'recordsErrored',
          type: 'number',
          label: 'Records Errored',
          defaultValue: 0,
        },
      ],
    },
    {
      name: 'errorLog',
      type: 'textarea',
      label: 'Error Log',
      admin: {
        description: 'Detailed error log from the run',
      },
    },
  ],
}

export default IngestionRuns
