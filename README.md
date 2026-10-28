# Glyphtrail

**Make the unseen easier to read.**

Inspect a curated set of invisible Unicode characters, unusual spaces, joiners, selectors, and direction controls. See exact positions and an annotated reading copy without automatically deleting or normalizing the source.

## Features

- Separate UTF-16, UTF-8 byte, code-point, line, and column positions.
- Curated categories for zero-width characters, joiners, bidi controls, unusual spaces, selectors, tag-range points, and controls.
- Optional inspection of ordinary spaces, tabs, CR, and LF.
- Annotated reading copies with visible markers such as `⟦U+200B⟧`.
- Category filtering, pagination, and a button to select the original character.
- Metadata JSON/CSV without surrounding source prose.
- Editable project JSON that preserves source code points using ASCII Unicode escapes.
- Local processing without uploads, accounts, analytics, remote fonts, or app storage.

## Run locally

Node.js 22 or newer. The browser app has no runtime dependencies. jsdom is a pinned development-only test dependency.

```sh
git clone https://github.com/KingReaper6940/glyphtrail.git
cd glyphtrail
npm ci
npm test
npm run build
npm run dev
```

Open http://127.0.0.1:4188. The local server binds to loopback and serves allowlisted build assets.

## Use

1. Paste text or load the fictional example.
2. Choose whether to include ordinary layout characters.
3. Select **Inspect text**.
4. Review the categories and position table. **Select** focuses the original text at that observation.
5. Filter retained entries by category or move through pages of 25 entries.
6. Save metadata, a full annotated copy, or an editable project. Reopen saved inspections by pasting their project JSON.

Editing the text or layout choice invalidates the previous result. Invalid input clears previews and disables exports. Rejected project imports leave your current text intact.

A reported character is an observation, **not an error or a safety verdict**. Joiners, variation selectors, and direction controls can be essential for language and emoji.

## Position conventions

| Position | Convention |
| --- | --- |
| UTF-16 | Zero-based half-open ranges suitable for JavaScript string slices |
| UTF-8 bytes | Zero-based half-open ranges in UTF-8 encoding |
| Code-point index | Zero-based Unicode scalar index |
| Line / column | One-based; columns count code points, not display cells or graphemes |

For `🙂` followed by a zero-width space, the space begins at UTF-16 offset 2, byte offset 4, and code-point index 1.

Line breaks recognize LF, lone CR, CRLF, U+2028, and U+2029. A CRLF pair counts as one break. Its CR and LF entries occupy consecutive code-point columns on the preceding line. Tabs count as one code point, not a tab stop.

## Bounds and export scope

- Source: at most **50,000 UTF-16 units**. Unpaired surrogates are rejected.
- Counts cover the whole input. At most **1,000 observations** are retained for tables and metadata exports. JSON reports disclose how many were omitted.
- Filters apply only to retained entries. A category can have a nonzero total but no retained rows if its observations occur after the cap.
- The reading preview shows the first **4,000 UTF-16 units**, without cutting a surrogate pair, and reports omitted input units.
- The annotated TXT export covers the **full input**, independently of preview and record limits.
- CSV contains retained records only, without summary counts. Use JSON for whole-input totals and omission counts.
- Project JSON is capped at 500,000 units and contains all source text. Unicode escapes are an encoding choice, not redaction.

Metadata still reveals character types and positions. Projects and annotated text include the original prose. Review files before sharing.

## Catalogue and limitations

The catalogue covers selected no-break/typographic spaces, soft hyphen, zero-width space, word joiner, BOM, joiners, common bidi marks/embeddings/overrides/isolates, variation-selector ranges, tag-range points, and nonstandard C0/C1 controls. Some descriptions are generic range labels, not full Unicode character names.

It is **not** a complete Unicode property database, invisible-character detector, normalization engine, homoglyph/confusable checker, bidi-balance validator, malware scanner, or secret detector. Zero observations do not establish that the text is safe or contains no other unusual characters.

Annotated output changes how the text reads, including emoji sequences. It is not reversible encoding: literal source text can already contain marker-like strings. Use the original or editable project for preservation, not the reading copy.

Browser textareas can normalize CRLF/CR on paste and project loading. The engine itself handles CRLF, but this is not byte-preserving file import. Browser extensions, clipboard, downloads, and the hosting environment remain outside the app's control. Nothing is saved automatically.

## Examples and checks

The [metadata report](examples/report.json), [record table](examples/records.csv), [editable project](examples/project.json), and [annotated copy](examples/annotated.txt) are reproducible with:

```sh
node scripts/example.mjs
```

The fictional example has eight curated observations: three zero-width, two bidi, one unusual space, one joiner, and one selector.

`npm test` passes 24 checks, including eight actual UI-handler cases in a jsdom environment and 48 mixed-Unicode offset cases. The DOM checks cover filtering, exact source selection, inert markup, record caps, pagination, stale-result clearing, import rejection, project reopening, and layout annotation. CI runs Node 22 and 24 on Windows and Linux.

**jsdom is a simulated DOM, not a browser rendering engine.** Native browser interaction, responsive visual layout, download destinations, and a real screenshot remain unverified because the required browser app access is not available. No mockup is presented as a screenshot.

## Deploy to Vercel

Import this repository using **Other**, root directory `.`, build command `npm run build`, output `dist`, and an empty install command. The build uses Node built-ins and does not need the development-only DOM dependency. Settings are included in `vercel.json`; no environment variables, database, server functions, or paid APIs are required.

## References

[Unicode's General Punctuation chart](https://www.unicode.org/charts/PDF/U2000.pdf) explains many of the relevant code points. An anecdotal [moderation discussion](https://www.reddit.com/r/ModSupport/comments/1u4l19p/a_lot_of_posts_starting_with_x200b_zero_width/) describes zero-width spaces affecting text matching; its proposed cause is not established here. Existing tools such as [HIBERIUS](https://github.com/Hiberius/hiberius-unicode-toolkit) offer broader Unicode inspection and cleaning workflows. Glyphtrail focuses on explicit positions and inspection without automatic source changes.

MIT licensed. See [LICENSE](LICENSE).
