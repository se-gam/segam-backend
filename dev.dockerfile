FROM node:20-alpine as builder
ENV TZ=Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn add dotenv-cli
RUN yarn prisma generate

RUN yarn build && rm -rf node_modules && yarn install --production

FROM node:20-alpine as runner
ENV TZ=Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone


COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/.dev.env ./.dev.env

EXPOSE 3000

CMD ["yarn", "deploy:dev"]