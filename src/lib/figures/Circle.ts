import { Figure, type FigureOptions, type FigureStyle } from "./Figure"
export type CircleOptions = FigureOptions & {
  radius?: number
}

export class Circle extends Figure {
  // type = 'circle'
  radius: number
  constructor (o: CircleOptions = {}, style?: FigureStyle) {
    super(o, style)
    this.radius = o.radius
    this.updateBounds()
  }

  getHash(): string {
    return `${super.getHash()}_${this.radius}`
  }

  drawFigure (): void {
    let cx = this.stage.cx
    cx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true)
  }

  updateBounds (): void {
    this.bounds = {
      start: {x: this.x - this.radius, y: this.y - this.radius},
      end: {x: this.x + this.radius, y: this.y + this.radius}
    }
  }

  getBackup(addFields = ['radius']) {
    return super.getBackup(addFields)
  }
}