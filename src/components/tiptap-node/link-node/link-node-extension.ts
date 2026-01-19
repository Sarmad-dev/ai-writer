import { Link as TiptapLink } from '@tiptap/extension-link'

export const LinkNode = TiptapLink.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      'data-preview': {
        default: null,
        parseHTML: element => element.getAttribute('data-preview'),
        renderHTML: attributes => {
          if (!attributes['data-preview']) {
            return {}
          }
          return {
            'data-preview': attributes['data-preview'],
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'a[href]:not([href *= "javascript:" i])',
        getAttrs: (node) => {
          const href = (node as HTMLElement).getAttribute('href')
          return href ? { href } : false
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'a',
      {
        ...HTMLAttributes,
        class: 'tiptap-link',
        rel: 'noopener noreferrer',
        target: '_blank',
      },
      0,
    ]
  },
})

export default LinkNode