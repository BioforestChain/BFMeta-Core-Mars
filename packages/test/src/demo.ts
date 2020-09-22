// /// 浏览器平台
// // import sha256 from "sha.js";
// // import md5 from "md5.js";
// import { getBfchainCoreEntry } from "./include/init";
// const bfchainCore = getBfchainCoreEntry();

// (async function test() {
//   // const block = await bfchainCore.block.generateBlock(
//   //   CommonBlockFactory,
//   //   {
//   //     height: 10086,
//   //     timestamp: 10086,
//   //     generatorPublicKey: "generatorPublicKey",
//   //     previousBlock: "previousBlock",
//   //   },
//   //   {
//   //     remark: "asss",
//   //   },
//   //   {
//   //     [Symbol.asyncIterator]() {
//   //       return {
//   //         async next() {
//   //           return {
//   //             done: true,
//   //             value: {} as TransactionInBlock,
//   //           };
//   //         },
//   //       };
//   //     },
//   //   },
//   //   bfchainCore.keypairHelper.create("1"),
//   // );

//   console.log(await bfchainCore.accountBaseHelper.createSecretKeypair("1"));
// })().catch(console.error);

import { PromiseOut } from "@bfchain/util";
import { CoreExceptionGenerator } from "@bfchain/core-util-exception";
const { TimeOutException } = CoreExceptionGenerator("channel", "chainChannelHelper");
import { PromiseTimeout } from "@bfchain/core-channel/build/cjs/atom_channel/PromiseTimeout";

async function _requestWithBinaryData<T>(
  binary: string,
  options = { timeout: 2000, timeoutException: "aaaa" },
) {
  const req_task = new PromiseOut<Uint8Array>();
  req_task.onFinished(() => {
    console.log(`req_task finish `);
  });

  let resp = req_task.promise;

  if (options) {
    if (!options.timeout) {
      options.timeout = 1000;
    }
    // if (options.timeoutException === undefined) {
    //   options = Object.create(options, {
    //     timeoutException: {
    //       get() {
    //         return new TimeOutException(`ChainChannel Timeout: cmd:{cmd}`, {
    //           endpoint: this.endpoint,
    //         });
    //       },
    //     },
    //   }) as BFChainCore.ChannelRequestOptions<THIS>;
    // }
    resp = wrapAborterOptions(resp, options);
  }
  const res = await resp;
  // const res = await ResonseBoxer(await resp);
  //未统计信息创建的钩子
  return res;
}

function wrapAborterOptions<R, ENV = unknown>(
  resp: Promise<R>,
  options?: BFChainCore.AborterOptions<ENV>,
  env?: ENV,
) {
  const po = options && parserAborterOptions<R, ENV>(options, env as ENV);
  if (po) {
    resp.then(po.resolve, po.reject);
    resp = po.promise;
  }
  return resp;
}

function parserAborterOptions<R, ENV = unknown>(
  options: BFChainCore.AborterOptions<ENV>,
  env: ENV,
) {
  if (options.disabledAborterOptions) {
    return;
  }
  let po: PromiseTimeout<R> | undefined; // = new PromiseTimeout<R>();
  if (options.aborter) {
    po || (po = new PromiseTimeout<R>());
    // this._bindRejectedToPromiseOut(options.aborter.abortedPromise, po);
  }

  //#region 处理超时问题

  let sleepTime: number | undefined;
  /// 超时
  if (options.timeout !== undefined) {
    sleepTime = typeof options.timeout === "function" ? options.timeout(env) : options.timeout;
  }
  /// 截止
  // if (options.deadlineTime !== undefined) {
  //   const now = this.timeHelper.now();
  //   const diffTime = options.deadlineTime - now;
  //   if (sleepTime) {
  //     if (diffTime < sleepTime) {
  //       sleepTime = diffTime;
  //     }
  //   } else {
  //     sleepTime = diffTime;
  //   }
  // }
  /// 进行setTimeout等待
  if (sleepTime !== undefined) {
    const { reject } = po || (po = new PromiseTimeout<R>());
    po.setTimeout(sleepTime, () =>
      reject(
        typeof options.timeoutException === "function"
          ? options.timeoutException(env)
          : options.timeoutException || new TimeOutException(),
      ),
    );
  }
  //#endregion

  // if (options.rejected) {
  //   po || (po = new PromiseTimeout<R>());
  //   this._bindRejectedToPromiseOut(options.rejected, po);
  // }

  return po;
}
(async () => {
  try {
    _requestWithBinaryData("");
  } catch (err) {
    console.log(err);
  }
})();
