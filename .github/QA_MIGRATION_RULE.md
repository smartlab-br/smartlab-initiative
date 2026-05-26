
# QA Rule for Migration (Nuxt 4.3.0 + Vue 3 + Vuetify 3.7.0)

## Mandatory guide for code migration

- Migrated code must use `script setup` and Composition API with TypeScript.
- Global state must be implemented only with Pinia (do not use Vuex or this.$store).
- Plugins and global integrations must be done via Nuxt plugin, with typing in `types/plugins.d.ts`.
- Libraries that depend on the browser must be loaded in client-only plugins.
- All migrated code must pass lint (`npm run lint`) and build (`npm run build`).
- There must be no use of legacy patterns (filters, mixins, this.$axios, etc).
- Migrated code must follow the pattern of already migrated files.

### Required versions
- Nuxt: ^4.3.0
- Vue: 3.x (implicit via Nuxt 4)
- Vuetify: ^3.7.0

## How to use
- Use this guide as a reference throughout the entire migration process.
- Validate each migrated module, component, or feature according to the items above.
- The GitHub Actions pipeline must ensure automatic lint and build.

---

**Example usage:**

> "Module X was migrated following all QA migration rules."
