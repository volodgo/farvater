<script setup lang="ts">
import { onMounted, ref, toRaw } from "vue"
import { Stage, StageEvent } from "./lib/Stage"
import type { IFigure } from './lib/figures/Figure'
import { FarvaterFigure } from './lib/figures/FarvaterFigure'

let rootEl = ref(null)
let stage: Stage
let selected = ref(null)

onMounted(() => {
  init()
})

function init () {
  stage = new Stage({root: rootEl.value})
  stage.on(StageEvent.FIGURE_SELECTED, (_figure) => {
    selected.value = _figure
  })
}



let onClickSave = (e) => {
  let data = stage.toJSON()
  window.localStorage.setItem('figures', data)
  M.toast({html: 'Сохранено!', displayLength: 1000, classes: 'orange darken-1'})
}

let onClickLoad = (e) => {
  let localStorage = window.localStorage
  let data = localStorage.getItem('figures')
  stage.removeAll()
  stage.restore(data)
}

let onClickAddElement = (e) => {
  let farvaterFigure = new FarvaterFigure({x: 150, y: 150, w: 100, h: 70}, {strokeColor: 'blue', strokeWidth: 2, fill: '#FFFFFF', opacity: 0.5})
  stage.add(farvaterFigure, true)
}
let onClickDeleteElement = (e) => {
  let _figure: IFigure = selected.value
  _figure.remove()
}

let onClearStage = (e) => {
  stage.removeAll()
}

</script>
<template>
  <main>
    <div class="controlsPanel">
      <button class="btn" @click="onClickAddElement"><i class="material-icons left">add</i>Добавить фигуру</button>
      <button class="btn" @click="onClickDeleteElement" :disabled="!selected"><i class="material-icons left">remove</i>Удалить фигуру</button>
      <button class="btn" @click="onClearStage"><i class="material-icons left">layers_clear</i>Очистить холст</button>
      <button class="btn" @click="onClickSave"><i class="material-icons left">cloud_upload</i>Сохранить</button>
      <button class="btn" @click="onClickLoad"><i class="material-icons left">cloud_download</i>Загрузить</button>
    </div>
    <div ref="rootEl" class="stage"></div>
  </main>
</template>

<style>
  div.stage {
    width: 100%;
    height: 400px;
    background: #EEE;
  }
  .controlsPanel {
    display: flex;
  }
</style>
