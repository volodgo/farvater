
import { fabric } from "fabric"
import type { ICircleOptions, IEvent, IObjectOptions } from "fabric/fabric-impl"

/* export default fabric.util.createClass(fabric.Rect, {
  type: 'rectElement',
  initialize: function (options: IObjectOptions) {
    options || (options = {})
    this.callSuper('initialize', options)
  }
}) */

let Rozetka = fabric.util.createClass(fabric.Circle, {
  type: 'rozetka',
  enabled: false,
  initialize: function (options: ICircleOptions & {enabled?: boolean}) {
    options || (options = {})
    this.callSuper('initialize', options)
  }
})

export class RectElement {
  rozLst: fabric.Circle[] = []
  group: fabric.Group

  constructor (onRozClick: Function) {
    let itemRect = new fabric.Rect({
      // top : 100,
      // left : 100,
      width: 100,
      height: 100,
      fill : 'red',
      hasBorders: false,
      hasControls: false,
      selectable: true
      // lockRotation: true,
      // hasRotatingPoint: false
    })
    // itemRect.on('mouseover', (e) => {
    //   this.rozLst.forEach(_roz => {
    //     _roz.set('stroke', 'rgba(0,0,0,0.5)')
    //   })
    //   this.group.canvas?.renderAll()
    // })
    // itemRect.on('mouseout', (e) => {
    //   this.rozLst.forEach(_roz => {
    //     _roz.set('stroke', 'rgba(0,0,0,0)')
    //   })
    //   this.group.canvas?.renderAll()
    // })
    let rozRadius = 5
    let rozOptions: ICircleOptions = {
      fill: 'rgba(0,0,0,0)',
      stroke: 'rgba(0,0,0,0.5)',
    }
    let roz1 = new Rozetka({
      ...rozOptions, left: itemRect.width / 2 - rozRadius, top: -rozRadius, radius: rozRadius,
    })
    /*
    let roz2 = new fabric.Circle({
      ...rozOptions, left: itemRect.width - rozRadius, top: itemRect.height / 2 - rozRadius, radius: rozRadius
    })
    let roz3 = new fabric.Circle({
      ...rozOptions, left: itemRect.width / 2 - rozRadius, top: itemRect.height - rozRadius, radius: rozRadius
    })
    let roz4 = new fabric.Circle({
      ...rozOptions, left: -rozRadius, top: itemRect.height / 2 - rozRadius, radius: rozRadius,
    }) */
    // roz4.on('mousemove', (e) => {
    //   console.log('roz4 over', e)
    // })
    // let _onRozClick = function (e: IEvent) {
      // let clickObj = this as fabric.Object
      // onRozClick(e.subTargets[0])
      // clickObj.set('fill', 'green')
      // clickObj.canvas?.renderAll()
    // }
    roz1.on('mousedown', onRozClick)
    this.rozLst = [roz1]
    
    this.group = new fabric.Group([itemRect, ...this.rozLst], {
      left: 50,
      top: 50,
      hasControls: false,
      subTargetCheck: true
    })
    this.group.on('mouse:move', (e) => {
      console.log('moved', e)
    })
    return this
  }
}