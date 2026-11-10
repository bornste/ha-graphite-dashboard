// Layout of cards that exist as a row and as a tile (one component, "layout: row | tile").
export type CardLayout = "row" | "tile";

export function layoutOf(config: { layout?: string } | undefined, fallback: CardLayout): CardLayout {
  return config?.layout === "row" || config?.layout === "tile" ? config.layout : fallback;
}
