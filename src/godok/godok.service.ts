import { Injectable } from '@nestjs/common';
import { GodokRepository } from './godok.repository';

@Injectable()
export class GodokService {
  constructor(private readonly godokRepository: GodokRepository) {}
}
