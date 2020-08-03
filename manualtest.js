// MANUAL TESTING FOR JOSH. HAVE FUN!
// INFO: https://www.youtube.com/watch?v=q-bs6Vj51d8
const readline = require('readline');
const Josh = require('./');
const JoshSQlite = Josh.providers.sqlite;

const clean = async (text) => {
  if (text && text.constructor.name == 'Promise') {
    text = await text;
  }
  if (typeof evaled !== 'string') {
    text = require('util').inspect(text, { depth: 1 });
  }
  return text;
};

const evalCode = async (code) => {
  try {
    const evaled = eval(code);
    return await clean(evaled);
  } catch (err) {
    return await clean(err);
  }
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const db = new Josh({
  name: 'testing',
  provider: JoshSQlite,
});

rl.on('line', async (input) => {
  await db.defer;
  console.log(`PROCESSING INPUT: ${input}`);
  const result = await evalCode(input);
  console.log(result);
});
