import type { Stage } from "../Stage"
import { sortNums } from "../utils"
import { Circle, type CircleOptions } from "./Circle"
import type { FigureStyle, IFigure } from "./Figure"
import { Path } from "./Path"
import { Rectangle, type RectangleOptions } from "./Rectangle"

export type FarvaterFigureOptions = RectangleOptions & {
  
}

export class RelateFigures {
  path: Path
  roz1: Rozetka
  roz2: Rozetka
  figure1: FarvaterFigure
  figure2: FarvaterFigure

  constructor (path: Path, roz1: Rozetka, roz2: Rozetka) {
    this.path = path
    this.roz1 = roz1
    this.roz2 = roz2
    this.figure1 = roz1.parent as FarvaterFigure
    this.figure2 = roz2.parent as FarvaterFigure
  }

  remove (): void {
    for (let i = 0; i < this.figure1.relates.length; i++) {
      let _relate = this.figure1.relates[i]
      if (_relate === this) {
        this.figure1.relates.splice(i--, 1)
        break
      }
    }
    for (let i = 0; i < this.figure2.relates.length; i++) {
      let _relate = this.figure2.relates[i]
      if (_relate === this) {
        this.figure2.relates.splice(i--, 1)
        break
      }
    }
    this.path.remove(false)
  }
}

export class Rozetka extends Circle {
  enabled: boolean = false
  constructor (o: CircleOptions, style?: FigureStyle) {
    super(o, style)
  }

  toggleEnabled () {
    this.enabled = !this.enabled
    this.style.fill = this.enabled ? '#bfd3ff' : '#000'
  }

  addRelate (roz2: Rozetka, path: Path) {
    
    // this.stage.add(path, false, false)
    let relateFigures = new RelateFigures(path, this, roz2)
    relateFigures.figure1.relates.push(relateFigures)
    relateFigures.figure2.relates.push(relateFigures)
  }

  isAllowRelate (roz2: Rozetka): boolean {
    let isAllow = true
    let roz1Figure = this.parent as FarvaterFigure
    let roz2Figure = roz2.parent as FarvaterFigure
    for (let _relate of roz1Figure.relates) {
      if ((_relate.figure1 === roz1Figure && _relate.figure2 === roz2Figure) || (_relate.figure1 === roz2Figure && _relate.figure2 === roz1Figure)) {
        isAllow = false
        break
      }
    }
    return isAllow
  }

  getRelate (roz2: Rozetka): RelateFigures {
    let relate = null
    let figure = this.parent as FarvaterFigure
    for (let _relate of figure.relates) {
      if ((_relate.roz1 === this && _relate.roz2 === roz2) || (_relate.roz1 === roz2 && _relate.roz2 === this)) {
        relate = _relate
        break
      }
    }
    return relate
  }
}

export class FarvaterFigure extends Rectangle {
  static tmpRelates: Rozetka[] = []

  relates: RelateFigures[] = []

  constructor (o: FarvaterFigureOptions = {}, style?: FigureStyle) {
    super(o, style)
    let rozStyle: FigureStyle = {fill: '#000'}
    let radius = 5
    this.childs = [
      new Rozetka({radius, x: this.x + this.w / 2, y: this.y, parent: this }, rozStyle),
      new Rozetka({radius, x: this.x + this.w, y: this.y + this.h / 2, parent: this }, rozStyle),
      new Rozetka({radius, x: this.x + this.w / 2, y: this.y + this.h, parent: this }, rozStyle),
      new Rozetka({radius, x: this.x, y: this.y + this.h / 2, parent: this }, rozStyle)
    ]
    this.updateBounds()
  }

  getBackup() {
    let backup = super.getBackup()
    backup.relates_hashs = []
    this.relates.forEach(_relate => {
      backup.relates_hashs.push({path: _relate.path.getHash(), roz1: _relate.roz1.getHash(), roz2: _relate.roz2.getHash(), figure1: _relate.figure1.getHash(), figure2: _relate.figure2.getHash()})
    })
    return backup
  }

  finishRestore (data: any) {
    super.finishRestore(data)
    data.relates_hashs.forEach(_relate => {
      let figure1 = this.stage.getFigureByHash(_relate.figure1)
      let figure2 = this.stage.getFigureByHash(_relate.figure2)
      let path = this.stage.getFigureByHash(_relate.path) as Path
      let roz1 = figure1.getChildByHash(_relate.roz1) as Rozetka
      let roz2 = figure2.getChildByHash(_relate.roz2) as Rozetka
      let currentRelate = roz1.getRelate(roz2)
      if (!currentRelate) {
        roz1.addRelate(roz2, path)
      }
    })
  }

  click(x: number, y: number): void {
    super.click(x, y)
    let roz: Rozetka
    for (let _child of this.childs) {
      let _roz = _child as Rozetka
      let isFind = _roz.checkIntersection(x, y)
      if (isFind) {
        _roz.toggleEnabled()
        roz = _roz
      } else if (_roz.enabled) {
        _roz.toggleEnabled()
      }
    }
    if (roz) {
      this.stage.update()
      this.updateRelates(roz)
    }
  }

  /**
   * Добавляем/Удаляем связи между фигурами
   * @param _roz 
   */
  updateRelates (_roz: Rozetka): void {
    // console.log('_roz', _roz)
    let _relates = FarvaterFigure.tmpRelates
    for (let i = 0; i < _relates.length; i++) {
      let roz = _relates[i]
      if (!roz.enabled) {
        _relates.splice(i--, 1)
      }
    }
    if (_roz.enabled) {
      _relates.push(_roz)
    }
    if (_relates.length > 1) {
      let [roz1, roz2] = _relates
      FarvaterFigure.tmpRelates = []
      roz1.toggleEnabled()
      roz2.toggleEnabled()
      let currentRelate = roz1.getRelate(roz2)
      // Есть уже связь по выбранным точкам, удаляем связь
      if (currentRelate) {
        currentRelate.remove()
      // Если у фигур нет связи, то добавляем
      } else if (roz1.isAllowRelate(roz2)) {
        let path = new Path({selectable: false, x: roz1.x, y: roz1.y, points: [{x: roz2.x, y: roz2.y}]}, {strokeWidth: 3})
        this.stage.add(path)
        roz1.addRelate(roz2, path)
      }
      this.stage.update()
    }
  }

  addToStage (stage: Stage): void {
    super.addToStage(stage)
    this.childs.forEach(_child => {
      _child.stage = stage
    })
  }

  draw(): void {
    super.draw()
    this.childs.forEach(_child => {
      _child.draw()
    })
    // Рисуем связь только от певой фигуры
    // this.relates.forEach(_relate => {
    //   if (_relate.figure1 === this) {
    //     _relate.path.draw()
    //   }
    // })
  }

  move(offsetX: number, offsetY: number): void {
    super.move(offsetX, offsetY)
    this.childs.forEach(_child => {
      _child.move(offsetX, offsetY)
    })
    this.relates.forEach(_relate => {
      if (_relate.figure1 === this) {
        _relate.path.x += offsetX
        _relate.path.y += offsetY
      } else {
        let lastPoint = _relate.path.points[_relate.path.points.length - 1]
        lastPoint.x += offsetX
        lastPoint.y += offsetY
      }
    })
  }

  remove(update?: boolean): void {
    while (this.relates.length) {
      this.relates[0].remove()
    }
    super.remove(update)
  }

  updateBounds (): void {
    if (this.childs && this.childs.length) {
      let x = []
      let y = []
      this.childs.forEach(_child => {
        _child.updateBounds()
        x.push(_child.bounds.start.x, _child.bounds.end.x)
        y.push(_child.bounds.start.y, _child.bounds.end.y)
      })
      x.push(this.x, this.x + this.w)
      y.push(this.y, this.y + this.h)
      x.sort(sortNums)
      y.sort(sortNums)
      this.bounds = {
        start: {x: x[0], y: y[0]},
        end: {x: x[x.length - 1], y: y[y.length - 1]}
      }
    } else {
      super.updateBounds()
    }
  }
}