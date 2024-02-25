import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto';

@Injectable()
export class PasswordService {
  private key: Buffer;
  private algorithm = 'aes-256-cbc';
  private ivLength = 16; // AES block size in bytes

  constructor(private readonly configService: ConfigService) {
    const secret = this.configService.get<string>('PASSWORD_ENCRYPT_KEY');
    const salt = this.configService.get<string>('PASSWORD_SALT');
    this.key = scryptSync(secret, salt, 32);
  }

  encryptPassword(password: string): string {
    const iv = randomBytes(this.ivLength);
    const cipher = createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  decryptPassword(encryptedPassword: string): string {
    const parts = encryptedPassword.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = parts.join(':');
    try {
      const decipher = createDecipheriv(this.algorithm, this.key, iv);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (e) {
      throw new UnauthorizedException('비밀번호 복호화에 실패했습니다.');
    }
  }
}
