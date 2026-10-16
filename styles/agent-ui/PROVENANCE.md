# agent-ui source provenance

Source: https://github.com/shczhen/agent-ui
Archive revision: 29d3aa3ed9e1a4d2cd5fcc1747689e3bc2915e2d.

Copied from the inspected 01-it-support adaptation in this workspace on 2026-10-16: Dialog, Button, Badge, control-light, tokens, recipes, Crystal/Obsidian theme, and MiSans font files. Button and Badge retain upstream source with Slot imports mapped to the existing dependency. Dialog retains the source composition and styles, with the Radix primitive replaced by a native modal dialog (focus trapping, Escape, and focus restoration) to avoid a new dependency; Tailwind 4 theme/source directives are mapped to the existing Tailwind 3 configuration instead of migrating the app. Recipe layer wrappers are flattened for Tailwind 3 imports. The live entry, actions, and result statuses use these components.

MiSans attribution is in public/fonts/README.md. The inspected upstream archive had no root license; no additional component redistribution license is asserted here.
