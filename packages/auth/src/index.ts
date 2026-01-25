import { AbilityBuilder, type CreateAbility, createMongoAbility, type MongoAbility } from '@casl/ability'
import z from 'zod'
import type { User } from './models/user'
import { permissions } from './permissions'
import { billingSubjectSchema } from './subjects/billing'
import { inviteSubjectSchema } from './subjects/invite'
import { organizationSubjectSchema } from './subjects/organization'
import { projectSubjectSchema } from './subjects/project'
import { userSubjectSchema } from './subjects/user'

export * from './models/organization'
export * from './models/project'
export * from './models/user'
export * from './roles'

const appAbilitiesSchema = z.union([
  projectSubjectSchema,
  billingSubjectSchema,
  inviteSubjectSchema,
  organizationSubjectSchema,
  userSubjectSchema,
  z.tuple([z.literal('manage'), z.literal('all')]),
])

export type AppAbilities = z.infer<typeof appAbilitiesSchema>

export type AppAbility = MongoAbility<AppAbilities>
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>

export function defineAbilityFor(user: User) {
  const builder = new AbilityBuilder(createAppAbility)

  if (typeof permissions[user.role] !== 'function') throw new Error(`Permissions for role ${user.role} are not found.`)

  permissions[user.role](user, builder)

  return builder.build({
    detectSubjectType(subject) {
      return subject.__typename
    },
  })
}
