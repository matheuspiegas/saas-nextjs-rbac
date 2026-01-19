import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { BadRequestError } from '../_errors/bad-request-error'

export async function authenticateWithGithub(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/github',
    {
      schema: {
        summary: 'Authenticate with GitHub',
        tags: ['Auth'],
        body: z.object({
          code: z.string(),
        }),
        response: {
          201: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (req, reply) => {
      const { code } = req.body

      const githubOAuthURL = new URL('https://github.com/login/oauth/access_token')
      githubOAuthURL.searchParams.set('client_id', 'Ov23li7xruXta2h10d0s')
      githubOAuthURL.searchParams.set('client_secret', 'b0b696aa5116c710c645449fcbe3e83b0f231896')
      githubOAuthURL.searchParams.set('code', code)
      githubOAuthURL.searchParams.set('redirect_uri', 'http://localhost:3000/api/auth/callback')

      const githubAccessTokenResponse = await fetch(githubOAuthURL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      })

      const githubAccessTokenData = await githubAccessTokenResponse.json()

      const { access_token } = z
        .object({
          access_token: z.string(),
          token_type: z.literal('bearer'),
          scope: z.string(),
        })
        .parse(githubAccessTokenData)

      const githubUserResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })

      const githubUserData = await githubUserResponse.json()

      const {
        id: githubId,
        avatar_url,
        name,
        email,
      } = z
        .object({
          id: z.number().int().transform(String),
          avatar_url: z.url(),
          name: z.string().nullable(),
          email: z.email().nullable(),
        })
        .parse(githubUserData)

      const githubUserEmailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })

      const githubUserEmailsData = await githubUserEmailsResponse.json()

      const githubUserEmails = z
        .array(
          z.object({
            email: z.email(),
            primary: z.boolean(),
            verified: z.boolean(),
            visibility: z.enum(['public', 'private']).nullable(),
          })
        )
        .parse(githubUserEmailsData)

      const primaryEmail = githubUserEmails.find((email) => email.primary && email.verified)

      if (!primaryEmail?.primary && !primaryEmail?.verified) {
        throw new BadRequestError('Email not available from GitHub account.')
      }

      let user = await prisma.user.findUnique({
        where: {
          email: email ?? primaryEmail?.email,
        },
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            name,
            email: email ?? primaryEmail?.email,
            avatarUrl: avatar_url,
          },
        })
      }

      let account = await prisma.account.findUnique({
        where: {
          provider_userId: {
            provider: 'GITHUB',
            userId: user.id,
          },
        },
      })

      if (!account) {
        account = await prisma.account.create({
          data: {
            provider: 'GITHUB',
            providerAccountId: githubId,
            userId: user.id,
          },
        })
      }
      const token = await reply.jwtSign(
        {
          sub: user.id,
        },
        {
          sign: {
            expiresIn: '1d',
          },
        }
      )

      return reply.status(201).send({ token })
    }
  )
}
