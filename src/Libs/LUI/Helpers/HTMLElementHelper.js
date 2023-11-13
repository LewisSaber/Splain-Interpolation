import { Vector } from "../Math.js"
import ObjectHelper from "./ObjectHelper.js"

const HTMLElementHelper = {
  setSize(element, sizeVector, type = "px") {
    element.style.width = sizeVector.x + type
    element.style.height = sizeVector.y + type
  },
  setPosition(element, positionVector, type = "px") {
    element.style.left = positionVector.x + type
    element.style.top = positionVector.y + type
  },

  getSize(element) {
    return new Vector(
      +element.style.width.slice(0, -2),
      +element.style.height.slice(0, -2)
    )
  },

  setBackgroundImage(element, url) {
    element.style.backgroundImage = url == "none" ? url : `url(${url})`
  },
  setZLayer(element, layer) {
    element.style.zIndex = layer
  },
  disablePointerEvents(element) {
    element.style.pointerEvents = "none"
  },
  disableContextMenu(element) {
    element.oncontextmenu = () => false
  },
  applyStyle(element, style, appliedStyles) {
    if (style instanceof Object)
      if (appliedStyles) {
        for (const key in appliedStyles) {
          if (ObjectHelper.get(style, key)) {
            element.style.setProperty(key, ObjectHelper.get(style, key))
          } else {
            element.style.setProperty(key, null)
            delete appliedStyles[key]
          }
        }
      } else
        for (const key in style) {
          element.style.setProperty(key, style[key])
        }
    else {
      console.warn("applying bad style", style)
    }
  },
  applyAttributes(element, attributes) {
    if (attributes instanceof Object) {
      for (const key in attributes) {
        element.setAttribute(key, attributes[key])
      }
    } else {
      console.warn("applying bad attribute", attributes)
    }
  },
}
export default HTMLElementHelper
