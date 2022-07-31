import type { IFigure } from "./figures/Figure"
import type { Point } from "./Point"
import { EventEmitter } from 'events'
import { Circle } from "./figures/Circle"
import { Path } from "./figures/Path"
import { Rectangle } from "./figures/Rectangle"
import { FarvaterFigure, Rozetka } from "./figures/FarvaterFigure"

export type StageOptions = {
  root: HTMLElement
}

export enum StageEvent {FIGURE_SELECTED}

export class Stage extends EventEmitter {
  root?: HTMLElement
  canv: HTMLCanvasElement
  cx: CanvasRenderingContext2D
  isMouseDown: boolean = false
  movePoint: Point = {x: 0, y: 0}
  figures: IFigure[] = []
  selected: IFigure

  constructor (o: StageOptions) {
    super()
    Object.assign(this, o)
    let canv = document.createElement('canvas')
    canv.width = this.root.clientWidth
    canv.height = this.root.clientHeight
    this.canv = canv
    this.root.append(canv)
    this.cx = canv.getContext('2d')
    canv.addEventListener('mousedown', this.onMouseDown.bind(this))
    canv.addEventListener('mouseup', this.onMouseUp.bind(this))
    canv.addEventListener('mousemove', this.onMouseMove.bind(this))
  }

  findFugureByCords (x: number, y: number): IFigure {
    let figure: IFigure
    for (let i = this.figures.length - 1; i >= 0 ; i--) {
      let _figure = this.figures[i]
      let isIntersection = _figure.checkIntersection(x, y)
      if (_figure.selectable && isIntersection) {
        figure = _figure
        break
      }
    }
    return figure
  }

  getBackup () {
    let lst: any[] = []
    this.figures.forEach(_figure => {
      let data = _figure.getBackup()
      lst.push(data)
    })
    return lst
  }

  toJSON () {
    let backup = this.getBackup()
    return JSON.stringify(backup)
  }

  restore (data: string): void {
    let lst = JSON.parse(data)
    if (lst && lst instanceof Array) {
      let instances: {instance: IFigure, backup: any}[] = []
      lst.forEach(backup => {
        let instance: IFigure = Stage.restoreInstance(backup)
        if (instance) {
          this.add(instance)
          instances.push({instance, backup})
        }
      })
      instances.forEach(obj => {
        obj.instance.finishRestore(obj.backup)
      })
      this.update()
    }
  }

  static restoreInstance (backup: any): IFigure {
    let instance: IFigure
    let _class = this.getClassByType(backup.type)
    delete backup.type
    if (_class) {
      instance = Reflect.construct(_class, [{}, {}])
      instance.restore(backup)
    }
    return instance
  }

  static getClassByType (type: string) {
    let _className
    switch (type) {
      case 'Circle':
        _className = Circle
        break
      case 'Rectangle':
        _className = Rectangle
        break
      case 'Path':
        _className = Path
        break
      case 'Rozetka':
        _className = Rozetka
        break
      case 'FarvaterFigure':
        _className = FarvaterFigure
        break
    }
    return _className
  }

  updateSelected () {
    this.emit(StageEvent.FIGURE_SELECTED, this.selected)
  }

  onMouseDown (e: MouseEvent) {
    if (e.button == 0) {
      this.isMouseDown = true
      this.movePoint.x = e.offsetX
      this.movePoint.y = e.offsetY
      let oldSelected = this.selected
      this.selected = this.findFugureByCords(e.offsetX, e.offsetY)
      if (oldSelected != this.selected) {
        this.updateSelected()
      }
      if (this.selected) {
        this.selected.click(e.offsetX, e.offsetY)
      }
    }
  }

  onMouseUp (e: MouseEvent) {
    this.isMouseDown = false
  }

  onMouseMove (e: MouseEvent) {
    if (this.isMouseDown) {
      let offsetX = e.offsetX - this.movePoint.x
      let offsetY = e.offsetY - this.movePoint.y
      this.movePoint.x = e.offsetX
      this.movePoint.y = e.offsetY
      if (this.selected && this.selected.draggable) {
        this.selected.move(offsetX, offsetY)
        this.selected.updateBounds()
        this.update()
      }
    }
  }

  move (figure: IFigure): void {
    if (figure) {
      figure.move(0, -1)
      figure.updateBounds()
      this.update()
    }
  }

  add (figure: IFigure, draw: boolean = false, addInFigures: boolean = true): void {
    if (addInFigures) {
      this.figures.push(figure)
    }
    figure.addToStage(this)
    if (draw) {
      figure.draw()
      this.selected = figure
      this.updateSelected()
    }
  }

  getFigureByHash (hash: string): IFigure {
    let find: IFigure
    for (let _figure of this.figures) {
      if (_figure.getHash() == hash) {
        find = _figure
        break
      }
    }
    return find
  }

  remove (figure: IFigure, update: boolean = true): void {
    let isFind = false
    for (let i = 0; i < this.figures.length; i++) {
      let _figure = this.figures[i]
      if (figure === _figure) {
        this.figures.splice(i, 1)
        if (this.selected === _figure) {
          this.selected = null
          this.updateSelected()
        }
        isFind = true
        break
      }
    }
    if (isFind && update) {
      this.update()
    }
  }

  removeAll () {
    this.figures = []
    if (this.selected) {
      this.selected = null
      this.updateSelected()
    }
    this.clear()
  }

  update () {
    this.clear()
    this.draw()
  }

  draw () {
    this.figures.forEach(_figure => {
      _figure.draw()
    })
  }

  clear () {
    this.cx.clearRect(0, 0, this.canv.width, this.canv.height)
  }
}