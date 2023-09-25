declare module '@isaacs/cliui' {
  interface DivOpts {
    padding?: number[]
    text?: string
    width?: number
  }
  export interface UI {
    div(...children: DivOpts[]): void
    toString(): string
  }
  export default function ui(options?: { width?: number }): UI
}
