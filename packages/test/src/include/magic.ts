// 数组乱序
export function shuffle(arr: (string | number)[]) {
  let i = arr.length;
  while (i) {
    const j = Math.floor(Math.random() * i--);
    [arr[j], arr[i]] = [arr[i], arr[j]];
  }
  return arr;
}

export function getRandomMagic() {
  // 9 - 16
  const magicLength = 9 + Math.floor(Math.random() * 8);
  const words: (string | number)[] = [];
  for (let i = 0; i < 10; i++) {
    words[words.length] = i;
  }
  for (let i = 65; i < 91; i++) {
    words[words.length] = String.fromCharCode(i);
  }
  const randomWrods = shuffle(words);
  let newMagic = "";
  for (let i = 0; i < magicLength; i++) {
    newMagic += randomWrods[Math.floor(Math.random() * magicLength)];
  }
  return newMagic;
}
