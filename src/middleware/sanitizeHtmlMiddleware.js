const sanitizeHtml = require('sanitize-html');

const sanitizeOption = {
  allowedTags: [
    'h1',
    'h2',
    'b',
    'i',
    'u',
    's',
    'p',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
    'img',
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target'],
    img: ['src'],
    li: ['class'],
  },
  allowedSchemesAppliedToAttributes: ['href', 'src'],
  allowedSchemes: ['data', 'http', 'https'],
};

const sanitizeHtmlMiddleware = (req, res, next) => {
  const { contents } = req.body;

  try {
    if (!contents) {
      res.status(400).send({ msg: '내용이 없습니다.' });
    }
    const sanitizedCotents = sanitizeHtml(contents, sanitizeOption);

    req.body.contents = sanitizedCotents;

    next();
  } catch (e) {
    res.status(500).send({ msg: '서버 오류' });
  }
};

module.exports = sanitizeHtmlMiddleware;
