import { Inject, Injectable } from '@nestjs/common';
import type { Farmer } from '@wam-mfugo/shared';
import { FARMERS_REPOSITORY, FarmersRepository } from './farmer.repository';

@Injectable()
export class FarmersService {
  constructor(
    @Inject(FARMERS_REPOSITORY) private readonly repo: FarmersRepository,
  ) {}

  list(): Promise<Farmer[]> {
    return this.repo.list();
  }
}
