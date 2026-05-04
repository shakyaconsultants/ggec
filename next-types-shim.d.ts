/** Shim: some Next.js versions emit imports from "next/types.js" without bundled .d.ts */
declare module "next/types.js" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type ResolvingMetadata = any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type ResolvingViewport = any;
}
