import { faker } from '@faker-js/faker'
import { hash } from 'bcryptjs'

import { prismaSeed } from '../src/lib/prisma'

export async function seed() {
  await prismaSeed.organization.deleteMany()
  await prismaSeed.user.deleteMany()
  console.log('Deleted all users and organizations!')

  const passwordHash = await hash('123456', 6)

  const user = await prismaSeed.user.create({
    data: {
      name: 'Matheus Piegas',
      email: 'matheus@mstech.com',
      passwordHash,
      avatarUrl: 'https://github.com/matheuspiegas.png',
    },
  })

  const anotherUser = await prismaSeed.user.create({
    data: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      passwordHash,
      avatarUrl: faker.image.avatarGitHub(),
    },
  })

  const anotherUser2 = await prismaSeed.user.create({
    data: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      passwordHash,
      avatarUrl: faker.image.avatarGitHub(),
    },
  })

  await prismaSeed.organization.create({
    data: {
      name: 'MSTech (Admin)',
      shouldAttachUsersByDomain: true,
      slug: 'mstech-admin',
      domain: 'mstech.com',
      ownerId: user.id,
      projects: {
        createMany: {
          data: [
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
            },
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
            },
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
            },
          ],
        },
      },
      members: {
        createMany: {
          data: [
            { userId: user.id, role: 'ADMIN' },
            { userId: anotherUser.id, role: 'MEMBER' },
            { userId: anotherUser2.id, role: 'MEMBER' },
          ],
        },
      },
    },
  })

  await prismaSeed.organization.create({
    data: {
      name: 'MSTech (Member)',
      slug: 'mstech-member',
      ownerId: user.id,
      projects: {
        createMany: {
          data: [
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
            },
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
            },
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
            },
          ],
        },
      },
      members: {
        createMany: {
          data: [
            { userId: user.id, role: 'MEMBER' },
            { userId: anotherUser.id, role: 'MEMBER' },
            { userId: anotherUser2.id, role: 'ADMIN' },
          ],
        },
      },
    },
  })

  await prismaSeed.organization.create({
    data: {
      name: 'MSTech (Billing)',
      slug: 'mstech-billing',
      ownerId: user.id,
      projects: {
        createMany: {
          data: [
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
            },
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
            },
            {
              name: faker.lorem.words(5),
              slug: faker.lorem.slug(5),
              description: faker.lorem.paragraph(),
              avatarUrl: faker.image.avatarGitHub(),
              ownerId: faker.helpers.arrayElement([
                user.id,
                anotherUser.id,
                anotherUser2.id,
              ]),
            },
          ],
        },
      },
      members: {
        createMany: {
          data: [
            { userId: user.id, role: 'BILLING' },
            { userId: anotherUser.id, role: 'MEMBER' },
            { userId: anotherUser2.id, role: 'ADMIN' },
          ],
        },
      },
    },
  })
  console.log('Created user:', user)
}
seed().then(() => console.log('Seed runned!'))
