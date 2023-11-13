import Button from "./Button.js"
import Input from "./Input.js"
import Component from "./Component.js"
import Label from "./Label.js"
import { Vector } from "./Math.js"
import EventHandler from "./EventHandler.js"
import ObjectHelper from "./Helpers/ObjectHelper.js"
import ArrayHelper from "./Helpers/ArrayHelper.js"
import DataFrameRegistry from "./DataFrameRegistry.js"

export default class SimpleDataFrame extends EventHandler {
  static events = {
    refresh: "refresh",
    valueChange: "valueChange",
  }
  constructor(rowNames) {
    super()
    this.df = []
    this.df.push(rowNames)
    this.fontSize = 0.6
    this.maxsize = {
      imagine: new Vector(),
      real: new Vector(),
    }
    this.options = {
      showRowNames: true,
      isVertical: false,
      allowEditing: false,
      allowSorting: true,
    }
    this.sorted = {
      row: "fuck u",
      ascending: false,
    }
    this.name = ""
    this.cellDecoration = {}
  }
  copy() {
    console.error("Cant copy dataframe yet")
  }
  loadOptions(options = {}) {
    this.options = ObjectHelper.merge(this.options, options)
    this.applyRightOverflow()
    return this
  }
  setCellDecoration(decoration) {
    this.cellDecoration = decoration
    if (this.table) this.refreshTable()
    return this
  }

  isEmpty() {
    return this.df[1] == undefined
  }

  addArray(array) {
    for (const value of array) {
      if (!this.addDictionary(value)) {
        this.df.push(array)
        break
      }
    }
    if (this.table) this.refreshTable()
    return this
  }
  addDictionary(dict) {
    if (!Array.isArray(dict) && dict instanceof Object) {
      let arr = []
      for (const row of this.df[0]) {
        arr.push(ObjectHelper.get(dict, row, undefined))
      }
      this.df.push(arr)
      return true
    } else return false
  }
  createTable() {
    this.table = new Component()
    this.table._defaultSetSize = this.table.setSize
    this.table.addEventListener(Component.events.build, () => {
      this.table.getContainer().style.overflow = "auto"
    })
    this.table.setSize = (x, y) => {
      this.table._defaultSetSize(x, y)

      this.maxsize = {
        imagine: new Vector(x, y),
      }
      this.maxsize.real = this.table.calculateSize(this.maxsize.imagine)

      return this.table
    }
    this.table.addEventListener(Component.events.resizeEnd, () => {
      this.maxsize.real = this.table.calculateSize(this.maxsize.imagine)
    })
    this.applyRightOverflow()
    /**
     * @type {Component[][]}
     */
    this.tableComponents = [[]]
    // this.table.setContextMenu(this.createContextMenu())
  }

  applyRightOverflow() {
    if (this.table) {
      if (this.table.isBuilt) {
        if (this.options.isVertical) {
          this.table.getContainer().style.overflowX = "hidden"
          this.table.getContainer().style.overflowY = "auto"
        } else {
          this.table.getContainer().style.overflowY = "hidden"
          this.table.getContainer().style.overflowX = "auto"
        }
      } else {
        this.table.addEventListener(
          Component.events.build,
          () => {
            this.applyRightOverflow()
          },
          undefined,
          { once: true }
        )
      }
    }
  }

  // createContextMenu() {
  //   let contextMenu = new Component()
  //     .setSize(2, 3)
  //     .setDecoration(Styles.Button.menu)
  //   return contextMenu
  // }
  getWidth() {
    return this.isEmpty() ? 0 : this.df[0].length
  }
  getHeight() {
    return this.df.length
  }
  applySorting() {
    let rowIndex = this.df[0].indexOf(this.sorted.row)
    if (rowIndex == -1) return
    if (this.sorted.ascending)
      this.df = [this.df[0]].concat(
        this.df.slice(1).sort((a, b) => (a[rowIndex] > b[rowIndex] ? 1 : -1))
      )
    else
      this.df = [this.df[0]].concat(
        this.df.slice(1).sort((a, b) => (a[rowIndex] < b[rowIndex] ? 1 : -1))
      )
  }

  sortByRow(row) {
    let ascending = true
    if (row == this.sorted.row) {
      ascending = !this.sorted.ascending
    }

    this.sorted.row = row
    this.sorted.ascending = ascending
    this.applySorting()
  }
  getColumn(name) {
    let index = this.df[0].indexOf(name)
    if (index == -1) return []
    let result = []
    for (let i = 1; i < this.getHeight(); i++) {
      result.push(this.df[i][index])
    }
    return result
  }

  refreshTable() {
    if (this.table == undefined) this.createTable()

    let rowWidths = this.getCellBuildingInfo()
    let tableLength =
      (ArrayHelper.sum(rowWidths) + rowWidths.length) * this.fontSize * 0.5

    let tableHeight =
      this.fontSize *
      1.25 *
      (this.options.isVertical
        ? this.getHeight() - !this.options.showRowNames
        : this.getWidth())

    this.table._defaultSetSize(
      this.maxsize.real.x > 0
        ? Math.min(this.maxsize.real.x, tableLength + 0.5)
        : tableLength + 0.5,
      this.maxsize.real.y > 0
        ? Math.min(this.maxsize.real.y, tableHeight) +
            (this.maxsize.real.x < tableLength ? 0.5 : 0)
        : tableHeight
    )

    if (!this.options.showRowNames && !this.options.isVertical)
      rowWidths = [0].concat(rowWidths)

    let accumulatedWidth = 0
    for (let i = +!this.options.showRowNames; i < this.getHeight(); i++) {
      if (this.tableComponents[i] == undefined)
        this.tableComponents[i] = new Array()
      if (this.options.isVertical) accumulatedWidth = 0
      for (let j = 0; j < this.getWidth(); j++) {
        if (this.tableComponents[i][j] == undefined) {
          if (i == 0) {
            this.tableComponents[i][j] = new Button().attachToParent(this.table)
            this.tableComponents[i][j].addEventListener(
              Component.events.mousedown,
              () => {
                if (this.options.allowSorting) {
                  this.sortByRow(this.df[i][j].toString())
                  this.refreshTable()
                }
              }
            )
          } else {
            this.tableComponents[i][j] = new Label()
              .attachToParent(this.table)
              .setPointerEvents(true)

            this.tableComponents[i][j].addEventListener("mousedown", () => {
              if (this.options.allowEditing) {
                let input = new Input()
                  .setSizeEqualToParent()
                  .attachToParent(this.tableComponents[i][j])

                setTimeout(function () {
                  input.focus()
                }, 50)

                input.addEventListener("blur", () => {
                  this.tableComponents[i][j].removeComponent(input)
                  let value = input.getValue()
                  if (value != "") {
                    this.setValue(input.getValue(), i - 1, j, 0)
                    this.applySorting()
                    this.refreshTable()
                  }
                })
              }
            })
          }
        }
        this.refreshCell(i, j)
        this.tableComponents[i][j]
          .setDecoration(this.cellDecoration)
          .setColor?.("white")
        if (this.options.isVertical) {
          this.tableComponents[i][j]
            .setPosition(
              accumulatedWidth,
              (i - +!this.options.showRowNames) * this.fontSize * 1.25
            )
            .setSize(
              (rowWidths[j] + 1) * this.fontSize * 0.5,
              this.fontSize * 1.25
            )
            .centerText?.()
        } else {
          this.tableComponents[i][j]
            .setPosition(accumulatedWidth, j * this.fontSize * 1.25)
            .setSize(
              (rowWidths[i] + 1) * this.fontSize * 0.5,
              this.fontSize * 1.25
            )
            .centerText?.()
        }

        if (this.options.isVertical)
          accumulatedWidth += (rowWidths[j] + 1) * this.fontSize * 0.5
      }
      if (!this.options.isVertical)
        accumulatedWidth += (rowWidths[i] + 1) * this.fontSize * 0.5
    }
    this.dispatchEvent(SimpleDataFrame.events.refresh)
    return this
  }
  setFontSize(size) {
    this.fontSize = size
    if (this.table) this.refreshTable()
    return this
  }
  addColumn(name, data = []) {
    for (let i = 0; i <= data.length; i++) {
      if (this.df[i] == undefined) this.df[i] = []
      this.df[i].push(i == 0 ? name : data[i - 1])
    }
    return this
  }
  addRow(array) {
    this.df.push(array)
    return this
  }

  getRow(i) {
    return this.df[i + 1]
  }

  getValue(i, j) {
    return this.df.at(i + 1)?.at(j)
  }
  /**
     Refresh layers:
     0 - dont refresh anything
     1 - refresh single cell
     2 - refresh entire table
     */
  setValue(value, row, column, refreshLayer = 0) {
    this.df[row + 1][column] = value
    if (this.table) {
      switch (refreshLayer) {
        case 1:
          this.refreshCell(row + 1, column)
          break
        case 2:
          this.refreshTable()
          break
      }
    }
    this.dispatchEvent(Component.events.valueChange, {
      newValue: value,
      at: new Vector(row, column),
    })
  }

  refreshCell(i, j) {
    this.tableComponents[i][j]
      .setFontSize(this.fontSize)
      .setText(
        this.df[i][j].toString(),
        undefined,
        undefined,
        undefined,
        undefined,
        true
      )
  }

  getCellBuildingInfo() {
    let rowWidths = []
    if (this.options.isVertical) {
      for (let i = 0; i < this.getWidth(); i++) {
        let rowMax = 0
        for (let j = +!this.options.showRowNames; j < this.getHeight(); j++) {
          if (rowMax < (this.df[j][i] + "").length) {
            rowMax = (this.df[j][i] + "").length
          }
        }
        rowWidths.push(rowMax)
      }
    } else {
      for (let i = +!this.options.showRowNames; i < this.getHeight(); i++) {
        let rowMax = 0
        for (let j = 0; j < this.getWidth(); j++) {
          if (rowMax < (this.df[i][j] + "").length) {
            rowMax = (this.df[i][j] + "").length
          }
        }
        rowWidths.push(rowMax)
      }
    }
    return rowWidths
  }

  getTable() {
    if (this.table == undefined) this.createTable()
    return this.table
  }
  saveAsCSV(filename = "table", captions = true) {
    if (this.isEmpty()) return false
    let rows = []
    for (let i = 1 - captions; i < this.df.length; i++) {
      let columns = []
      for (let j = 0; j < this.df[i].length; j++) {
        columns.push('"' + this.df[i][j].toString() + '"')
      }
      let row = columns.join(",")
      rows.push(row)
    }

    let csvString = rows.join("\n")

    let blob = new Blob([csvString], { type: "text/csv" })

    let url = URL.createObjectURL(blob)
    let downloadLink = document.createElement("a")
    downloadLink.href = url
    downloadLink.download = `${filename}.csv`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    return true
  }
  saveAsTXT(filename = "table", captions = true) {
    if (this.isEmpty()) return false
    let rows = []
    for (let i = 1 - captions; i < this.df.length; i++) {
      let columns = []
      for (let j = 0; j < this.df[i].length; j++) {
        columns.push("" + this.df[i][j].toString() + "")
      }
      let row = columns.join(",")
      rows.push(row)
    }

    let csvString = rows.join("\n")

    let blob = new Blob([csvString], { type: "text/txt" })

    let url = URL.createObjectURL(blob)
    let downloadLink = document.createElement("a")
    downloadLink.href = url
    downloadLink.download = `${filename}.txt`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    return true
  }

  readFromCSV(csv, captions = true) {
    let matrix = []
    let lines = csv.split("\n")

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim()
      let columns = line.split(",")
      for (let j = 0; j < columns.length; j++) {
        columns[j] = columns[j].trim().replace(/"/g, "")
        if (!isNaN(columns[j])) {
          columns[j] = parseFloat(columns[j])
        }
      }
      matrix.push(columns)
    }
    if (captions) {
      this.df = matrix
    } else {
      this.df = [this.df[0]].concat(matrix)
    }
  }

  uploadCSV(captions = true) {
    let loadTableInput = new Input()
      .setType("file")
      .addAttributes({ accept: ".csv" })

    loadTableInput.addEventListener("change", () => {
      let reader = new FileReader()
      reader.onload = (event) => {
        this.readFromCSV(event.target.result, captions)
        this.refreshTable()
      }
      reader.readAsText(loadTableInput.getFile())
    })
    loadTableInput.build().getContainer().click()
  }

  uploadTXT(captions = true) {
    let loadTableInput = new Input()
      .setType("file")
      .addAttributes({ accept: ".txt" })

    loadTableInput.addEventListener("change", () => {
      let reader = new FileReader()
      reader.onload = (event) => {
        this.readFromCSV(event.target.result, captions)
        this.refreshTable()
      }
      reader.readAsText(loadTableInput.getFile())
    })
    loadTableInput.build().getContainer().click()
  }

  clear() {
    this.df = [this.df[0]]
    if (this.table)
      for (let i = 1; i < this.tableComponents.length; i++) {
        for (let j = 0; j < this.tableComponents[i].length; j++) {
          this.table.removeComponent(this.tableComponents[i][j], false)
        }
      }
    this.tableComponents.length = 1
  }

  clearAll() {
    this.df = []
    if (this.table) this.table.removeAllComponents()
    this.tableComponents = []
  }

  getDictionary(keyRow, valueRow) {
    let keyRow_list = this.getColumn(keyRow)
    let valueRow_list = this.getColumn(valueRow)
    if (keyRow_list.length == 0 || valueRow_list.length == 0) {
      console.warn("no column", keyRow_list.length == 0 ? keyRow : valueRow)
      return {}
    }
    return keyRow_list.toDictionary(valueRow_list)
  }

  getName() {
    return this.name
  }

  setName(name) {
    if (this.getName() != "") DataFrameRegistry.removeDataFrame(this.getName())
    this.name = name
    DataFrameRegistry.addDataFrame(this)
    return this
  }
}
