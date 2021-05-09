import { CoreExceptionGenerator } from "@bfchain/core-util-exception";

const { error } = CoreExceptionGenerator("channel", "IntSet");

export class IntSet {
  constructor(
    /**从小到大的数字集合，可以是无穷大 */
    private _src: Iterable<number>,
  ) {}
  private _end = Infinity;
  private _maybeEnd = -Infinity;
  setEnd(num: number) {
    this._end = num;
    this._maybeEnd = num;
  }
  private _srcIte = this._src[Symbol.iterator]();
  private _cachedSrcNext?: IteratorResult<number>;
  private _previewSrcNext() {
    const next = this._cachedSrcNext || (this._cachedSrcNext = this._srcIte.next());
    if (next.done === false) {
      return (this._maybeEnd = next.value);
    }
    /// 迭代器完结，保存终点值
    this._end = this._maybeEnd;
  }
  private _srcNext() {
    const nextInt = this._previewSrcNext();
    if (nextInt !== undefined) {
      this._cachedSrcNext = undefined;
    }
    return nextInt;
  }

  /**获取连续的一串数字 */
  getSerial(maxCount: number) {
    let start = -Infinity;
    let length = 0;
    const rubIte = this._rl[Symbol.iterator]();
    let rubItem = rubIte.next();
    /// 先从垃圾队列中读取
    if (rubItem.done === false) {
      start = rubItem.value;
      length = 1;
      if (length >= maxCount) {
        return { start, length };
      }

      delete this._rl[start];

      do {
        rubItem = rubIte.next();
        if (rubItem.done) {
          break;
        }
        /// 寻找连续的数字
        const nextNum = rubItem.value;
        if (nextNum - length === start) {
          delete this._rl[nextNum];
          ++length;
          if (length >= maxCount) {
            return { start, length };
          }
        } else {
          /// 如果rl没有遍历完，但发现了不连续的数字，那么可以直接返回了，因为srcNext一定比rub的大
          return { start, length };
        }
      } while (true);
    }

    /// 从源头队列中读取
    if (start === -Infinity) {
      const nextNum = this._srcNext();
      if (nextNum === undefined) {
        return;
      }
      start = nextNum;
      length = 1;
      if (length >= maxCount) {
        return { start, length };
      }
    }
    do {
      const nextNum = this._previewSrcNext();
      if (nextNum === undefined) {
        return { start, length };
      }
      if (nextNum - length === start) {
        /// 使用掉缓存
        this._cachedSrcNext = undefined;
        ++length;
        if (length >= maxCount) {
          // 收集够了
          break;
        }
      } else {
        // 遇上不连续的了，留着缓存，直接返回即可
        break;
      }
    } while (true);
    return { start, length };
  }

  /**获取一定数量的数字 */
  getSet(count: number) {
    let accCount = 0;
    const result = [];
    do {
      const item = this.getSerial(count);
      if (item === undefined) {
        break;
      }
      result[result.length] = item;
      accCount += item.length;
      if (accCount >= count) {
        break;
      }
    } while (true);
    return result;
  }

  //#region 回收

  private _rl = [] as number[];

  /**回收数字 */
  recycle(num: number) {
    if (Number.isInteger(num) === false) {
      error("num:%o is not an integer", num);
      return;
    }
    const srcNext = this._previewSrcNext();
    if (srcNext !== undefined) {
      if (num > srcNext) {
        error("num:%d large then the next integer:%d", num, this._end);
        return;
      }
    } else {
      if (num > this._end) {
        error("num:%d large then the end:%d", num, this._end);
        return;
      }
    }

    this.recycleUnSafe(num);
  }
  /**不校验，直接写入 */
  recycleUnSafe(num: number) {
    this._rl[num] = num;
  }
  /**不校验，批量写入 */
  recycleManyUnsafe(nums: Iterable<number>) {
    for (const num of nums) {
      this._rl[num] = num;
    }
  }

  //#endregion
}
