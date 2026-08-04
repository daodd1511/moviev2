import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type {
  Collection,
  CollectionVisibility,
  CreateCollectionInput,
} from '@/models/collection.model';

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
  readonly onSubmit: (
    input: Pick<CreateCollectionInput, 'name' | 'description' | 'visibility'>,
  ) => void;
}

export const CollectionForm = ({
  collection,
  isPending,
  submitLabel,
  onSubmit,
}: CollectionFormProps) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CollectionFormValues>({
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
    // Reset only when switching to a different Collection (or its initial load), not on
    // every refetch of the same one — a version-conflict refetch must not wipe input the
    // user hasn't saved yet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection?.id, reset]);

  const handleFormSubmit = handleSubmit(values => {
    onSubmit({
      name: values.name,
      description: values.description === '' ? null : values.description,
      visibility: values.visibility as CollectionVisibility,
    });
  });

  return (
    <form className="grid gap-4" noValidate onSubmit={event => void handleFormSubmit(event)}>
      <Field data-invalid={errors.name !== undefined}>
        <FieldLabel htmlFor="collection-name">Name</FieldLabel>
        <Input
          id="collection-name"
          aria-invalid={errors.name !== undefined}
          {...register('name')}
        />
        <FieldError errors={[errors.name]} />
      </Field>
      <Field data-invalid={errors.description !== undefined}>
        <FieldLabel htmlFor="collection-description">Description</FieldLabel>
        <Textarea
          id="collection-description"
          aria-invalid={errors.description !== undefined}
          {...register('description')}
        />
        <FieldError errors={[errors.description]} />
      </Field>
      <Field data-invalid={errors.visibility !== undefined}>
        <FieldLabel htmlFor="collection-visibility">Visibility</FieldLabel>
        <Controller
          control={control}
          name="visibility"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="collection-visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="unlisted">Unlisted</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <FieldError errors={[errors.visibility]} />
      </Field>
      <div>
        <Button type="submit" disabled={isPending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
