import z from 'zod'
import { roleSchema } from '../roles'

export const userModelSchema = z.object({
  id: z.string(),
  role: roleSchema,
})

export type User = z.infer<typeof userModelSchema>
