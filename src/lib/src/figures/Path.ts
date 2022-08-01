import type { Point } from "../Point"
import { sortNums } from "../utils"
import { Figure, type FigureOptions, type FigureStyle } from "./Figure"

export type PathOptions = FigureOptions & {
  points?: Point[]
}

export class Path extends Figure {
  points?: Point[] = []

  constructor (o: PathOptions = {}, style?: FigureStyle) {
    super(o, style)
    this.points = o.points || []
    this.updateBounds()
  }

  getHash(): string {
    let pointsHash = this.points?.map(point => `${point.x}_${point.y}`)
    return `${super.getHash()}_${pointsHash}`
  }

  move(offsetX: number, offsetY: number): void {
    super.move(offsetX, offsetY)
    this.points.forEach(_point => {
      _point.x += offsetX
      _point.y += offsetY
    })
  }

  drawFigure (): void {
    let cx = this.stage.cx
    cx.moveTo(this.x, this.y)
    for (let i = 0; i < this.points.length; i++) {
      let _point = this.points[i]
      cx.lineTo(_point.x, _point.y)
    }
  }

  updateBounds (): void {
    // let end = this.points[0]
    // this.bounds = {
    //   start: {x: this.x, y: this.y},
    //   end: {x: end.x, y: end.y}
    // }
    let x = []
    let y = []
    this.points.forEach(_point => {
      x.push(_point.x)
      y.push(_point.y)
    })
    x.push(this.x)
    y.push(this.y)
    x.sort(sortNums)
    y.sort(sortNums)
    this.bounds = {
      start: {x: x[0], y: y[0]},
      end: {x: x[x.length - 1], y: y[y.length - 1]}
    }
  }

  getBackup(addFields = ['points']) {
    return super.getBackup(addFields)
  }
}