# Record Playtime Tracker V2

App is designed to be self hosted for single user. Imports your vinyl collection from Discogs.com. Gets data for the album, release and track length, stores it in a local db. User is able to list all imported albums, and add play sessions for each. The user can also save their record needles as an entry in the db which is then related to a play-session (album played + needle). If the album doesn't have track length in discogs, the user can add a value in the modifier field to set custom playtime in seconds

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
