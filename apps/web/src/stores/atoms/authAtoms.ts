import { atom } from 'jotai';

export const isAuthAtom = atom(false);

export const tokenAtom = atom<string | null>(null);
