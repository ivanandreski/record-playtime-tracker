# Record Playtime Tracker V2

App is designed to be self hosted for single user. Imports your vinyl collection from Discogs.com. Gets data for the album, release and track length, stores it in a local db. User is able to list all imported albums, and add play sessions for each. The user can also save their record needles as an entry in the db which is then related to a play-session (album played + needle). If the album doesn't have track length in discogs, the user can add a value in the modifier field to set custom playtime in seconds

## Taking over the legacy database

The Prisma schema matches the old .NET/EF Core database exactly, so this app can run on it in place. `0_init` describes the existing tables, and later migrations change them from there.

One-time cutover on the server, before the first start of the new container:

```sh
# 1. Back up the old DB
pg_dump -Fc -d "$DATABASE_URL" -f records-before-takeover.dump

# 2. Tell Prisma the existing tables ARE 0_init (records it, changes nothing)
docker compose run --rm app node node_modules/.bin/prisma migrate resolve --applied 0_init

# 3. Start normally: the container runs `prisma migrate deploy` (applies 1_created_at_defaults and later)
docker compose up -d app
```

If you skip step 2, `migrate deploy` refuses with error P3005 ("database schema is not empty") and runs nothing, so the app won't start, but no data is touched. Run step 2, then start again. The `__EFMigrationsHistory` table is left alone, and you can drop it once the old app is gone for good.

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
