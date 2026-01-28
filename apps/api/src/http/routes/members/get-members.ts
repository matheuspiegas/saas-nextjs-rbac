import { roleSchema } from '@saas/auth'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getMembers(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug/members',
      {
        schema: {
          tags: ['members'],
          summary: 'Get all organization members',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              members: z.array(
                z.object({
                  userId: z.uuid(),
                  id: z.uuid(),
                  role: roleSchema,
                  name: z.string().nullable(),
                  avatarUrl: z.url().nullable(),
                  email: z.email(),
                })
              ),
            }),
          },
        },
      },
      async (req, reply) => {
        const userId = await req.getCurrentUserId()
        const { slug } = req.params
        const { membership, organization } = await req.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'User')) {
          throw new UnauthorizedError("You're not allowed to see organization members.")
        }

        const members = await prisma.member.findMany({
          where: {
            organizationId: organization.id,
          },
          select: {
            id: true,
            role: true,
            user: {
              select: {
                name: true,
                id: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            role: 'asc',
          },
        })

        const membersWithRoles = members.map(({ user: { id: userId, ...user }, ...member }) => ({
          ...user,
          ...member,
          userId,
        }))

        reply.status(200).send({ members: membersWithRoles })
      }
    )
}
