import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';

import { Collaborators } from './Collaborators';

import type { Collection } from '@/models/collection.model';
import { server } from '@/test/server';

const collection: Collection = {
  id: 'collection-1',
  ownerId: 'owner-1',
  name: 'Weekend films',
  description: null,
  visibility: 'private',
  items: [],
  collaborators: [
    { userId: 'owner-1', role: 'owner' },
    { userId: 'editor-1', role: 'editor' },
  ],
  cover: null,
  likeCount: 0,
  version: 1,
  legacyPublicId: null,
  createdAt: '2026-08-03T00:00:00.000Z',
  updatedAt: '2026-08-03T00:00:00.000Z',
};

const renderCollaborators = (props: Partial<React.ComponentProps<typeof Collaborators>> = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <Collaborators collection={collection} currentUserId="owner-1" {...props} />
    </QueryClientProvider>,
  );
};

describe('Collaborators', () => {
  afterEach(() => server.resetHandlers());

  it('accepts and declines invitations from the invitation inbox', async () => {
    const user = userEvent.setup();
    let acceptedId: string | undefined;
    server.use(
      http.get('*/collections/invitations', () =>
        HttpResponse.json({
          invitations: [
            {
              id: 'invitation-1',
              collectionId: 'collection-2',
              collectionName: 'Sci-fi favorites',
              inviterId: 'owner-2',
              role: 'viewer',
              status: 'pending',
              expiresAt: '2026-08-10T00:00:00.000Z',
              respondedAt: null,
              createdAt: '2026-08-03T00:00:00.000Z',
            },
          ],
        }),
      ),
      http.post('*/collections/invitations/:id/respond', async ({ request, params }) => {
        const body = (await request.json()) as { decision: string };
        acceptedId = body.decision === 'accept' ? String(params.id) : undefined;
        return HttpResponse.json({
          id: params.id,
          collectionId: 'collection-2',
          collectionName: 'Sci-fi favorites',
          inviterId: 'owner-2',
          role: 'viewer',
          status: 'accepted',
          expiresAt: '2026-08-10T00:00:00.000Z',
          respondedAt: '2026-08-03T00:00:00.000Z',
          createdAt: '2026-08-03T00:00:00.000Z',
        });
      }),
    );
    renderCollaborators();

    expect(await screen.findByText('Sci-fi favorites')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Accept' }));
    await waitFor(() => expect(acceptedId).toBe('invitation-1'));
  });

  it('lets the owner change a collaborator’s role and hides role controls from a non-owner', async () => {
    const user = userEvent.setup();
    let patchBody: unknown;
    server.use(
      http.get('*/collections/invitations', () => HttpResponse.json({ invitations: [] })),
      http.patch('*/collections/:id/collaborators/:userId', async ({ request }) => {
        patchBody = await request.json();
        return HttpResponse.json({
          ...collection,
          collaborators: [
            { userId: 'owner-1', role: 'owner' },
            { userId: 'editor-1', role: 'viewer' },
          ],
        });
      }),
    );
    const { rerender } = renderCollaborators();

    await user.click(await screen.findByLabelText('Role for editor-1'));
    await user.click(await screen.findByRole('option', { name: 'Viewer' }));
    await waitFor(() => expect(patchBody).toEqual({ role: 'viewer' }));

    rerender(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <Collaborators collection={collection} currentUserId="editor-1" />
      </QueryClientProvider>,
    );
    expect(screen.queryByLabelText('Role for editor-1')).not.toBeInTheDocument();
  });

  it('confirms before transferring ownership', async () => {
    const user = userEvent.setup();
    let transferBody: unknown;
    server.use(
      http.get('*/collections/invitations', () => HttpResponse.json({ invitations: [] })),
      http.post('*/collections/:id/transfer', async ({ request }) => {
        transferBody = await request.json();
        return HttpResponse.json({
          ...collection,
          ownerId: 'editor-1',
          collaborators: [
            { userId: 'owner-1', role: 'editor' },
            { userId: 'editor-1', role: 'owner' },
          ],
        });
      }),
    );
    renderCollaborators();

    await user.click(await screen.findByRole('button', { name: 'Make owner' }));
    expect(screen.getByText('Transfer ownership?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Transfer ownership' }));
    await waitFor(() => expect(transferBody).toEqual({ userId: 'editor-1' }));
  });

  it('reloads on a stale-version conflict while changing a role', async () => {
    const user = userEvent.setup();
    let reloaded = false;
    server.use(
      http.get('*/collections/invitations', () => HttpResponse.json({ invitations: [] })),
      http.patch('*/collections/:id/collaborators/:userId', () =>
        HttpResponse.json(
          {
            error: {
              code: 'collection_version_conflict',
              message: 'Reload and retry.',
              requestId: 'req-1',
            },
          },
          { status: 409 },
        ),
      ),
    );
    renderCollaborators({ onReload: () => (reloaded = true) });

    await user.click(await screen.findByLabelText('Role for editor-1'));
    await user.click(await screen.findByRole('option', { name: 'Viewer' }));
    await waitFor(() => expect(reloaded).toBe(true));
  });
});
