// subset-font는 타입 선언을 함께 내려주지 않는다. 쓰는 범위만 적는다.
declare module 'subset-font' {
  export default function subsetFont(
    font: Buffer,
    text: string,
    options?: { targetFormat?: 'sfnt' | 'woff' | 'woff2' | 'truetype'; preserveNameIds?: number[] },
  ): Promise<Buffer>;
}
