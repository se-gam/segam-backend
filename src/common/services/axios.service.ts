import { Injectable } from '@nestjs/common';
import { Axios } from 'axios';
import { constants } from 'crypto';
import { HttpsCookieAgent } from 'http-cookie-agent/http';
import { CookieJar } from 'tough-cookie';

@Injectable()
export class AxiosService extends Axios {
  constructor() {
    const jar = new CookieJar();

    const httpsAgent = new HttpsCookieAgent({
      cookies: { jar },
      secureOptions: constants.SSL_OP_LEGACY_SERVER_CONNECT,
    });

    super({
      withCredentials: true,
      proxy: false,
      httpsAgent,
    });
  }
}
