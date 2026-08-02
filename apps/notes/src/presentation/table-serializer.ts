/* eslint-disable @typescript-eslint/no-explicit-any */

// tiptap-markdown's default table serializer writes the literal text "[table]"
// (when html:false) if any cell has >1 child block — e.g. two paragraphs
// created by pressing Enter inside a cell. This version joins all child blocks
// inline so the table always serialises to proper markdown.
export function serializeTable(state: any, node: any) {
  state.inTable = true;

  // hardBreak has no tiptap-markdown serializer; it falls back to writing the
  // literal text "[hardBreak]". A real \n would also break the table row.
  // Override it for the duration of the table write — a space is the closest
  // valid representation inside GFM table cells.
  const origNodes = state.nodes as Record<string, unknown>;
  state.nodes = { ...origNodes, hardBreak: (s: any) => s.write(' ') };

  node.forEach((row: any, _p: any, i: number) => {
    state.write('| ');
    row.forEach((col: any, _p2: any, j: number) => {
      if (j) state.write(' | ');
      let first = true;
      col.forEach((child: any) => {
        if (!first) state.write(' ');
        state.renderInline(child);
        first = false;
      });
    });
    state.write(' |');
    state.ensureNewLine();
    if (!i) {
      const delim = Array.from({ length: row.childCount as number })
        .map(() => '---')
        .join(' | ');
      state.write(`| ${delim} |`);
      state.ensureNewLine();
    }
  });
  state.nodes = origNodes;
  state.closeBlock(node);
  state.inTable = false;
}
