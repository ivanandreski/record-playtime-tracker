# Record Playtime Tracker V2

App is designed to be self hosted for single user. Imports your vinyl collection from Discogs.com. Gets data for the album, release and track length, stores it in a local db. User is able to list all imported albums, and add play sessions for each. The user can also save their record needles as an entry in the db which is then related to a play-session (album played + needle). If the album doesn't have track length in discogs, the user can add a value in the modifier field to set custom playtime in seconds

## Deploying

No registry: build an amd64 image on your machine, copy it to the server, run it with compose. Config is runtime-only (`deploy/.env`), so the same image runs anywhere.

```sh
npm run image   # dist/record-playtime-tracker-<sha>.tar.gz (FORCE=1 to allow a dirty tree)
scp dist/*.tar.gz deploy/docker-compose.yaml deploy/.env.example user@server:~/record-playtime-tracker/
# on the server: cp .env.example .env && edit it
gunzip -c record-playtime-tracker-<sha>.tar.gz | docker load
APP_TAG=<sha> docker compose up -d
```

Rollback: `APP_TAG=<old sha> docker compose up -d`. If Postgres runs on the server host, use `host.docker.internal` in `DATABASE_URL` and allow the docker subnet in `pg_hba.conf` / `listen_addresses`.

### Taking over the legacy database

The Prisma schema matches the old .NET/EF Core database, so the app runs on it in place. One-time, before the first start:

```sh
pg_dump -Fc -d "$DATABASE_URL" -f records-before-takeover.dump
docker compose run --rm app node node_modules/.bin/prisma migrate resolve --applied 0_init
docker compose up -d
```

Skipping the `resolve` step makes `migrate deploy` fail with P3005 and the app won't start; no data is touched. `__EFMigrationsHistory` can be dropped once the old app is gone.

## SvelteKit Docs

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv create --template minimal --types ts --add prettier eslint vitest="usages:unit" tailwindcss="plugins:none" --install npm record-playtime-tracker
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
