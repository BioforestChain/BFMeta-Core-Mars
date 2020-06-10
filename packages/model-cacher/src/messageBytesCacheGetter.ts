import type { Message } from "@bfchain/protobuf";
// const MESSAGE_BYTES_WM = new WeakMap<Message, Uint8Array>();

// export function getMessageBytes(message: Message) {
//   return (
//     MESSAGE_BYTES_WM.get(message) || message.$type.decode(message.$type.encode(message).finish())
//   );
// }

// export function setMessageBytes(message: Message, bytes: Uint8Array) {
//   MESSAGE_BYTES_WM.set(message, bytes);
// }

const MESSAGE_IN_ARGS_BYTES_WM = new WeakMap<Message, Map<string, Uint8Array>>();

interface GetBytesFunction extends CallableFunction {
  (...args: any[]): Uint8Array;
}
export function cacheBytesGetter<T extends GetBytesFunction>(
  target: any,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<T>,
) {
  if (!descriptor || typeof descriptor.value !== "function") {
    throw new TypeError(
      `Only methods can be decorated with @cacheBytesGetter. <${propertyKey}> is not a method!`,
    );
  }
  const source_fun = descriptor.value;
  const new_souce_fun = function (this: Message, ...args) {
    if (Object.isFrozen(this)) {
      const cache_key = JSON.stringify(args);
      let cacheMap = MESSAGE_IN_ARGS_BYTES_WM.get(this);
      if (!cacheMap) {
        cacheMap = new Map();
        MESSAGE_IN_ARGS_BYTES_WM.set(this, cacheMap);
      }
      let res = cacheMap.get(cache_key);
      if (!res) {
        res = source_fun.apply(this, args);
        cacheMap.set(cache_key, res);
      }
      return res;
    }
    const res = source_fun.apply(this, args);
    return res;
  } as typeof source_fun;
  descriptor.value = new_souce_fun;
  return descriptor;
}
