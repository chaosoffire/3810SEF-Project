FROM node:24-alpine AS builder
WORKDIR /app

ENV CI=true

COPY package.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN npm prune --omit=dev

WORKDIR /output

RUN cp -R /app/dist ./ && \
    cp -R /app/node_modules ./ && \
    cp /app/package.json ./

FROM node:24-alpine AS runtime
WORKDIR /app

COPY --from=builder /output ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "dist/server.js"]
