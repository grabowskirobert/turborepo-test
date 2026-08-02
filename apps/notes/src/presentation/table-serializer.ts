/* eslint-disable @typescript-eslint/no-explicit-any */

// tiptap-markdown's default table serializer writes the literal text "[table]"
// (when html:false) if any cell has >1 child block. This version joins all
// child blocks inline so the table always serialises to proper GFM markdown.
export function serializeTable(state: any, node: any) {
  state.inTable = true;
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
  state.closeBlock(node);
  state.inTable = false;
}
