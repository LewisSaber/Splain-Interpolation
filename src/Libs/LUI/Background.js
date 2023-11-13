import Component from "./Component.js"
import HTMLElementHelper from "./Helpers/HTMLElementHelper.js"
import ObjectHelper from "./Helpers/ObjectHelper.js"
export default class BackGround extends Component {
  constructor() {
    super()
  }
  setImg(img) {
    this.img = img
    if (this.isBuilt) this.applyBackground()
    this.options.pointerEvents = false
    return this
  }

  createAndConfigureContainer() {
    super.createAndConfigureContainer()
    this.container.style.backgroundSize = "100% 100%"
    return this
  }
  build() {
    if (this.size.x == 0 && this.size.y == 0) this.setSizeEqualToParent()
    super.build()
    this.applyBackground()
    return this
  }

  static copyConfig = ObjectHelper.merge(Component.copyConfig, {
    includeProperties: {
      img: true,
    },
  })
  applyBackground() {
    HTMLElementHelper.setBackgroundImage(this.container, this.img)
  }
}
