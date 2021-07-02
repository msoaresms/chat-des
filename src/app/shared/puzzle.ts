import { DES, enc } from 'crypto-js';

const NUM_PUZZLE = 150;
const SUFIX = '000000000000000000000';

export function generatePuzzles() {
  let secrets = new Array(NUM_PUZZLE).fill(undefined);
  let keys = new Array(NUM_PUZZLE).fill(undefined);
  let msgs = new Array(NUM_PUZZLE).fill(undefined);

  for (let i = 0; i < NUM_PUZZLE; i++) {
    let secret = window.crypto.getRandomValues(new Uint32Array(1)).join('');
    let key = window.crypto.getRandomValues(new Uint8Array(1)).join('');

    let msg = DES.encrypt(`${SUFIX}${secret}`, key);

    secrets[i] = secret;
    keys[i] = key;
    msgs[i] = msg;
  }
  return { secrets, keys, msgs };
}

export function breakPuzzle(puzzles: any) {
  let msgToBreak = Math.floor(Math.random() * NUM_PUZZLE);
  let puzzle = puzzles[msgToBreak];

  let i = 0;
  let found = false;
  let msg = '';
  do {
    try {
      msg = DES.decrypt(puzzle, i.toString()).toString(enc.Utf8);
      if (msg.includes(SUFIX)) found = true;
    } catch (error) {}
    i++;
  } while (!found);
  return msg;
}

export function testDES() {
  let msg = DES.encrypt('HELLO WORLD', 'the cake is a lie');
  console.log(DES.decrypt(msg, 'the cake is a lie').toString(enc.Utf8));
}
