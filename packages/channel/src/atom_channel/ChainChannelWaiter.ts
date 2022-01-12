import { PromiseOut } from "@bfchain/util-extends-promise-out";
export class ChainChannelWaiter<CC extends BFChainCore.ChainChannel>
  extends PromiseOut<CC>
  implements BFChainCore.ChainChannelGroup.ChainChannelWaiter<CC>
{
  constructor(public readonly filter?: BFChainCore.ChainChannelGroup.Filter<CC>) {
    super();
  }
  match(cc: CC) {
    return this.filter === undefined /* 如果没有filter，返回true */ || this.filter(cc);
  }
}

export class ChainChannelWaiterQueue<CC extends BFChainCore.ChainChannel>
  implements BFChainCore.ChainChannelGroup.ChainChannelWaiterQueue<CC>
{
  private _queue = new Set<ChainChannelWaiter<CC>>();
  get size() {
    return this._queue.size;
  }
  enqueue(filter?: BFChainCore.ChainChannelGroup.Filter<CC>) {
    const waiter = new ChainChannelWaiter(filter);
    this._queue.add(waiter);
    return waiter;
  }
  dequeue(cc: CC) {
    for (const waiter of this._queue) {
      if (waiter.match(cc)) {
        waiter.resolve(cc);
        this._queue.delete(waiter);
        return waiter;
      }
    }
  }
}
