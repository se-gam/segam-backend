import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fcmAdmin from 'firebase-admin';

@Injectable()
export class FcmService {
  constructor(private readonly configService: ConfigService) {
    const firebaseConfig = {
      projectId: this.configService.get('FIREBASE_PROJECT_ID'),
      clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL'),
      privateKey: this.configService
        .get('FIREBASE_PRIVATE_KEY')
        .replace(/\\n/g, '\n'),
    };

    fcmAdmin.initializeApp({
      credential: fcmAdmin.credential.cert(firebaseConfig),
    });
  }

  private chunkMessages(
    messages: fcmAdmin.messaging.TokenMessage[],
  ): fcmAdmin.messaging.TokenMessage[][] {
    const chunks = [];
    for (let i = 0; i < messages.length; i += 400) {
      chunks.push(messages.slice(i, i + 400));
    }

    return chunks;
  }

  async sendNotification(
    tokens: string[],
    title: string,
    body: string,
  ): Promise<void> {
    const messages: fcmAdmin.messaging.TokenMessage[] = tokens.map((token) => ({
      notification: {
        title,
        body,
      },
      token,
    }));

    const chunks = this.chunkMessages(messages);

    for (const chunk of chunks) {
      await fcmAdmin.messaging().sendEach(chunk);
    }
    // TODO: 실패한 토큰들 관리
  }
}
