import type { CollectionConfig } from 'payload'
import { tenantAccess, franchiseFieldAccess } from '@/access/tenantAccess'

export const ReviewQueue: CollectionConfig = {
  slug: 'review-queue',
  labels: {
    singular: 'Review Queue Item',
    plural: 'Review Queue',
  },
  admin: {
    useAsTitle: 'targetCollection',
    defaultColumns: ['targetCollection', 'action', 'status', 'submittedAt', 'franchise'],
    group: 'System',
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
      admin: {
        description: 'Franchise this review item belongs to',
      },
      access: {
        update: franchiseFieldAccess,
      },
    },
    {
      name: 'targetCollection',
      type: 'select',
      required: true,
      label: 'Target Collection',
      options: [
        { label: 'Articles', value: 'articles' },
        { label: 'Businesses', value: 'businesses' },
        { label: 'Jobs', value: 'jobs' },
        { label: 'Obituaries', value: 'obituaries' },
        { label: 'Real Estate', value: 'real-estate' },
        { label: 'Events', value: 'events' },
      ],
      admin: {
        description: 'Which collection this review item targets',
      },
    },
    {
      name: 'targetId',
      type: 'text',
      required: true,
      label: 'Target ID',
      admin: {
        description: 'ID of the target record (if existing) or empty for new records',
      },
    },
    {
      name: 'action',
      type: 'select',
      required: true,
      options: [
        { label: 'Create', value: 'create' },
        { label: 'Update', value: 'update' },
        { label: 'Delete', value: 'delete' },
        { label: 'Merge', value: 'merge' },
      ],
      admin: {
        description: 'What action to take on the target record',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Auto-Approved', value: 'auto-approved' },
      ],
    },
    {
      name: 'data',
      type: 'json',
      label: 'Proposed Data',
      admin: {
        description: 'JSON data representing the proposed changes',
      },
    },
    {
      name: 'source',
      type: 'relationship',
      relationTo: 'ingestion-sources',
      admin: {
        description: 'Ingestion source that generated this review item',
      },
    },
    {
      name: 'ingestionRun',
      type: 'relationship',
      relationTo: 'ingestion-runs',
      label: 'Ingestion Run',
      admin: {
        description: 'The specific ingestion run that created this item',
      },
    },
    {
      name: 'submittedAt',
      type: 'date',
      label: 'Submitted At',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'reviewedAt',
      type: 'date',
      label: 'Reviewed At',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'reviewedBy',
      type: 'relationship',
      relationTo: 'users',
      label: 'Reviewed By',
      admin: {
        description: 'User who reviewed this item',
      },
    },
    {
      name: 'reviewNotes',
      type: 'textarea',
      label: 'Review Notes',
      admin: {
        description: 'Notes from the reviewer about the decision',
      },
    },
  ],
}

export default ReviewQueue
