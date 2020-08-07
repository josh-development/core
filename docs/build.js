const jsdoc2md = require('jsdoc-to-markdown');
const fs = require('fs');
const slug = require('limax');

var htmlEntities = {
  nbsp: ' ',
  cent: '¢',
  pound: '£',
  yen: '¥',
  euro: '€',
  copy: '©',
  reg: '®',
  lt: '<',
  gt: '>',
  quot: '"',
  amp: '&',
  apos: '\'',
};

// eslint-disable-next-line
const unescapeHTML = str => str.replace(/\&([^;]+);/g, (entity, entityCode) => {
  let match;

  if (entityCode in htmlEntities) {
    return htmlEntities[entityCode];
    /* eslint no-cond-assign: 0 */
  } else if (match = entityCode.match(/^#x([\da-fA-F]+)$/)) {
    return String.fromCharCode(parseInt(match[1], 16));
    /* eslint no-cond-assign: 0 */
  } else if (match = entityCode.match(/^#(\d+)$/)) {
    // eslint-disable-next-line
    return String.fromCharCode(~~match[1]);
  } else {
    return entity;
  }
});

const finalize = str => str
  .replace(/\[<code>Promise\.&lt;Josh&gt;<\/code >\](#Josh)/gi, '[<code>Promise.&lt;Josh&gt;</code>](#josh)')
  .replace(/\[<code>Josh<\/code>\]\(#Josh\)/gi, '[<code>Josh</code>](#josh)')
  .replace('* [new Josh([options])](#new_Josh_new)', '* [new Josh([options])](#new-josh-options)');

const regexread = /^ {4}\* \[\.(.*?)\]\((.*?)\)(.*?)(\(#.*?\)|)$/gm;

// eslint-disable-next-line
const parseData = data => finalize(data.replace(regexread, (_, b, __, d) =>
  `    * [.${b}](#${slug(`josh.${b} ${unescapeHTML(d.replace(/<\/?code>/g, ''))}`)})${d}`));

jsdoc2md.render({ files: './src/index.js' }).then(data =>
  fs.writeFile('./docs/api-docs.md',
    parseData(data),
    () => false));
