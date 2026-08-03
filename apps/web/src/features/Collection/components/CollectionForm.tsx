import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import type { Collection, CollectionVisibility, CreateCollectionInput } from '@/models/collection.model';
import { TextField } from '@/shared/components/ui/TextField';

const collectionFormSchema = z.object({
  name: z.string().trim().min(1, 'A Collection name is required.').max(255),
  description: z.string().max(2000),
  visibility: z.enum(['private', 'unlisted', 'public']),
});

type CollectionFormValues = z.infer<typeof collectionFormSchema>;

interface CollectionFormProps {
  readonly collection?: Collection;
  readonly isPending: boolean;
  readonly submitLabel: string;
  readonly onSubmit: (input: Pick<CreateCollectionInput, 'name' | 'description' | 'visibility'>) => void;
}

export const CollectionForm = ({ collection, isPending, submitLabel, onSubmit }: CollectionFormProps) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionFormSchema),
    defaultValues: {
      name: collection?.name ?? '',
      description: collection?.description ?? '',
      visibility: collection?.visibility ?? 'private',
    },
  });

  useEffect(() => {
    reset({
      name: collection?.name ?? '',
      description: collection?.description ?? '',
      visibility: collection?.visibility ?? 'private',
    });
  }, [collection, reset]);

  const handleFormSubmit = handleSubmit(values => {
    onSubmit({
      name: values.name,
      description: values.description === '' ? null : values.description,
      visibility: values.visibility as CollectionVisibility,
    });
  });

  return (
    <form className="grid gap-4" noValidate onSubmit={event => void handleFormSubmit(event)}>
      <div>
        <TextField label="Name" {...register('name')} />
        {errors.name?.message !== undefined && (
          <p className="mt-1 text-sm text-destructive" role="alert">{errors.name.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="collection-description" className="mb-1.5 block text-sm font-medium text-muted-foreground">
          Description
        </label>
        <textarea
          id="collection-description"
          className="min-h-24 w-full rounded-md border border-input bg-white/[0.08] px-4 py-2 text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          {...register('description')}
        />
      </div>
      <div>
        <label htmlFor="collection-visibility" className="mb-1.5 block text-sm font-medium text-muted-foreground">
          Visibility
        </label>
        <select
          id="collection-visibility"
          className="h-10 rounded-md border border-input bg-background px-3 text-foreground"
          {...register('visibility')}
        >
          <option value="private">Private</option>
          <option value="unlisted">Unlisted</option>
          <option value="public">Public</option>
        </select>
      </div>
      <div>
        <Button type="submit" disabled={isPending}>{submitLabel}</Button>
      </div>
    </form>
  );
};
