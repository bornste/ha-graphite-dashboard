// Layout of cards that exist as a row and as a tile (one component, "layout: row | tile").
export type CardLayout = "row" | "tile";

export function layoutOf(config: { layout?: string } | undefined, fallback: CardLayout): CardLayout {
  return config?.layout === "row" || config?.layout === "tile" ? config.layout : fallback;
}

// editor field for cards with both layouts (cards with a single layout do not show it)
export function layoutField(): Record<string, unknown> {
  return { name: "layout", selector: { select: { mode: "list", options: ["row", "tile"] } } };
}
