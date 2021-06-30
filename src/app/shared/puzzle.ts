import { DES, enc } from 'crypto-js';

const NUM_PUZZLE = 5;
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

  console.log(secrets, keys, msgs);

  return { secrets, keys, msgs };
}

export function breakPuzzle(puzzles: any, keys: any) {
  let msgToBreak = Math.floor(Math.random() * NUM_PUZZLE);
  console.log(msgToBreak);
  let puzzle = puzzles[msgToBreak];
  console.log(puzzle);

  //   let array = new Array(300).fill(undefined);
  //   array.forEach((msg, index) => {
  //       setTimeout(() => {
  //         console.log(index);
  //       }, 1000 * index)
  //   })

  for (let i = 0; i < 500; i++) {
    setTimeout(() => {
      let key = window.crypto.getRandomValues(new Uint8Array(1)).join('');
      let msg = DES.decrypt(puzzle, i.toString()).toString(enc.Utf8);
      console.log(i, msg);
    });
  }

  //@ts-ignore
  //   keys.forEach((key) => {
  //     // setTimeout(() => {
  //       let msg = DES.decrypt(puzzle, key).toString(enc.Utf8);
  //       console.log(key, msg);
  //     // });
  //   });

  //   let error = true;
  //   do {
  //     // try {
  //       console.log('TRYING...');
  //       let key = window.crypto.getRandomValues(new Uint8Array(1)).join('');
  //       console.log(key);
  //       let msg = DES.decrypt(puzzle, key).toString(enc.Utf8);
  //       console.log(msg);
  //     //   error = false;
  //     // } catch (error) {
  //       console.log('ERROR');
  //       error = true;
  //     // }
  //   } while (error);
}

export function testDES() {
  let msg = DES.encrypt('HELLO WORLD', 'the cake is a lie');
  console.log(DES.decrypt(msg, 'the cake is a lie').toString(enc.Utf8));
}
