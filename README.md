# Etan Krivorot — portfolio (static site)

Plain HTML/CSS/JS, no build step. Open `index.html` in a browser, or serve the folder:

    python3 -m http.server 8765    # then visit http://127.0.0.1:8765

## Structure
- `index.html` — home: project grid (cover, title, label)
- `about.html`, `cv.html`, `contact.html`
- `viking-chairs.html`, `gcode-shade.html`, `uhpc-beam.html`, `3d-printed-shelf.html`,
  `masp-redesign.html`, `cube.html`, `photography.html`
- `css/style.css` — all styling (sidebar, grid, page header, content layout)
- `js/main.js` — mobile menu, slideshows, hover/drag frame sequences (360° turntables and the Viking
  timelapses), the before/after reveal on Cube, and click-to-zoom (any `<figure class="img zoomable" data-full="…">`)
- `assets/img/<page>/` — images (already cropped as they were in Readymag)
- `assets/img/covers/` — home-grid thumbnails
- `assets/shots/` — frame sequences scrubbed with the pointer (turntables and timelapses)

## Editing page content
Each project page is a tree of `.stack` (top-to-bottom) and `.row` (side-by-side) blocks.
Every `.cell` carries its position as CSS variables, all as % of its parent:
`--l` left offset, `--w` width, `--t` space above.
Change those numbers to move things; add a new `<div class="cell" style="--w:100%">…</div>`
inside a `.stack` to add content. Below 760px wide every row collapses into one column.

To add a project: copy a project page, edit it, add an `<li>` to the sidebar list
in every page, and add a `.project-cover` card to `index.html`.
