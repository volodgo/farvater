import { Figure, type FigureOptions, type FigureStyle } from "./Figure"
export type RectangleOptions = FigureOptions & {
  w?: number,
  h?: number
}

export class Rectangle extends Figure {
  w: number
  h: number

  constructor (o: RectangleOptions = {}, style?: FigureStyle) {
    super(o, style)
    this.w = o.w
    this.h = o.h
    this.updateBounds()
  }

  getHash(): string {
    return `${super.getHash()}_${this.w}_${this.h}`
  }

  drawFigure (): void {
    let cx = this.stage.cx
    cx.rect(this.x, this.y, this.w, this.h)
  }

  updateBounds (): void {
    this.bounds = {
      start: {x: this.x, y: this.y},
      end: {x: this.x + this.w, y: this.y + this.h}
    }
  }

  getBackup(addFields = ['w', 'h']) {
    return super.getBackup(addFields)
  }
  
}