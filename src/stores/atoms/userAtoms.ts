import { atom } from 'jotai';

import { List } from '@/models';

export const userIdAtom = atom<string | null>(null);

export const listAtom = atom<List[] | null>(null);
