import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessageBuilder, Webhook } from 'discord-webhook-node';

@Injectable()
export class DiscordService {
  private discordHook: Webhook;
  constructor(private readonly configService: ConfigService) {
    this.discordHook = new Webhook(
      this.configService.get('DISCORD_WEBHOOK_URL'),
    );
  }

  async sendDiscordMessage(message: string) {
    const embed = new MessageBuilder()
      .setTitle('세감 마싯졍')
      .setColor(parseInt('0x626FE5', 16))
      .setDescription('가입알림')
      .setDescription(message)
      .setTimestamp();
    this.discordHook.setUsername('세감 마싯졍');
    this.discordHook.send(embed);
  }
}
