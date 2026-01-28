import { defineAbilityFor, type Role, userModelSchema } from '@saas/auth'

export function getUserPermissions(userId: string, role: Role) {
  const authUser = userModelSchema.parse({
    id: userId,
    role: role,
  })

  return defineAbilityFor(authUser)
}
