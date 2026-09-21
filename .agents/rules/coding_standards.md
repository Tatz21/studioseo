# Coding Standards & Security Guidelines

- **Architecture:** Keep UI components in `src/components/`, SEO analysis algorithms in `src/engine/`, and global styles in `src/index.css`.
- **Styling:** Adhere strictly to the design tokens in `DESIGN.md`. Do not introduce ad-hoc colors outside the Obsidian & Cyber-Emerald palette.
- **State & Memory:** Whenever new features, tools, or major architectural decisions are made, update `MEMORY.md`.
- **Error Handling:** All external network fetch calls must handle CORS and network failures with fallback to direct HTML paste.
