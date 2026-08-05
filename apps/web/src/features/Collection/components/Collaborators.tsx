import { isAxiosError } from 'axios';
import { useId, useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getApiErrorMessage, type ApiErrorEnvelope } from '@/api/utils/getApiErrorMessage';
import type { CollaboratorRole, Collection, CollectionInvitation } from '@/models/collection.model';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { CollectionQueries } from '@/stores/queries/collectionQueries';

const isVersionConflict = (error: unknown): boolean =>
  isAxiosError<ApiErrorEnvelope>(error) &&
  error.response?.data.error.code === 'collection_version_conflict';

interface CollaboratorsProps {
  /** The Collection to manage; omit to render only the current user's invitation inbox. */
  readonly collection?: Collection;

  /** The signed-in user's id; required to render `collection`'s collaborator panel. */
  readonly currentUserId?: string;

  /** Refetches the Collection after a conflict, so the retry uses the latest version. */
  readonly onReload?: () => void;
}

export const Collaborators = ({ collection, currentUserId, onReload }: CollaboratorsProps) => {
  const usernameId = useId();
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<CollaboratorRole>('editor');
  const [transferTarget, setTransferTarget] = useState<string | null>(null);
  // Sent invitations the owner just issued in this session, so they can revoke before
  // the invitee responds. There is no endpoint to list a Collection's outgoing invites.
  const [sentInvitations, setSentInvitations] = useState<readonly CollectionInvitation[]>([]);

  const { data: invitations = [] } = CollectionQueries.useInvitations();
  const invite = CollectionQueries.useInvite();
  const respond = CollectionQueries.useRespondToInvitation();
  const revoke = CollectionQueries.useRevokeInvitation();
  const changeRole = CollectionQueries.useChangeCollaboratorRole();
  const removeCollaborator = CollectionQueries.useRemoveCollaborator();
  const transferOwnership = CollectionQueries.useTransferOwnership();

  const isOwner = collection !== undefined && collection.ownerId === currentUserId;

  const handleInvite = (event: React.FormEvent) => {
    event.preventDefault();
    if (collection === undefined || username.trim() === '') return;
    invite.mutate(
      { collectionId: collection.id, username: username.trim(), role },
      {
        onSuccess: sent => {
          toast.success(`Invitation sent to ${username.trim()}.`);
          setUsername('');
          setSentInvitations(current => [...current, sent]);
        },
        onError: error => toast.error(getApiErrorMessage(error, 'Could not send the invitation.')),
      },
    );
  };

  const handleRespond = (invitationId: string, decision: 'accept' | 'decline') => {
    respond.mutate(
      { invitationId, decision },
      {
        onSuccess: () =>
          toast.success(decision === 'accept' ? 'Invitation accepted.' : 'Invitation declined.'),
        onError: error =>
          toast.error(getApiErrorMessage(error, 'Could not respond to the invitation.')),
      },
    );
  };

  const handleRevoke = (invitationId: string) => {
    revoke.mutate(invitationId, {
      onSuccess: () => {
        toast.success('Invitation revoked.');
        setSentInvitations(current => current.filter(invitation => invitation.id !== invitationId));
      },
      onError: error => toast.error(getApiErrorMessage(error, 'Could not revoke the invitation.')),
    });
  };

  const handleChangeRole = (userId: string, nextRole: CollaboratorRole) => {
    if (collection === undefined) return;
    changeRole.mutate(
      { collectionId: collection.id, userId, role: nextRole },
      {
        onSuccess: () => toast.success('Role updated.'),
        onError: error => {
          toast.error(getApiErrorMessage(error, 'Could not update the role.'));
          if (isVersionConflict(error)) onReload?.();
        },
      },
    );
  };

  const handleRemove = (userId: string) => {
    if (collection === undefined) return;
    removeCollaborator.mutate(
      { collectionId: collection.id, userId },
      {
        onSuccess: () => toast.success('Collaborator removed.'),
        onError: error => {
          toast.error(getApiErrorMessage(error, 'Could not remove the collaborator.'));
          if (isVersionConflict(error)) onReload?.();
        },
      },
    );
  };

  const handleTransfer = () => {
    if (collection === undefined || transferTarget === null) return;
    transferOwnership.mutate(
      { collectionId: collection.id, userId: transferTarget },
      {
        onSuccess: () => {
          toast.success('Ownership transferred.');
          setTransferTarget(null);
        },
        onError: error => {
          toast.error(getApiErrorMessage(error, 'Could not transfer ownership.'));
          setTransferTarget(null);
          if (isVersionConflict(error)) onReload?.();
        },
      },
    );
  };

  // The Collection list page mounts this for the invitation inbox alone; with no
  // invitations and no Collection there is nothing to render, and an empty section
  // would still push the layout down by its margin.
  if (invitations.length === 0 && collection === undefined) return null;

  return (
    <section className="mt-12">
      {invitations.length > 0 && (
        <div className="mb-8 rounded-xl border border-primary/20 bg-primary/[0.04] p-5">
          <h2 className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
            Your invitations
          </h2>
          <ul className="mt-4 space-y-2">
            {invitations.map(invitation => (
              <li
                key={invitation.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-foreground/10 bg-background/40 px-4 py-3"
              >
                <span className="text-sm">
                  <strong className="font-medium">{invitation.collectionName}</strong>
                  <span className="text-muted-foreground"> — {invitation.role}</span>
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleRespond(invitation.id, 'accept')}
                  >
                    Accept
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleRespond(invitation.id, 'decline')}
                  >
                    Decline
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {collection !== undefined && (
        <div>
          <h2 className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
            Collaborators
          </h2>
          <ul className="mt-4 space-y-2">
            {collection.collaborators.map(collaborator => (
              <li
                key={collaborator.userId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-foreground/10 bg-surface/40 px-4 py-3"
              >
                <span className="truncate text-sm">
                  {collaborator.userId === currentUserId ? 'You' : collaborator.userId}
                </span>
                {isOwner && collaborator.role !== 'owner' ? (
                  <div className="flex items-center gap-2">
                    <Select
                      value={collaborator.role}
                      onValueChange={value =>
                        handleChangeRole(collaborator.userId, value as CollaboratorRole)
                      }
                    >
                      <SelectTrigger
                        aria-label={`Role for ${collaborator.userId}`}
                        size="sm"
                        className="w-28"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemove(collaborator.userId)}
                    >
                      Remove
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setTransferTarget(collaborator.userId)}
                    >
                      Make owner
                    </Button>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground capitalize">
                    {collaborator.role}
                  </span>
                )}
              </li>
            ))}
          </ul>

          {isOwner && (
            <form
              className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-foreground/15 p-4"
              onSubmit={handleInvite}
            >
              <div className="grid gap-2">
                <Label htmlFor={usernameId}>Invite by username</Label>
                <Input
                  id={usernameId}
                  value={username}
                  onChange={event => setUsername(event.target.value)}
                />
              </div>
              <Select value={role} onValueChange={value => setRole(value as CollaboratorRole)}>
                <SelectTrigger aria-label="Invitation role" className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" disabled={invite.isPending}>
                Invite
              </Button>
            </form>
          )}

          {isOwner && sentInvitations.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                Pending invitations sent this session
              </h3>
              <ul className="mt-3 space-y-2">
                {sentInvitations.map(invitation => (
                  <li
                    key={invitation.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-foreground/10 bg-surface/40 px-4 py-3"
                  >
                    <span className="text-sm capitalize">{invitation.role}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleRevoke(invitation.id)}
                    >
                      Revoke
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={transferTarget !== null}
        onOpenChange={open => !open && setTransferTarget(null)}
        icon={<span aria-hidden="true">⚠</span>}
        title="Transfer ownership?"
        description="You will become an editor on this Collection and lose owner-only controls."
        confirmLabel="Transfer ownership"
        destructive
        isLoading={transferOwnership.isPending}
        onConfirm={handleTransfer}
      />
    </section>
  );
};
