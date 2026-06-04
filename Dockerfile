FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./

ENV DATABASE_URL="postgresql://user:password@localhost:5432/database?schema=public"
RUN npx prisma generate

RUN npm prune --omit=dev

FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY src ./src

EXPOSE 5001

CMD ["npm", "start"]
