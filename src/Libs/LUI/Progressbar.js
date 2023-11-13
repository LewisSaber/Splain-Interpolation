import Component from "./Component.js"

export default class ProgressBar extends Component {
  constructor() {
    super()
    this.maxValue = 0
    this.currentValue = 0
    this.mainColor = "#747574"
    this.progressColor = "#a4a6a5"
    this.isInverted = false
    this.isVertical = false
  }
  setInverted() {
    this.isInverted = true
    return this
  }
  setVertical() {
    this.isVertical = true
    return this
  }
  decoration1(size) {
    //arrow x coords
    let leftX = 0 * size.x
    let midX = (6.5 / 10.5) * size.x
    let rightX = 1 * size.x
    //arrow y coords
    let topY = 0 * size.y
    let topMidY = (2.5 / 7) * size.y
    let midY = 0.5 * size.y
    let bottomMidY = (4.5 / 7) * size.y
    let bottomY = 1 * size.y
    return {
      "clip-path": `polygon(${leftX}px ${topMidY}px, ${midX}px ${topMidY}px, ${midX}px ${topY}px, ${rightX}px ${midY}px, ${midX}px ${bottomY}px, ${midX}px ${bottomMidY}px, ${leftX}px ${bottomMidY}px )`,
    }
  }
  decoration1inside = this.decoration1

  setMaxValue(value) {
    this.maxValue = value
    return this
  }
  update(value) {
    this.currentValue = value
    let progress =
      (this.isInverted
        ? (this.currentValue == 0 ? 0 : this.maxValue - this.currentValue) /
          this.maxValue
        : this.currentValue / this.maxValue) * 100
    if (this.isVertical) this.insideContainer.style.height = progress + "%"
    else this.insideContainer.style.width = progress + "%"
    return this
  }
  createContainer() {
    this.container = document.createElement("div")
    this.container.style.display = "none"
    this.container.style.position = "absolute"
    this.container.style.pointerEvents = true ? "all" : "none"
    this.container.disableContextMenu()

    this.insideContainer = document.createElement("div")
    this.insideContainer.style.display = "block"
    this.insideContainer.style.position = "absolute"
    if (this.isVertical) this.insideContainer.style.width = "100%"
    else this.insideContainer.style.height = "100%"

    this.insideContainer.style.pointerEvents = true ? "all" : "none"
    this.insideContainer.disableContextMenu()
    this.container.appendChild(this.insideContainer)

    return this
  }
  applyProgressColor() {
    this.insideContainer.style.background = this.progressColor
    return this
  }
  setProgressColor(color) {
    this.progressColor = color
    if (this.isBuilt) this.applyProgressColor()
    return this
  }
  applyMainColor() {
    this.container.style.background = this.mainColor
    return this
  }
  setMainColor(color) {
    this.mainColor = color
    if (this.isBuilt) this.applyMainColor()
    return this
  }
  build() {
    super.build()
    this.applyProgressColor()
    this.applyMainColor()
    return this
  }
  applyDecoration() {
    super.applyDecoration()
    if (this[`decoration${this.decoration}inside`])
      this.insideContainer.applyStyle(
        this[`decoration${this.decoration}inside`](
          this.size.multiply(this.getPixelSize()),
          this.position.multiply(this.getPixelSize())
        )
      )
  }
}
