import type { Farmer } from '@wam-mfugo/shared';

export const FARMERS_REPOSITORY = Symbol('FARMERS_REPOSITORY');

export interface FarmersRepository {
  list(): Promise<Farmer[]>;
}
