import {
  Node,
  mergeAttributes,
  InputRule,
  type NodeViewRendererProps,
} from '@tiptap/core';

type MarkdownItInstance = {
  core: {
    ruler: {
      push: (name: string, fn: (state: MarkdownItState) => void) => void;
    };
  };
};

type MarkdownItToken = {
  type: string;
  tag: string;
  content: string;
  children: MarkdownItToken[] | null;
};

type MarkdownItState = {
  tokens: MarkdownItToken[];
  Token: new (type: string, tag: string, nesting: number) => MarkdownItToken;
};

type SerializeState = { write: (s: string) => void; inTable?: boolean };

export const TableCheckbox = Node.create({
  name: 'tableCheckbox',
  group: 'inline',
  inline: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      checked: {
        default: false,
        parseHTML: (el: HTMLInputElement) =>
          el.hasAttribute('checked') || el.getAttribute('checked') === 'true',
        renderHTML: (attrs: { checked: boolean }) =>
          attrs.checked ? { checked: '' } : {},
      },
    };
  },

  parseHTML() {
    return [{ tag: 'input[type="checkbox"].table-checkbox' }];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    return [
      'input',
      mergeAttributes(HTMLAttributes, {
        type: 'checkbox',
        class: 'table-checkbox',
      }),
    ];
  },

  addNodeView() {
    return ({ node, getPos, editor }: NodeViewRendererProps) => {
      const dom = document.createElement('input');
      dom.type = 'checkbox';
      dom.className = 'table-checkbox';
      dom.checked = node.attrs.checked as boolean;
      dom.style.cursor = 'pointer';
      dom.style.accentColor = 'oklch(82% 0.14 160)';
      dom.style.width = '0.85rem';
      dom.style.height = '0.85rem';
      dom.addEventListener('mousedown', (e) => e.preventDefault());
      dom.addEventListener('change', () => {
        const pos = typeof getPos === 'function' ? getPos() : undefined;
        if (pos !== undefined) {
          editor.view.dispatch(
            editor.view.state.tr.setNodeMarkup(pos, undefined, {
              checked: dom.checked,
            }),
          );
        }
      });
      return {
        dom,
        update: (updatedNode: typeof node) => {
          if (updatedNode.type !== node.type) return false;
          dom.checked = updatedNode.attrs.checked as boolean;
          return true;
        },
      };
    };
  },

  // tiptap-markdown reads extension.storage.markdown for serialization + parsing
  addStorage() {
    return {
      markdown: {
        serialize(
          state: SerializeState,
          node: { attrs: { checked: boolean } },
        ) {
          state.write(node.attrs.checked ? '[x]' : '[ ]');
        },
        parse: {
          setup(md: MarkdownItInstance) {
            md.core.ruler.push('table_checkbox', (state: MarkdownItState) => {
              const Token = state.Token;
              for (let i = 0; i < state.tokens.length; i++) {
                const token = state.tokens[i];
                if (
                  !token ||
                  token.type !== 'inline' ||
                  !token.children?.length
                )
                  continue;

                let inTableCell = false;
                for (let j = i - 1; j >= 0; j--) {
                  const t = state.tokens[j];
                  if (!t) break;
                  if (t.type === 'td_open' || t.type === 'th_open') {
                    inTableCell = true;
                    break;
                  }
                  if (
                    t.type === 'tr_open' ||
                    t.type === 'bullet_list_open' ||
                    t.type === 'ordered_list_open' ||
                    t.type === 'fence'
                  )
                    break;
                }
                if (!inTableCell) continue;

                const newChildren: MarkdownItToken[] = [];
                for (const child of token.children!) {
                  if (child.type !== 'text') {
                    newChildren.push(child);
                    continue;
                  }
                  const regex = /\[(x| )\]/gi;
                  let last = 0;
                  let m: RegExpExecArray | null;
                  while ((m = regex.exec(child.content)) !== null) {
                    if (m.index > last) {
                      const t = new Token('text', '', 0);
                      t.content = child.content.slice(last, m.index);
                      newChildren.push(t);
                    }
                    const matchStr = m[1];
                    const checked =
                      matchStr !== undefined && matchStr.toLowerCase() === 'x';
                    const t = new Token('html_inline', '', 0);
                    t.content = checked
                      ? '<input type="checkbox" class="table-checkbox" checked>'
                      : '<input type="checkbox" class="table-checkbox">';
                    newChildren.push(t);
                    last = m.index + m[0].length;
                  }
                  if (last < child.content.length) {
                    const t = new Token('text', '', 0);
                    t.content = child.content.slice(last);
                    newChildren.push(t);
                  }
                }
                token.children = newChildren;
              }
            });
          },
        },
      },
    };
  },

  addInputRules() {
    return [
      new InputRule({
        find: /\[(x| )\]$/i,
        handler: ({ state, range, match, commands }) => {
          const $pos = state.doc.resolve(range.from);
          let inTableCell = false;
          for (let d = $pos.depth; d >= 0; d--) {
            const name = $pos.node(d).type.name;
            if (name === 'tableCell' || name === 'tableHeader') {
              inTableCell = true;
              break;
            }
          }
          if (!inTableCell) return;

          const matchStr = match[1];
          const checked =
            matchStr !== undefined && matchStr.toLowerCase() === 'x';
          commands.command(({ tr }) => {
            tr.replaceWith(range.from, range.to, this.type.create({ checked }));
            return true;
          });
        },
      }),
    ];
  },
});
