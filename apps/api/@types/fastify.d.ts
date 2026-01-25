import fastify from 'fastify'
import type { Member, Organization } from '@/generated/prisma/client'

declare module 'fastify' {
  export interface FastifyRequest {
    getCurrentUserId(): Promise<string>
    getUserMembership(slug: string): Promise<{ organization: Organization; membership: Member }>
  }
}
