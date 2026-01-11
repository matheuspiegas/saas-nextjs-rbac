import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '@/lib/prisma'
import { BadRequestError } from '../_errors/bad-request-error'

export async function getProfile(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/profile',
    {
      schema: {
        summary: 'Get authenticated user profile',
        tags: ['Auth'],
        response: {
          200: z.object({
            user: z.object({
              id: z.uuid(),
              email: z.email(),
              name: z.string().nullable(),
              avatarUrl: z.url().nullable(),
            }),
          }),
          400: z.undefined(),
        },
      },
    },
    async (req, reply) => {
      const { sub } = await req.jwtVerify<{ sub: string }>()
      const user = await prisma.user.findUnique({
        where: { id: sub },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      })

      if (!user) {
        throw new BadRequestError('User not found')
      }

      return reply.send({ user })
    }
  )
}
