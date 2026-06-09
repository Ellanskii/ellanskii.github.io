# Glitch Components

TODO

## Colors

- **Dark** (`mix-blend-mode: screen`): R `#ff2020`, G `#00ee55`, B `#1a55ff`
- **Light** (`mix-blend-mode: multiply`): C `#00b4d8`, M `#e040a0`, Y `#f5c800`

---

## TODO: investigate color accuracy

Neither set produces a clean result at full overlap — the green channel is the culprit in both cases.

- Dark (`screen`): G ≈ `#f5` instead of `#ff` → overlap tinted, not pure white
- Light (`multiply`): G ≈ `#23` instead of `#00` → overlap tinted, not pure black

Options: leave as-is / switch to pure `#ff0000/00ff00/0000ff` and `#00ffff/ff00ff/ffff00` / find warm values that still guarantee a clean result.
