import type { Message } from "@bfchain/protobuf";
import type { StringKeyMap } from "@bfchain/core-model-common";

export function assetStatisticformat<T extends Message>(
  hashMap: { [assetType: string]: T },
  resultMap: StringKeyMap<T>,
  onValue: (argv: T) => T,
) {
  const results: {
    sortKey: string;
    value: T;
  }[] = [];
  for (const key in hashMap) {
    results[results.length] = {
      sortKey: key,
      value: onValue(hashMap[key]),
    };
  }
  results.sort((a, b) => (a.sortKey > b.sortKey ? 1 : -1));
  resultMap.clear();
  for (const result of results) {
    resultMap.set(result.sortKey, result.value);
  }
  return resultMap;
}
