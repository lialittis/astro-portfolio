FROM node:20 AS runtime

WORKDIR /app

# 安装astro
RUN npm install -g astro
RUN npm install -g pnpm

COPY . .

RUN pnpm install
RUN pnpm run build

ENV PORT=4321
# Expose the port the app runs on
EXPOSE 4321

# Define the command to run the application
#CMD ["pnpm", "run", "start"]
CMD node ./dist/server/entry.mjs
