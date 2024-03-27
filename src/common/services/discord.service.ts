import * as fs from 'node:fs';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessageBuilder, Webhook } from 'discord-webhook-node';
import { Request } from 'express';
import { UserInfo } from 'src/auth/types/user-info.type';

@Injectable()
export class DiscordService {
  private newUserDiscordHook: Webhook;
  private errorDiscordHook: Webhook;
  constructor(private readonly configService: ConfigService) {
    this.newUserDiscordHook = new Webhook(
      this.configService.get('DISCORD_NEW_USER_WEBHOOK_URL'),
    );
    this.errorDiscordHook = new Webhook(
      this.configService.get('DISCORD_ERROR_WEBHOOK_URL'),
    );
  }

  async sendNewUserLog(message: string) {
    if (this.configService.get('NODE_ENV') === 'local') return;

    const embed = new MessageBuilder()
      .setTitle('가입알림')
      .setColor(parseInt('0x626FE5', 16))
      .setDescription(message)
      .setTimestamp();
    this.newUserDiscordHook.setUsername('세감 마싯졍');
    this.newUserDiscordHook.send(embed);
  }

  async sendErrorLog(err: Error, request: Request) {
    if (this.configService.get('NODE_ENV') === 'local') return;
    const embed = new MessageBuilder()
      .setTitle('🔥🔥🔥🔥🔥500 에러발생🔥🔥🔥🔥🔥')
      .setColor(parseInt('0xDA4237', 16))
      .setDescription(
        `에러발생: ${err.name}\n
        에러메시지: ${err.message}\n
        에러스택: ${err.stack}\n
        요청URL: ${request.url}\n
        요청IP: ${request.ip}\n`,
      )
      .setTimestamp();
    this.errorDiscordHook.setUsername('세감 맛없졍');
    this.errorDiscordHook.send(embed);
  }

  async sendQuitLog(id: string, name: string) {
    if (this.configService.get('NODE_ENV') === 'local') return;

    const embed = new MessageBuilder()
      .setTitle('탈퇴알림')
      .setColor(parseInt('0x626FE5', 16))
      .setDescription(`${id} ${name}님이 탈퇴했습니다.`)
      .setTimestamp();
    this.newUserDiscordHook.setUsername('세감 돌아와');
    this.newUserDiscordHook.send(embed);
  }

  async sendErrorHTMLLog(user: UserInfo, html: string) {
    const fileName = Math.random().toString(36).substring(7) + '.html';

    fs.writeFileSync(fileName, html);
    await this.errorDiscordHook.sendFile(fileName);
    fs.unlinkSync(fileName);

    const embed = new MessageBuilder()
      .setTitle('🔥🔥🔥강의 정보 오류 발생🔥🔥🔥')
      .setColor(parseInt('0xDA4237', 16))
      .setDescription(
        `이름: ${user.name}\n
        학번: ${user.studentId}\n
        학과: ${user.departmentName}\n`,
      )
      .setTimestamp();
    this.errorDiscordHook.setUsername('세감 맛없졍');
    this.errorDiscordHook.send(embed);
  }
}
