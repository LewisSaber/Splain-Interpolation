import Component from "./Component.js"
import HTMLElementHelper from "./Helpers/HTMLElementHelper.js"
import { Vector } from "./Math.js"

export default class MainComponent extends Component {
  constructor(height, width) {
    if (MainComponent.instance) return MainComponent.instance
    super()
    MainComponent.instance = this
    window.MainComponent = this
    //this.setParentSize()
    if (height) {
      this.setHeight(height)
    } else this.setWidth(width)

    this.setFontSize(0.3).computeSize()
    this.build().resize()
    HTMLElementHelper.setSize(this.container, new Vector())
    window.addEventListener("resize", (evt) => {
      const originalOverflow = {
        overflow: this.container.style.overflow,
        overflowX: this.container.style.overflowX,
        overflowY: this.container.style.overflowY,
      }

      // Remove the overflow styles
      this.container.style.overflow = "hidden"
      this.container.style.overflowX = "hidden"
      this.container.style.overflowY = "hidden"

      this.computeSize().resize()

      // Reapply the original overflow styles
      this.container.style.overflow = originalOverflow.overflow
      this.container.style.overflowX = originalOverflow.overflowX
      this.container.style.overflowY = originalOverflow.overflowY
    })

    document.body.appendChild(this.getContainer())
    this.open()
  }

  /**
   *
   * @param {String} name
   * @param {Boolean} nested
   * @returns {Component}
   */
  static getComponentByName(name, nested) {
    return MainComponent.instance.getComponentByName(name, nested)
  }

  applySize() {}

  copy() {
    return undefined
  }
  /**
   *
   * @returns {Component}
   */
  computeSize() {
    let windowSize = this.getWindowSize()
    Component.pixelSize = 0

    if (this.isHeightBased == undefined)
      if (this.size.y != 0) {
        this.isHeightBased = true
      } else this.isHeightBased = false

    if (this.isHeightBased) {
      Component.pixelSize = windowSize.y / this.size.y
      this.size.x = windowSize.x / Component.getPixelSize()
    } else {
      Component.pixelSize = windowSize.x / this.size.x

      this.size.y = windowSize.y / Component.getPixelSize()
    }

    return this
  }
  getAbsolutePosition() {
    return new Vector()
  }

  getWindowSize() {
    return new Vector(window.visualViewport.width, window.visualViewport.height)
  }

  setWidth(width) {
    if (width <= 0) {
      console.error("Wrong width", width)
    }
    this.size.x = width
    return this
  }

  setHeight(height) {
    if (height <= 0) {
      console.error("Wrong width", height)
    }
    this.size.y = height
    return this
  }
}
