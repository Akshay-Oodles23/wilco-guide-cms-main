import type { CollectionConfig } from 'payload'
import { tenantAccess, franchiseFieldAccess } from '@/access/tenantAccess'

export const Deals: CollectionConfig = {
  slug: 'deals',
  labels: {
    singular: 'Deal',
    plural: 'Deals',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'business', 'dealType', 'startsAt', 'expiresAt', 'status', 'franchise'],
    group: 'Content',
    listSearchableFields: ['title', 'slug'],
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
        description: 'Deal headline (e.g., "20% Off All Entrees")',
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
      name: 'business',
      type: 'relationship',
      relationTo: 'businesses',
      required: true,
      admin: {
        description: 'Business offering this deal',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Full deal description and terms',
      },
    },
    {
      name: 'dealType',
      type: 'select',
      label: 'Deal Type',
      required: true,
      options: [
        { label: 'Percentage Off', value: 'percentage-off' },
        { label: 'Dollar Off', value: 'dollar-off' },
        { label: 'BOGO', value: 'bogo' },
        { label: 'Free Item', value: 'free-item' },
        { label: 'Special Offer', value: 'special-offer' },
      ],
    },
    {
      name: 'discountValue',
      type: 'text',
      label: 'Discount Value',
      admin: {
        description: 'e.g., "20%", "$10 off", "Buy 1 Get 1 Free"',
      },
    },
    {
      name: 'couponCode',
      type: 'text',
      label: 'Coupon Code',
      admin: {
        description: 'Promo code (if applicable)',
      },
    },
    {
      name: 'redeemUrl',
      type: 'text',
      label: 'Redeem URL',
      admin: {
        description: 'External URL to redeem the deal online',
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
      options: [
        { label: 'Food & Drink', value: 'food-drink' },
        { label: 'Shopping', value: 'shopping' },
        { label: 'Services', value: 'services' },
        { label: 'Health & Beauty', value: 'health-beauty' },
        { label: 'Entertainment', value: 'entertainment' },
        { label: 'Home & Garden', value: 'home-garden' },
        { label: 'Other', value: 'other' },
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
    },
    {
      name: 'startsAt',
      type: 'date',
      label: 'Starts At',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description: 'When the deal becomes active',
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      label: 'Expires At',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description: 'When the deal expires',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'partnerOnly',
      type: 'checkbox',
      label: 'Partner Only',
      defaultValue: false,
      admin: {
        description: 'Only available to partner/partner-pro businesses',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Active', value: 'active' },
        { label: 'Expired', value: 'expired' },
        { label: 'Archived', value: 'archived' },
      ],
    },
  ],
}

export default Deals
