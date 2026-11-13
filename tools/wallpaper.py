"""Graphite Glass wallpaper: a dark, out of focus "room at night" with warm lamps, bokeh and cool
window light, for the page background behind translucent panels.

Usage:
    python tools/wallpaper.py [output folder]

Writes graphite-glass-wallpaper.jpg (about 400 KB) and graphite-glass-wallpaper.webp (about 70 KB),
3840 x 2160 px, into the output folder (default: the current folder).
Needs numpy, pillow and scipy (pip install numpy pillow scipy).

The soft light is computed at a quarter of the size and scaled up; a fine grain against banding is
added at full size. Change the lights below to move, recolour or weaken them; the seed keeps the
bokeh the same between runs.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

width, height = 3840, 2160
seed = 7

# base colour of the room and the overall light distribution
baseColor = (26, 25, 27)

# soft light sources: centre x, centre y (0..1), radius x, radius y, colour, strength
lights = [
    (0.07, 0.30, 0.20, 0.32, (255, 168, 88), 0.42),   # warm lamp, left
    (0.20, 0.72, 0.10, 0.16, (214, 120, 70), 0.24),   # ember, low left
    (0.55, 0.04, 0.18, 0.14, (255, 214, 160), 0.30),  # ceiling light
    (0.42, 0.95, 0.16, 0.12, (160, 112, 88), 0.18),   # floor reflection
    (0.97, 0.64, 0.22, 0.34, (110, 140, 210), 0.26),  # cool window, right
    (0.82, 0.16, 0.12, 0.16, (170, 190, 215), 0.16),  # cool highlight
    (0.30, 0.38, 0.30, 0.30, (120, 96, 84), 0.10),    # warm haze, middle
    (0.68, 0.48, 0.26, 0.30, (90, 96, 120), 0.10),    # cool haze, middle
]

# bokeh discs gather around these points: x, y, colour
bokehAnchors = [
    (0.07, 0.30, (255, 180, 110)),
    (0.55, 0.05, (255, 220, 170)),
    (0.95, 0.62, (140, 165, 220)),
    (0.22, 0.70, (220, 140, 90)),
]
bokehPerAnchor = 26


def toLinear(color):
    """sRGB 0..255 to linear light, so light sources add up like real light."""
    return (np.array(color, np.float32) / 255.0) ** 2.2


def main():
    outputFolder = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")
    outputFolder.mkdir(parents=True, exist_ok=True)
    random = np.random.default_rng(seed)

    smallWidth, smallHeight = width // 4, height // 4
    y, x = np.mgrid[0:smallHeight, 0:smallWidth].astype(np.float32)
    x /= smallWidth
    y /= smallHeight

    image = np.zeros((smallHeight, smallWidth, 3), np.float32) + toLinear(baseColor)
    # vignette: lighter towards the top left, darker towards the bottom right
    vignette = (1.0 + 0.35 * np.exp(-(((x - 0.15) / 0.55) ** 2 + ((y - 0.05) / 0.6) ** 2))
                - 0.45 * np.clip(x + y - 1.0, 0, 1))
    image *= vignette[..., None]

    for centerX, centerY, radiusX, radiusY, color, strength in lights:
        distance = ((x - centerX) / radiusX) ** 2 + ((y - centerY) / radiusY) ** 2
        image += np.exp(-distance * 2.2)[..., None] * toLinear(color) * strength

    # bokeh: small discs with a brighter rim, slightly blurred
    bokeh = np.zeros_like(image)
    aspect = smallWidth / smallHeight
    for anchorX, anchorY, color in bokehAnchors:
        for _ in range(bokehPerAnchor):
            discX = anchorX + random.normal(0, 0.09)
            discY = anchorY + random.normal(0, 0.12)
            radius = random.uniform(0.006, 0.022)
            distance = np.sqrt(((x - discX) * aspect) ** 2 + (y - discY) ** 2)
            disc = np.clip((radius - distance) / (radius * 0.25), 0, 1) * (0.55 + 0.45 * np.clip(distance / radius, 0, 1))
            bokeh += disc[..., None] * toLinear(color) * random.uniform(0.04, 0.16)
    image += gaussian_filter(bokeh, sigma=(2.2, 2.2, 0))

    # out of focus like a photo, then back to sRGB
    image = gaussian_filter(image, sigma=(3, 3, 0))
    srgb = np.clip(image, 0, 1) ** (1 / 2.2) * 255

    # scale up per channel in float precision (no banding), then a fine grain
    channels = [np.asarray(Image.fromarray(srgb[..., channel].astype(np.float32)).resize((width, height), Image.BICUBIC))
                for channel in range(3)]
    full = np.stack(channels, axis=-1) + random.normal(0, 1.6, (height, width, 3)).astype(np.float32)
    result = Image.fromarray(np.clip(full, 0, 255).astype(np.uint8), "RGB")

    result.save(outputFolder / "graphite-glass-wallpaper.jpg", quality=90, optimize=True, progressive=True)
    result.save(outputFolder / "graphite-glass-wallpaper.webp", quality=88, method=6)
    print(f"{width} x {height} px written to {outputFolder.resolve()}")


if __name__ == "__main__":
    main()
