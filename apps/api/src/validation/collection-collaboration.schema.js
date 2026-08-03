import { z } from 'zod';

import { mongoIdSchema } from './shared.schema.js';

export const inviteCollaboratorSchema = z
  .object({ username: z.string().trim().min(1).max(50), role: z.enum(['editor', 'viewer']) })
  .strict();

export const invitationIdParamsSchema = z.object({ invitationId: mongoIdSchema }).strict();

export const respondInvitationSchema = z
  .object({ decision: z.enum(['accept', 'decline']) })
  .strict();

export const collectionCollaboratorParamsSchema = z
  .object({ id: mongoIdSchema, userId: mongoIdSchema })
  .strict();

export const changeCollaboratorRoleSchema = z
  .object({ role: z.enum(['editor', 'viewer']) })
  .strict();

export const transferOwnershipSchema = z.object({ userId: mongoIdSchema }).strict();
