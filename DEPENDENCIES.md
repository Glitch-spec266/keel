# Dependencies — notes & substitutions

Installed per FABLE_PROMPT.md §4. `expo-doctor` passes 18/18 after install.

## Substitutions / additions
- **No version substitutions were required** — every native module was installed with `npx expo install`, which picked SDK 54–compatible versions automatically.
- **Added** `@expo-google-fonts/plus-jakarta-sans` and `@expo-google-fonts/inter` (the design system in §6 calls for this type pairing via expo-font; the brief lists the fonts but not the packages).
- **Added** `expo-font` explicitly (peer of the Google-font packages).
- `eslint`, `typescript`, `@types/react` were already provided by the SDK 54 default template; only `prettier` was added on top.

## Scaffold note
`create-expo-app@latest --template default` scaffolds **SDK 57** as of 2026-07. The project was re-scaffolded with `--template default@sdk-54` to honor the SDK 54 pin, rather than downgrading in place.
