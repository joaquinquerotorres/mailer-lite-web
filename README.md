# mailer-lite-web

Vue 3 frontend for managing email campaigns. It talks to the **mailer-lite-api** backend at `http://localhost:8000`.

The API is a separate Laravel project (`mailer-lite-api`). Run that server on port **8000** before using this app.

## Stack (Vue 3)

| Piece | What this app uses |
| --- | --- |
| Vue | `^3.2.13` |
| Build | Vue CLI 5 (`@vue/cli-service`) |
| Language | JavaScript SFCs (`.vue`) |
| Component API | **Composition API** with `<script setup>` |
| Reactivity | `ref`, `computed`, `watch` |
| Lifecycle | `onMounted`, `onUnmounted` |
| Component contract | `defineProps`, `defineEmits` |
| HTTP | `fetch` for reads (list + view); **axios** for writes (create `POST`, modify `PUT`) so Laravel `422` validation payloads are easy to handle |
| Routing | None. There is a single screen; extra flows are **modals**, not routes |
| Lint | ESLint + `eslint-plugin-vue` (`plugin:vue/vue3-essential`) |

Entry point: `src/main.js` mounts `App.vue`. `App.vue` renders the MailerLite logo and `CampaignList`.

## Pages

There is **one page**:

### Campaigns (`CampaignList.vue`)

Main (and only) view. On mount it loads campaigns from mailer-lite-api:

`GET http://localhost:8000/api/campaigns?limit=5`

Optional query: `cursor` (from `nextCursor` / `prevCursor`).

The list shows:

- Campaign **name**
- **startDate** – **endDate**
- **Consult** (eye icon) — opens the view modal
- **Modify** (pencil icon) — opens the edit modal
- **Create** — opens the create modal

While a modal is open, the list is dimmed and non-interactive (`is-disabled`).

Pagination arrows (`←` / `→`) appear when `prevCursor` / `nextCursor` are present. Clicks are **debounced** (400 ms) so repeated arrow presses do not spam the API. The timer is cleared on unmount.

Loading state: “Loading campaigns...” until the request finishes.

## Modals

All modals are overlays (`role="dialog"`, `aria-modal="true"`). They emit `close` so the list can hide them.

### View — `CampaignView.vue`

Read-only details for one campaign.

- Opens from Consult, with prop `uuid`
- `GET /api/campaigns/:uuid`
- Fields: name, start date, end date (disabled inputs)

### Create — `CampaignCreate.vue`

Create a campaign.

- Fields: `name` (required, max 255), `startDate` (must be after today), `endDate` (must be after start date)
- Date inputs use `min` from computed values (`minStartDate`, `minEndDate`)
- Client-side validation, then `POST /api/campaigns` with `{ name, startDate, endDate }`
- Laravel `422` field errors are shown under inputs; other errors as a form message
- Success: shows a message, resets the form, emits `create` so the list reloads

### Modify — `CampaignModify.vue`

Update an existing campaign.

- Opens from Modify, with prop `uuid`
- Loads current data with `GET /api/campaigns/:uuid`
- Same field rules as create
- `PUT /api/campaigns/:uuid` with `{ name, startDate, endDate }`
- Success: shows a message and emits `modified` so the list reloads

## mailer-lite-api contract (as used here)

Base URL: `http://localhost:8000/api/campaigns`

| Method | Path | Body / query | Expected result |
| --- | --- | --- | --- |
| `GET` | `/api/campaigns` | `limit=5`, optional `cursor` | `{ items, nextCursor, prevCursor }`. Each item: `{ id, name, startDate, endDate }` |
| `GET` | `/api/campaigns/:id` | — | `{ id, name, startDate, endDate }` |
| `POST` | `/api/campaigns` | `{ name, startDate, endDate }` | `201` + `{ message }` |
| `PUT` | `/api/campaigns/:id` | `{ name, startDate, endDate }` | `{ message }` |

Validation errors (`422`):

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "name": ["The name field is required."],
    "startDate": ["The start date must be a date after today."],
    "endDate": ["The end date must be a date after start date."]
  }
}
```

JSON field names are **camelCase** (`startDate`, `endDate`, `nextCursor`, `prevCursor`). The campaign id from the API is used as `uuid` in the Vue components.

## Project setup

The API must already be running (`mailer-lite-api` on port 8000).

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

Dev server (Vue CLI) uses HMR. `vue.config.js` turns off `liveReload` and ignores `node_modules` so webpack does not rebuild in a loop.

### Compiles and minifies for production

```
npm run build
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
