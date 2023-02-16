declare namespace BFChainCore {
  interface BlobReader {
    /**
     * blob 是否存在
     *
     * @param hash
     */
    has(hash: string): Promise<boolean>;
    /**
     * 打开 blob
     *
     * @param hash
     * @returns 返回一个逻辑地址的值
     */
    open(hash: string): Promise<string>;
    /**
     * 获取 blob 基础信息
     *
     * @param pointer 逻辑地址
     */
    state(pointer: string): Promise<BlobMetadata>;
    /**
     * 分片读取数据
     *
     * @param pointer 逻辑地址
     * @param start 开始位置
     * @param end 结束位置
     */
    read(pointer: string, start: number, end: number): Promise<Uint8Array>;
    /**
     * 关闭 blob
     *
     * @param pointer 逻辑地址
     */
    close(pointer: string): Promise<void>;
  }
  type BlobMetadata = {
    /**类型 */
    contentType: string;
    /**大小 */
    size: number;
  };
  type BlobMode = "read" | "write" | "readwrite";

  interface BlobWriter {
    /**
     * 申请存储，给定一个 总大小 与 分片大小
     *
     * @param hash 最终的校验 hash
     * @param totalSize 总大小
     * @param chunkSize 分片大小
     * @param contentType 参考的数据类型。可选，仅用于优化存储业务
     * @returns 返回一个逻辑地址的值
     */
    requestStorage(
      openArg: OpenBlobArgJSON,
      totalSize: number,
      chunkSize: number,
      contentType: string,
      strategy: import("./blobHelper").STORAGE_STRATEGY,
    ): Promise<string>;
    /**
     * 保存分片数据
     *
     * @param pointer 逻辑地址
     * @param index 分片下标
     * @param chunk 分片数据
     */
    saveChunk(pointer: string, index: number, chunk: Uint8Array): Promise<void>;
    /**
     * 保存成不可变的 Blob 对象
     *
     * @param pointer 逻辑地址
     * @param contentType 类型
     * @returns 返回 hash 值
     */
    saveAsBlob(pointer: string): Promise<string>;

    /**
     * 将 Blob 移动到 永久区域或者临时区域
     * 文件默认都在临时区域
     *
     * @param openArg
     * @param strategy
     */
    changeBlobStrategy(
      openArg: OpenBlobArgJSON,
      strategy: import("./blobHelper").STORAGE_STRATEGY,
    ): Promise<boolean>;
  }
}
