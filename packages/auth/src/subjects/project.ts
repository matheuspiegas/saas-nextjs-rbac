import z from 'zod'
import { projectModelSchema } from '../models/project'

export const projectSubjectSchema = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('get'),
    z.literal('create'),
    z.literal('update'),
    z.literal('delete'),
  ]),
  z.union([z.literal('Project'), projectModelSchema]),
])

export type ProjectSubject = z.infer<typeof projectSubjectSchema>
