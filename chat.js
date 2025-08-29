// Needs: npm install openai dotenv

import 'dotenv/config';
import OpenAI from 'openai';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import fs from 'fs'

const filename = '~/.chat_log';
//fs.openSync(filename, 'a'); 
if (!fs.existsSync(filename)) fs.closeSync(fs.openSync(filename, 'w'));

function save(text) {
    fs.appendFile(filename, 'text\n\n', (err) => {
      if (err) throw err;
      console.log('Saved!');
    });
}

if (!process.env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY in .env');
  process.exit(1);
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const rl = readline.createInterface({ input, output });

const messages = [
  { role: 'system', content: 'You are a helpful assistant and as consise as possible' }
];

async function main() {
  console.log('Chatbot ready. Type "exit" to quit.');
  while (true) {
    const userText = await rl.question('You: ');
    if (!userText) continue;
    if (['exit', 'quit'].includes(userText.toLowerCase())) break;

    save("User: " + userText);
    messages.push({ role: 'user', content: userText });

    try {
      const completion = await client.chat.completions.create({
        model: 'gpt-4.1',
        messages,
        temperature: 0.7
      });

      const reply = completion.choices?.[0]?.message?.content ?? '(no reply)';
      save("Reply: " + reply);
      console.log('Bot:', reply);
      messages.push({ role: 'assistant', content: reply });
    } catch (err) {
      const msg = err?.response?.data || err?.message || String(err);
      console.error('Error:', msg);
    }
  }
  rl.close();
}

main();


// require('dotenv').config();
// const OpenAI = require('openai');
// const readline = require("readline");
//
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
//
// const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
// rl.setPrompt("You: ");
// rl.prompt();
//
// rl.on("line", async (input) => {
//   const res = await openai.chat.completions.create({
//     model: "gpt-5",
//     messages: [{ role: "user", content: input }]
//   });
//   console.log("Bot:", res.choices[0].message.content.trim());
//   rl.prompt();
// }); 

