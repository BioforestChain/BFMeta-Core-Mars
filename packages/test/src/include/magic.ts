import { PARITY_BIT_MAPPING, BFChainCore } from "@bfchain/core";

// 数组乱序
export function shuffle(arr: (string | number)[]) {
  let i = arr.length;
  while (i) {
    const j = Math.floor(Math.random() * i--);
    [arr[j], arr[i]] = [arr[i], arr[j]];
  }
  return arr;
}

function calcParityBit(magic: string) {
  let sumMagic = 0;
  for (let i = 0; i < magic.length; i++) {
    sumMagic += magic.charCodeAt(i);
  }
  return sumMagic % 36;
}

function getRandomString(strLength: number) {
  // magic 4 位
  const words: (string | number)[] = [];
  for (let i = 0; i < 10; i++) {
    words[words.length] = i;
  }
  for (let i = 65; i < 91; i++) {
    words[words.length] = String.fromCharCode(i);
  }
  const randomWrods = shuffle(words);
  let newMagic = "";
  for (let i = 0; i < strLength; i++) {
    newMagic += randomWrods[Math.floor(Math.random() * strLength)];
  }
  const parityBitCode = calcParityBit(newMagic);
  const mapKey = `P_${parityBitCode}` as BFChainCore.PARITY_BIT_MAPPING;
  newMagic += PARITY_BIT_MAPPING[mapKey];
  return newMagic;
}

export function getRandomMagic() {
  return getRandomString(4);
}

export function getRandomDAppid() {
  return getRandomString(7);
}

// export function getRandomMagic() {
//   // 9 - 16
//   const magicLength = 9 + Math.floor(Math.random() * 8);
//   const words: (string | number)[] = [];
//   for (let i = 0; i < 10; i++) {
//     words[words.length] = i;
//   }
//   for (let i = 65; i < 91; i++) {
//     words[words.length] = String.fromCharCode(i);
//   }
//   const randomWrods = shuffle(words);
//   let newMagic = "";
//   for (let i = 0; i < magicLength; i++) {
//     newMagic += randomWrods[Math.floor(Math.random() * magicLength)];
//   }
//   return newMagic;
// }
