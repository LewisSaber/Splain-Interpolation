import Component from "./Component.js"
import ObjectHelper from "./Helpers/ObjectHelper.js"

export default class Label extends Component {
  constructor() {
    super()
    this.text = ""
    this.color = undefined
    this.textCentered = true
    this.options.pointerEvents = false
  }
  setColor(color) {
    this.color = color
    if (this.isBuilt) this.loadValues()
    return this
  }
  setText(text) {
    this.text = text
    if (this.isBuilt) this.loadValues()
    return this
  }
  centerText(centered = true) {
    this.textCentered = centered
    if (this.isBuilt) {
      this.container.style.textAlign = centered ? "center" : "left"
    }
    return this
  }
  createAndConfigureContainer() {
    super.createAndConfigureContainer()
    this.container.style.textAlign = this.textCentered ? "center" : "left"
  }

  loadValues() {
    this.container.innerHTML = this.text
    this.container.style.color = this.color
  }

  static copyConfig = ObjectHelper.merge(Component.copyConfig, {
    includeProperties: {
      text: true,
      color: true,
      textCentered: true,
    },
  })

  build() {
    // this.setParentSize()
    super.build()
    this.loadValues()

    return this
  }
}
