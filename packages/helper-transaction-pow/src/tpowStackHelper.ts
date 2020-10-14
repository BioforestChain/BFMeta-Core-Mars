import { Injectable } from "@bfchain/util";

@Injectable()
export class TPOWStackHelper<T> {
  private store: T[] = [];

  /**
   * 入栈
   *
   * @param element
   */
  push(element: T) {
    this.store.push(element);
  }

  /**
   * 栈顶元素出栈
   *
   */
  pop() {
    return this.store.pop();
  }

  /**
   * 获取栈顶元素
   *
   */
  peek() {
    return this.store[this.store.length - 1];
  }

  /**
   * 是否空栈
   *
   */
  isEmpty() {
    return this.store.length === 0;
  }

  /**
   * 获取栈长度
   *
   */
  size() {
    return this.store.length;
  }

  /**
   * 清栈
   *
   */
  clear() {
    this.store = [];
  }
}
