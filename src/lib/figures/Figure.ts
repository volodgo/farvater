import { EventEmitter } from "events"
import type { Point } from "../Point"
import { Stage } from "../Stage"
import { objFilter } from '../utils'


export type FigureOptions = {
  x?: number
  y?:number
  draggable?: boolean
  selectable?: boolean
  parent?: IFigure
}

export type FigureStyle = {
  fill?: string
  strokeColor?: string
  opacity?: number
  strokeOpacity?: number
  strokeWidth?: number
  dashArray?: string
}

export interface IFigure {
  getChildByHash (hash: string): IFigure
  getHash (): string
  getBackup (addFields: string[]): void
  restore (data: object): void
  finishRestore (data: object): void
  set (data: object, update: boolean): void
  click(x: number, y: number): void
  addToStage(stage: Stage): void
  checkIntersection(x: number, y: number): boolean
  move(offsetX: number, offsetY: number): void
  remove(): void
  childs?: IFigure[]
  parent?: IFigure
  draggable?: boolean
  selectable?: boolean
  bounds?: Bounds
  stage?: Stage
  draw(): void
  drawFigure(): void
  updateBounds(): void
}

export type Bounds = {
  start: Point
  end: Point
}

export class Figure extends EventEmitter implements IFigure {
  // type: string = 'figure'
  childs?: IFigure[]
  parent?: IFigure
  draggable?: boolean = true
  selectable?: boolean = true
  bounds?: Bounds
  stage?: Stage
  style: FigureStyle = {fill: '#bfd3ff', strokeColor: '#4e62ec', opacity: 0.7, strokeOpacity: 1, strokeWidth: 1, dashArray: 'none'}
  x: number
  y: number

  constructor (o?: FigureOptions, style?: FigureStyle) {
    super()
    this.x = o.x
    this.y = o.y
    this.draggable = (o.draggable != undefined) ? o.draggable : this.draggable
    this.selectable = (o.selectable != undefined) ? o.selectable : this.selectable
    this.parent = o?.parent
    this.style = {...this.style, ...style}
  }

  getHash (): string {
    return `${this.constructor.name}_${this.x}_${this.y}`
  }

  click(x: number, y: number): void {
    // console.log('click', x, y)
  }

  set (data: object, update: boolean = false): void {
    for (let key in data) {
      let value = data[key]
      if (key in this) {
        this[key] = value
      }
    }
    this.updateBounds()
    if (update) {
      this.stage?.update()
    }
  }

  restore (data: any): void {
    if (data.childs) {
      let childs: IFigure[] = []
      data.childs.forEach(_child => {
        let childInstance = Stage.restoreInstance(_child)
        childs.push(childInstance)
        childInstance.parent = this
      })
      this.childs = childs
      delete data.childs
    }
    // delete data.hash
    this.set(data, false)
  }

  finishRestore (data: any): void {
    // console.log('finishRestore')
  }

  getChildByHash (hash): IFigure {
    let find: IFigure
    for (let _child of this.childs) {
      if (_child.getHash() == hash) {
        find = _child
        break
      }
    }
    return find
  }

  getBackup (addFields: string[] = []) {
    let fields = ['selectable', 'draggable', 'style', 'x', 'y', ...addFields]
    let data: any = objFilter(this, fields)
    data.type = this.constructor.name
    data.hash = this.getHash()
    if (this.childs) {
      let childs = []
      this.childs.forEach(_child => {
        childs.push(_child.getBackup())
      })
      data.childs = childs
    }
    return data
  }

  addToStage(stage: Stage): void {
    this.stage = stage
  }

  remove(update: boolean = true): void {
    this.stage.remove(this, update)
  }

  move(offsetX: number, offsetY: number): void {
    this.x += offsetX
    this.y += offsetY
  }

  updateBounds(): void {
    throw new Error("Method not implemented.")
  }

  drawFigure(): void {
    throw new Error("Method not implemented.")
  }

  applyStyles (): void {
    let cx = this.stage.cx
    cx.strokeStyle = this.style.strokeColor
    cx.fillStyle  = this.style.fill
    cx.lineWidth = this.style.strokeWidth
    cx.globalAlpha = this.style.opacity
  }

  draw(): void {
    let cx = this.stage.cx
    this.applyStyles()
    // this.updateBounds()
    cx.beginPath()
    this.drawFigure()
    cx.stroke()
    cx.fill()
    
  }

  checkIntersection (x: number, y: number): boolean {
    let bounds = this.bounds
    return (bounds.start.x <= x && x <= bounds?.end.x && bounds.start.y <= y && y <= bounds?.end.y)
  }
}