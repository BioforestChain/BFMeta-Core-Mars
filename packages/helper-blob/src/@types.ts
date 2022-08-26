declare namespace BFChainCore {
  interface BlobReader {
    has(hash: string): Promise<boolean>;
    open(hash: string): Promise<number>;
    state(fd: number): Promise<BlobMetadata>;
    read(fd: number, start?: number, end?: number): Promise<Uint8Array>;
    close(fd: number): Promise<void>;
  }
  type BlobMetadata = {
    /**类型 */
    contentType: string;
    /**大小 */
    size: number;
  };

  interface BlobWriter {
    /**
     * 申请存储，给定一个 总大小 与 分片大小
     * @param hash 最终的校验hash
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
    ): Promise<number>;
    /**
     * 保存分片数据
     * @param ptr 逻辑地址
     * @param index 分片下标
     * @param chunk 分片数据
     */
    saveChunk(ptr: number, index: number, chunk: Uint8Array): Promise<void>;
    /**
     * 保存成不可变的 Blob 对象
     * @param ptr 逻辑地址
     * @param contentType 类型
     * @returns 返回HASH值
     */
    saveAsBlob(ptr: number, contentType?: string): Promise<string>;

    /**
     * 将 Blob 移动到 永久区域或者临时区域
     * 文件默认都在临时区域
     */
    changeBlobStrategy(
      openArg: OpenBlobArgJSON,
      strategy: import("./blobHelper").STORAGE_STRATEGY,
    ): Promise<boolean>;
  }
}
