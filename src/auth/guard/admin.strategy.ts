import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminApiStrategy {
  constructor(private readonly configservice: ConfigService) {}

  validateApiKey(apiKey?: string): boolean {
    const validApiKey = this.configservice.get<string>('ADMIN_API_KEY');
    if (!apiKey || apiKey !== validApiKey) {
      return false;
    }

    return true;
  }
}
