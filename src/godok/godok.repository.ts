import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class GodokRepository {
  constructor(private readonly prismaService: PrismaService) {}
}
