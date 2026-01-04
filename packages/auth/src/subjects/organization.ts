import z from 'zod'
import { organizationModelSchema } from '../models/organization'

export const organizationSubjectSchema = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('update'),
    z.literal('create'),
    z.literal('delete'),
    z.literal('transfer_ownsership'),
  ]),
  z.union([z.literal('Organization'), organizationModelSchema]),
])

export type OrganizationSubject = z.infer<typeof organizationSubjectSchema>
