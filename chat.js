// Needs: npm install openai dotenv

import os from 'os';
import 'dotenv/config';
import OpenAI from 'openai';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import fs from 'fs'

const homedir = os.homedir();
const filename = homedir + '/.chat_log';
try {
  const fd = fs.openSync(filename, 'a');
  fs.closeSync(fd);
} catch (err) {
  console.error('Error opening file: ', err);
}

function save(text) {
    fs.appendFile(filename, text + "\n\n", (err) => {
      if (err) throw err;
    });
}

if (!process.env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY in .env');
  process.exit(1);
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const rl = readline.createInterface({ input, output });

rl.on('close', () => {
  console.log('Exiting...');
  rl.close();
  process.exit(0);
});

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('end', () => {
  console.log('Ctrl+D was pressed (EOF received)');
  rl.close()
  client.close() 
  process.exit();
}); 

process.on('SIGINT', async () => {
  console.log('Cleaning up...');
  rl.close()
  client.close() 
  process.exit();
});

process.on('SIGTERM', async () => {
  console.log('Cleaning up...');
  rl.close()
  client.close() 
  process.exit();
}); 


const messages = [
  { role: 'system', content: 'You are a helpful assistant and as consise as possible' }
];

async function main() {
  // console.log('Chatbot ready. Type "exit" to quit.');
  while (true) {
    const userText = await rl.question('Query: ');
    // if (!userText) continue;
    if (['exit', 'quit', ''].includes(userText.toLowerCase())) break;

    save("User: " + userText);
    messages.push({ role: 'user', content: userText });

    try {
      const completion = await client.chat.completions.create({
        model: 'gpt-4.1',
        messages,
        temperature: 0.7
      });

      const reply = completion.choices?.[0]?.message?.content ?? '(no reply)';
      save("Assistant: " + reply);
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
