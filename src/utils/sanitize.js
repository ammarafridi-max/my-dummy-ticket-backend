const sanitizeHtml = require('sanitize-html');

const richTextFields = ['content', 'body', 'description'];

const richTextRoutes = ['/api/blogs', '/api/articles', '/api/posts'];

const richTextOptions = {
  allowedTags: [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'br',
    'hr',
    'strong',
    'em',
    'u',
    's',
    'b',
    'i',
    'a',
    'img',
    'ul',
    'ol',
    'li',
    'blockquote',
    'pre',
    'code',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'div',
    'span',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    table: ['border', 'cellpadding', 'cellspacing'],
    td: ['colspan', 'rowspan'],
    th: ['colspan', 'rowspan'],
    '*': ['class', 'id', 'style'],
  },
  allowedStyles: {
    '*': {
      color: [/^#[0-9a-f]{3,6}$/i, /^rgb\(/i, /^rgba\(/i],
      'background-color': [/^#[0-9a-f]{3,6}$/i, /^rgb\(/i, /^rgba\(/i],
      'font-size': [/^\d+(?:px|em|rem|%)$/],
      'font-weight': [/^\d+$/, /^bold$/, /^normal$/],
      'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
      'text-decoration': [/.*/],
      'font-style': [/^italic$/, /^normal$/],
      margin: [/^\d+(?:px|em|rem|%)$/],
      padding: [/^\d+(?:px|em|rem|%)$/],
      'line-height': [/^\d+(?:\.\d+)?(?:px|em|rem)?$/],
    },
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    img: ['http', 'https', 'data'],
  },
};

const strictOptions = {
  allowedTags: [],
  allowedAttributes: {},
};

module.exports = (req, res, next) => {
  const isRichTextRoute = richTextRoutes.some((route) => req.originalUrl.startsWith(route));

  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        if (isRichTextRoute && richTextFields.includes(key)) {
          req.body[key] = sanitizeHtml(req.body[key], richTextOptions);
        } else {
          req.body[key] = sanitizeHtml(req.body[key], strictOptions);
        }
      }
    }
  }
  next();
};
