// Column span of a child card in the grid layout of a panel: view_layout.column_span of the child,
// a number or "full" (the whole row). view_layout is allowed in every card config (the editors of the
// built-in cards refuse unknown keys); Home Assistant itself does not use it inside a panel.
export function columnSpan(cardConfig: Record<string, unknown> | undefined): number | "full" | undefined {
  const span = (cardConfig?.view_layout as Record<string, unknown> | undefined)?.column_span;
  if (span === "full") return "full";
  const number = Math.floor(Number(span));
  return number > 1 ? number : undefined;
}
