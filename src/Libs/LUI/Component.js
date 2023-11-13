import EventHandler from "./EventHandler.js"
import { Line, Vector, Vector4d } from "./Math.js"
import { DoubleLinkedList, functionMerger } from "./Utility.js"

import HTMLElementHelper from "./Helpers/HTMLElementHelper.js"
import ObjectHelper from "./Helpers/ObjectHelper.js"

export default class Component extends EventHandler {
  static DEFAULT_COMPONENT_NAME = "Component_name_default"
  static pixelSize = 0
  static ids = 0
  static events = {
    parentChange: "parentChange",
    nameChange: "nameChange",
    animationend: "animationend",
    contextmenu: "contextmenu",
    mouseup: "mouseup",
    mousedown: "mousedown",
    mouseleave: "mouseleave",
    mouseenter: "mouseenter",
    copy: "copy",
    close: "close",
    open: "open",
    build: "build",
    resizeEnd: "resizeEnd",
  }
  constructor() {
    super()
    this.name = Component.DEFAULT_COMPONENT_NAME
    this.size = new Vector()
    this.isVisible = false
    this.isOpen = false
    this.isHovered = false
    this.position = new Vector()
    this.components = {}
    this.componentsOrder = new DoubleLinkedList()
    this.queue = []
    this.isActive = false
    this.openedComponents = {}
    this.activeComponents = {}
    /**
     * x - top
     * y - bottom
     * z - left
     * a - right
     */
    this.margin = new Vector4d()

    this.options = {
      float: "none",
      pointerEvents: true,
      position: {
        fromButtom: false,
        fromRight: false,
        centered: {
          x: false,
          y: false,
        },
      },
      isDraggable: false,
      isResizable: false,
      zLayer: {
        parental: 0,
        personal: 0,
      },
      informational: {},
    }
    this.parentRelation = ""
    this.attributes = {}
    this.decorations = {}
    this.appliedStyles = {}
    this.floatingComponents = 0
    /**
     * Stores Event Subscribers
     */

    this.isBuilt = false
  }

  // **** GETTERS ****

  /**
   *
   * @returns {Component}
   */
  getParent() {
    return this.parent
  }

  getCSSClassList() {
    if (this.isBuilt) return this.container.classList
  }

  static getPixelSize = () => Component.pixelSize

  getParentByName(name) {
    if (this.hasParent()) {
      return this.getParent().getName() == name
        ? this.getParent()
        : this.getParent().getParentByName(name)
    }
  }

  getComponentByName(name, nested = true) {
    for (const component of this.componentsOrder) {
      if (component.getName() == name) return component
    }
    if (this.queue) {
      for (const { component } of this.queue) {
        if (component.getName() == name) return component
      }
    }
    if (nested) {
      for (const component of this.componentsOrder) {
        let foundComponent = component.getComponentByName(name, true)
        if (foundComponent != undefined) return foundComponent
      }
      if (this.queue) {
        for (const { component } of this.queue) {
          let foundComponent = component.getComponentByName(name, true)
          if (foundComponent != undefined) return foundComponent
        }
      }
    }
    return undefined
  }

  /**
   * Returns Position of Element Relative to MainComponent Top-Left Corner
   * @returns {Vector}
   */
  getAbsolutePosition() {
    return this.getPosition().add_vec(this.parent.getAbsolutePosition())
  }

  /**
   * Returns Absolute Z layer, relative to MainComponent
   * @returns {Number}
   */
  getAbsoluteZLayer() {
    return this.options.zLayer.parental + this.options.zLayer.personal
  }

  /**
   * Returns Name of Component opened on said channel
   * @param {String} channel
   * @returns {String||null}
   */
  getOpenedComponent(channel) {
    return ObjectHelper.get(this.openedComponents, channel, null)
  }

  /**
   * Returns Name of Component active on said channel
   * @param {String} channel
   * @returns {String||null}
   */
  getActiveComponent(channel) {
    return ObjectHelper.get(this.activeComponents, channel, null)
  }

  /**
   * Get size of component(without margin)
   * @returns {Vector}
   */
  getSize(sizeOfParent) {
    return this.calculateSize(this.size.copy(), sizeOfParent)
  }

  getSizeInPixels() {
    if (this.isBuilt) return HTMLElementHelper.getSize(this.getContainer())
    return new Vector()
  }
  /**
   * Get size of component with margins
   * @returns {Vector}
   */
  getFullSize(sizeOfParent) {
    let size = this.getSize(sizeOfParent)
    let margin = this.margin.copy()

    margin.x = this.calculateValue(margin.x, sizeOfParent, "y")
    margin.y = this.calculateValue(margin.y, sizeOfParent, "y")
    margin.z = this.calculateValue(margin.z, sizeOfParent, "x")
    margin.a = this.calculateValue(margin.a, sizeOfParent, "x")

    return new Vector(
      size.x + margin.z + margin.a,
      size.y + margin.x + margin.y
    )
  }

  /**
   * @returns {Number} - Unique Id of element
   */
  getId() {
    return this.id
  }

  /**
   * Get position of component
   * @returns {Vector}
   */
  getPosition(sizeOfParent, size) {
    let position = this.position.copy()
    if (this.hasParent()) {
      let positionMargin = new Vector(this.margin.z, this.margin.x)

      position.x = this.calculateValue(position.x, sizeOfParent, "x")
      position.y = this.calculateValue(position.y, sizeOfParent, "y")

      if (this.options.position.centered) {
        sizeOfParent ??= this.parent.getSize()
        size ??= this.getSize(sizeOfParent)
        if (this.options.position.centered.x) {
          position.x = (sizeOfParent.x - size.x) * 0.5
        }
        if (this.options.position.centered.y) {
          position.y = (sizeOfParent.y - size.y) * 0.5
        }
      }

      if (this.options.position.fromButtom) {
        sizeOfParent ??= this.parent.getSize()
        size ??= this.getSize(sizeOfParent)
        position.y = sizeOfParent.y - position.y - size.y
      }
      if (this.options.position.fromRight) {
        sizeOfParent ??= this.parent.getSize()
        size ??= this.getSize(sizeOfParent)
        position.x = sizeOfParent.x - position.x - size.x
      }

      position.x += this.calculateValue(positionMargin.x, sizeOfParent, "x")
      position.y += this.calculateValue(positionMargin.y, sizeOfParent, "y")
    }
    return position
  }

  /**
   * Returns HTMLElement of Component
   * @returns {HTMLElement}
   */
  getContainer() {
    return this.container
  }

  /**
   *
   * @returns {String}
   */
  getChannel() {
    return this.channel
  }

  /**
   *
   * @returns {String}
   */
  getName() {
    return this.name
  }

  /** @returns {String} */
  getFloat() {
    return this.options.float
  }

  /**
   *
   * @returns {Number|String}
   */
  getFontSize() {
    return this.fontSize || (this.hasParent() ? this.parent.getFontSize() : 0)
  }

  // **** ADDERS *****
  //Adders dont modify old values but rather adds something new

  /**
   * Add some HTML Attribute to Component component
   * Adding same attribute that already exist will override old attribute
   * @param {Object} attributes
   * @returns {Component}
   */
  addAttributes(attributes) {
    this.attributes = ObjectHelper.merge(this.attributes, attributes)
    if (this.isBuilt) this.applyAttributes()
    return this
  }

  addCSSClass(...CSSclasses) {
    if (this.isBuilt) this.container.classList.add(CSSclasses)
    else
      this.addEventListener(
        Component.events.build,
        (_, target) => {
          target.addCSSClass(...CSSclasses)
        },
        undefined,
        { once: true }
      )
    return this
  }

  removeCSSClass(...CSSclasses) {
    if (this.isBuilt) this.container.classList.remove(CSSclasses)
    else
      this.addEventListener(
        Component.events.build,
        () => {
          this.removeCSSClass(...CSSclasses)
        },
        { once: true }
      )
    return this
  }

  /**
   * Attaches Current Component to Parent at Channel channel
   * @param {Component} parent
   * @param {String} channel
   * @returns {Component}
   */
  attachToParent(parent, channel, should_try_open) {
    if (parent instanceof Component) {
      parent.addComponent(this, channel, should_try_open)
    } else {
      console.error(parent, "is not valid parent")
    }
    return this
  }

  detachFromParent() {
    this.parent.removeComponent(this)
    this.applyParentRelation("remove")
    this.setParent(undefined)
  }

  /**
   * Adds Component at said channel
   *
   * How channel works:
   *
   * When Element with channel x is opened, all other components on channel x are closed, except on channel none <BR>
   *
   * Special channels:
   *
   * "none" - elemnts on those channel wont be close, default channel
   *
   * "context" - channel used by context menus,
   *
   * "dialog" - channel used by dialog menus
   *
   * @param {Component} component
   * @param {String} channel - default  : none
   * @param {Boolean} should_try_open - default :
   *  true
   * @returns
   */
  addComponent(component, channel = "none", should_try_open = true) {
    component.options.informational.should_try_open = should_try_open
    if (
      !component.hasParent() ||
      component.getParent().getId() != this.getId()
    ) {
      component.setParent(this)
    }
    if (!this.isBuilt) {
      this.queue.push({
        component: component,
        channel: channel,
      })
      return this
    }

    component
      .#setId()
      .#setChannel(channel)
      .setParentalZLayer(this.getAbsoluteZLayer() + 1)

    if (component.isBuilt == false) component.build()

    //let preFloat = this.floatingComponents
    if (component.getFloat() != "none") this.floatingComponents += 1
    //resize already triggers recalculateFloat
    //if (preFloat != this.floatingComponents) this.recalculateFloat()
    let shouldOpen = false
    if (
      this.components[channel] == undefined ||
      Object.keys(this.components[channel]).length == 0
    ) {
      shouldOpen = true
      this.components[channel] = {}
    }
    if (channel == "none") {
      shouldOpen = true
    }
    this.componentsOrder.addValue(component)
    this.components[channel][component.getId()] = component

    if (shouldOpen && should_try_open) component.open()
    component.resize()
    this.attachContainer(component.getContainer())
    return this
  }

  // **** SETTERS ****
  // Sets/Overrides something with new Value

  /*Possible problem:
     If u modify z layer of component, all child components wont recieve update to parental Z layer, possible solution:
     dynamic getter: get Z layer from parent
     made Funcion change parental Z layer of all child elemnts
    */
  /**
   * sets Z layer derived from Parent
   * @param {Number} layer
   * @returns {Component}
   */
  setParentalZLayer(layer) {
    this.options.zLayer.parental = layer
    if (this.isBuilt) {
      this.applyZLayer()
    }
    return this
  }

  setParentRelation(relationName) {
    if (this.hasParent()) {
      this.applyParentRelation("remove")
      this.parentRelation = relationName
      this.applyParentRelation()
    } else {
      this.addEventListener(
        Component.events.parentChange,
        () => this.setParentRelation(relationName),
        undefined,
        { once: true }
      )
    }
    return this
  }

  /**
   * Set Z layer relative to parent
   * @param {Number} layer
   * @returns {Component}
   */
  setZLayer(layer) {
    this.options.zLayer.personal = layer
    if (this.isBuilt) {
      this.applyZLayer()
    }
    return this
  }

  /**
   * @param {Component} parent
   * @returns {Component}
   */
  setParent(parent) {
    let oldparent = this.parent
    if (oldparent) this.detachFromParent()
    this.parent = parent
    if (parent) this.applyParentRelation()
    this.dispatchEvent(Component.events.parentChange, {
      from: oldparent,
      to: parent,
    })
    return this
  }

  /**
   * Sets Id to some unique value, can be only set once
   * @returns {Component}
   */
  #setId() {
    if (this.id == undefined) {
      this.id = Component.ids
      Component.ids++
    }

    return this
  }

  /**
   * Only used when component is attached to parent
   * @param {String} channel
   * @returns {Component}
   */
  #setChannel(channel) {
    this.channel = channel
    return this
  }

  /**
   * Makes position count from right border
   *
   * Starting point(x = 0) = right border - width
   *
   * Increasing x moves element to the left
   * @param {Boolean} state - default true
   * @returns {Component}
   */
  setRightAlignment(state = true) {
    this.options.position.fromRight = state
    if (this.isBuilt) this.applyPosition()
    return this
  }

  setPointerEvents(state = true) {
    this.options.pointerEvents = state
    if (this.isBuilt) this.applyPointerEvents()
    return this
  }

  /**
   * Makes position count from bottom border
   *
   * Starting point(y = 0) = bottom border - height
   *
   * Increasing y moves element to the top
   * @param {Boolean} state - default : true
   * @returns {Component}
   */
  setBottomAligment(state = true) {
    this.options.position.fromButtom = state
    if (this.isBuilt) this.applyPosition()
    return this
  }

  /**
   * Places element on center of one or both axis
   * @param {Boolean} x_axis - default : true
   * @param {Boolean} y_axis - default : true
   * @returns
   */
  setCenterAligment(x_axis = true, y_axis = true) {
    this.options.position.centered = {
      x: x_axis,
      y: y_axis,
    }
    if (this.isBuilt) {
      this.applyPosition()
    }
    return this
  }

  /**
   * Makes Component have same size as its parent
   * @returns {Component}
   */
  setSizeEqualToParent() {
    this.setSize(
      Component.PARENT_SIZE_DETERMINER,
      Component.PARENT_SIZE_DETERMINER
    )
    return this
  }

  /**
   *
   * @param {Component} menu
   * @returns {Component}
   */
  setContextMenu(menu) {
    if (this.contextMenu) {
      window.MainComponent.removeEventListener(
        Component.events.mousedown,
        this.contextMenu.closingId
      )
      window.MainComponent.removeComponent(this.contextMenu)
    }
    window.MainComponent.addComponent(menu, "context", false)
    this.contextMenu = menu
    menu.setZLayer(Component.ZLAYERS.CONTEXT_MENU)
    this.contextMenu.closingId = window.MainComponent.addEventListener(
      Component.events.mousedown,
      (_, target) => {
        target.contextMenu.close()
      }
    )
    return this
  }

  /**
   * Sets position on element
   *
   * @param {Number|Vector} x
   * @param {Number} y
   * @returns
   */
  setPosition(x, y) {
    if (x instanceof Vector) {
      y = x.y
      x = x.x
    }

    if (x == -2 || x == undefined) x = this.position.x
    if (y == -2 || y == undefined) y = this.position.y

    this.position = new Vector(x, y)

    if (this.isBuilt) this.applyPosition()
    return this
  }

  /**
   * Makes Element Draggable/Not Draggable
   * @param {Boolean} state
   * @returns {Component}
   */
  setDraggable(state = true) {
    this.isDraggable = state
    return this
  }

  /**
   * Set decoration function,
   *
   * Decoration functions must return object of key-value pairs where
   *
   * Key - css property
   *
   * Value - value of it
   *
   * Decoration functio call passes size(in px) and position(in px) as arguments
   *
   * @param {Function} decoration
   * @returns
   */
  setDecoration(...decorations) {
    this.decorations["main"] = Component.parseDecorations(decorations)
    if (this.isBuilt) this.applyDecoration()
    return this
  }

  /**
   * Set decoration function on hover,
   *
   * Decoration functions must return object of key-value pairs where
   *
   * Key - css property
   *
   * Value - value of it
   *
   * Decoration functio call passes size(in px) and position(in px) as arguments
   *
   * @param {Function} decoration
   * @returns
   */
  setHoverDecoration(...decorations) {
    this.decorations["hover"] = Component.parseDecorations(decorations)
    if (this.isBuilt) this.applyDecoration()
    return this
  }

  /**
   * Set decoration function on activation,
   *
   * Decoration functions must return object of key-value pairs where
   *
   * Key - css property
   *
   * Value - value of it
   *
   * Decoration function call passes size(in px) and position(in px) as arguments
   *
   * @param {Function} decoration
   * @returns
   */
  setActiveDecoration(...decorations) {
    this.decorations["active"] = Component.parseDecorations(decorations)
    if (this.isBuilt) this.applyDecoration()
    return this
  }

  setActivity(state = true) {
    if (state != this.isActive) {
      if (state && this.hasParent()) {
        this.parent.getActiveComponent(this.getChannel())?.setActivity(false)
        this.parent.activeComponents[this.getChannel()] = this
      } else {
        if (
          this.hasParent() &&
          this.parent.getActiveComponent(this.getChannel()).getId?.() ==
            this.getId()
        ) {
          delete this.parent.activeComponents[this.getChannel()]
        }
      }
      this.isActive = state
      if (this.isBuilt) this.applyDecoration()
    }
    return this
  }

  /**
   * Sets size of components, both sides can have special values:
   *
   * Component.PARENT_SIZE_DETERMINER - size of side is set to size of that dise of parent
   * undefined -  size is unchanged after call
   * @param {Number|Vector} x
   * @param {Number} y
   * @returns {Component}
   */
  setSize(x, y) {
    if (x instanceof Vector) {
      y = x.y
      x = x.x
    }

    if (x == undefined) x = this.size.x
    if (y == undefined) y = this.size.y
    this.size = new Vector(x, y)

    if (this.isBuilt) {
      this.resize()
    }
    return this
  }

  /**
   * You can give your component a name!
   *
   * @param {String} name
   * @returns {Component}
   */
  setName(name) {
    let oldName = this.name
    this.name = name
    this.dispatchEvent(Component.events.nameChange, { from: oldName, to: name })
    return this
  }

  /**
   *
   * @param {Number} fontSize
   * @returns {Component}
   */
  setFontSize(fontSize) {
    this.fontSize = fontSize
    if (this.isBuilt) this.applyFontSize()
    return this
  }

  setMargin(top, bottom, left, right) {
    this.margin = new Vector4d(
      top || this.margin.x,
      bottom || this.margin.y,
      left || this.margin.z,
      right || this.margin.a
    )
    if (this.isBuilt) {
      this.applyPosition()
      this.parent.recalculateFloat()
    }
    return this
  }

  /**
   *
   * @param {String} type Left|Right|None
   */
  setFloat(type) {
    type = type.toLowerCase()
    if (!type in ["left", "right", "none"]) {
      console.warn("cant set float to", type, ". Setting to none")
      type = "none"
    }
    if (this.parent) {
      if (this.getFloat() == "none") {
        if (type != "none") this.parent.floatingComponents += 1
      } else {
        if (type == "none") {
          this.parent.floatingComponents -= 1
        }
      }
      this.recalculateFloat()
    }
    this.options.float = type
    return this
  }

  // **** Appliers ****
  //Applies some settings to Component component

  /**
   * @returns {Component}
   */
  applyZLayer() {
    let layer = this.getAbsoluteZLayer()
    HTMLElementHelper.setZLayer(this.getContainer(), layer)
    for (const component of this.componentsOrder)
      component.setParentalZLayer(layer)
    return this
  }

  applyParentRelation(type = "apply") {
    if (this.parentRelation != "")
      if (type == "remove") {
        delete this.parent[this.parentRelation]
      } else if (type == "apply") {
        this.parent[this.parentRelation] = this
      }
  }

  applyPointerEvents() {
    this.container.style.pointerEvents = this.options.pointerEvents
      ? "all"
      : "none"
  }

  applyPosition(position) {
    if (position == undefined) position = this.getPosition()
    HTMLElementHelper.setPosition(
      this.container,
      position.scale(Component.getPixelSize())
    )
  }

  applySize(size) {
    HTMLElementHelper.setSize(
      this.container,
      size.scale(Component.getPixelSize())
    )
  }

  applyDecoration(size, position) {
    size ??= this.getSize()
    position ??= this.getPosition()
    let pixelSize = Component.getPixelSize()
    size = size.scale(pixelSize)
    position = position.scale(pixelSize)
    let mainDecoration = ObjectHelper.get(this.decorations, "main", () => ({}))
    let decoration = mainDecoration(size, position, pixelSize)
    if (this.isActive) {
      let activeDecoration = ObjectHelper.get(
        this.decorations,
        "active",
        () => ({})
      )
      decoration = ObjectHelper.merge(
        decoration,
        activeDecoration(size, position, pixelSize)
      )
    }
    if (this.isHovered) {
      let hoverDecoration = ObjectHelper.get(
        this.decorations,
        "hover",
        () => ({})
      )
      decoration = ObjectHelper.merge(
        decoration,
        hoverDecoration(size, position, pixelSize)
      )
    }

    for (const key in decoration) {
      this.appliedStyles[key] = true
    }
    HTMLElementHelper.applyStyle(this.container, decoration, this.appliedStyles)
  }

  /**
   *
   * @param {Vector} pixelSize
   * @param {Vector} size
   */
  applyFontSize(sizeOfParent, sizeOfComponent) {
    let fontSize = this.getFontSize()
    fontSize = this.calculateValue(fontSize, sizeOfParent, sizeOfComponent)
    this.container.style.fontSize = fontSize * Component.getPixelSize() + "px"
  }

  applyAttributes() {
    HTMLElementHelper.applyAttributes(this.container, this.attributes)
  }

  // **** Event Controllers ****

  addListeners() {
    this.container.addEventListener("mouseenter", (evt) => {
      this.onmouseenter(evt)
    })
    this.container.addEventListener("mouseleave", (evt) => {
      this.onmouseleave(evt)
    })
    this.container.addEventListener("mousedown", (evt) => {
      this.onmousedown(evt)
    })
    this.container.addEventListener("mouseup", (evt) => {
      this.onmouseup(evt)
    })
    this.container.addEventListener("contextmenu", (evt) =>
      this.oncontextmenu(evt)
    )
    this.container.addEventListener("animationend", (evt) => {
      this.dispatchEvent(Component.events.animationend, evt)
    })
  }

  // **** Event Handlers ****

  /** Dispatches **contextmenu** event */
  oncontextmenu(evt) {
    this.dispatchEvent(Component.events.contextmenu, evt)
    if (this.contextMenu) {
      evt.stopPropagation()
      let clickPosition = new Vector(evt.clientX, evt.clientY)
      this.contextMenu.setPosition(
        clickPosition.scale(1 / Component.getPixelSize())
      )
      //clickPosition.div_vec(this.getPixelSize()).sub_vec(this.getAbsolutePosition()))

      this.contextMenu.open()
    }
    return false
  }

  /** Dispatches **mouseup** event */
  onmouseup(evt) {
    if (this.isDraggable) {
      console.log("stopped at position:", this.position.toStringFixed())
      document.body.removeEventListener("mousemove", this.drag_func_listener)
      delete this.mousePos
    }
    if (evt) evt.stopPropagation()
    this.dispatchEvent(Component.events.mouseup, evt)
  }

  /** Dispatches **mousedown** event */
  onmousedown(evt) {
    evt.targetComponent = this
    if (evt.button == 0) {
      if (this.isDraggable) {
        evt.preventDefault()
        this.drag_func_listener = this.drag.bind(this)
        this.mousePos = new Vector(evt.clientX, evt.clientY)
        document.body.addEventListener("mousemove", this.drag_func_listener)
      }
      if (evt) evt.stopPropagation()
      this.dispatchEvent(Component.events.mousedown, evt)
      window.MainComponent.dispatchEvent(Component.events.mousedown, evt)
    }
  }

  /** Dispatches **mouseleave** event */
  onmouseleave(evt) {
    if (this.tooltip) {
      window.game.getCursor().clearTooltip()
    }
    this.isHovered = false
    this.applyDecoration()
    this.dispatchEvent(Component.events.mouseleave, evt)
  }
  /** Dispatches **mouseenter** function */
  onmouseenter(evt) {
    this.isHovered = true
    this.applyDecoration()

    this.dispatchEvent(Component.events.mouseenter, evt)
  }

  // **** Miscellaneous ****
  // Functions that doesnt fall under any of previous categories

  calculateValue(size, parentSize, type) {
    if (isNaN(size)) {
      if (parentSize == undefined)
        parentSize = this.hasParent() ? this.parent.getSize() : new Vector()
      if (size.endsWith("%"))
        return (parentSize[type] * size.slice(0, -1)) / 100
      if (size.endsWith("w")) return (parentSize.x * size.slice(0, -1)) / 100
      if (size.endsWith("h")) return (parentSize.y * size.slice(0, -1)) / 100
    }
    return +size
  }
  new() {
    return this.copy()
  }

  static copyConfig = {
    includeProperties: {
      margin: true,
      size: true,
      attributes: true,
      subscribers: true,
      queue: true,
      components: true,
      decorations: true,
      options: true,
      fontSize: true,
      name: true,
      position: true,
      parentRelation: true,
    },
  }

  calculateSize(size, sizeOfParent) {
    size = size.copy()
    size.x = this.calculateValue(size.x, sizeOfParent, "x")
    size.y = this.calculateValue(size.y, sizeOfParent, "y")

    if (size.x == Component.PARENT_SIZE_DETERMINER) {
      sizeOfParent ??= this.hasParent() ? this.parent.getSize() : new Vector()
      size.x = sizeOfParent.x - this.position.x
    }
    if (size.y == Component.PARENT_SIZE_DETERMINER) {
      sizeOfParent ??= this.hasParent() ? this.parent.getSize() : new Vector()
      size.y = sizeOfParent.y - this.position.y
    }

    return size
  }

  /**
   *
   * @param {Object} toCopy
   * @returns {Component}
   */
  copy(toCopy = {}) {
    let _toCopy = ObjectHelper.merge(
      this.constructor.copyConfig.includeProperties ||
        Component.copyConfig.includeProperties,
      toCopy
    )

    let copy = new this.constructor()

    for (const key in _toCopy) {
      if (_toCopy[key])
        switch (key) {
          case "subscribers":
            copy.copySubscribersFrom(this)
            break
          case "components":
            for (const component of this.componentsOrder) {
              copy.addComponent(
                component.copy(toCopy),
                component.getChannel(),
                component.options.informational.should_try_open
              )
            }
            break
          case "parentRelation":
            copy.setParentRelation(this.parentRelation)
            break
          case "queue":
            if (this.queue)
              for (const component of this.queue) {
                copy.addComponent(
                  component.component.copy(toCopy),
                  component.channel,
                  component.component.options.informational.should_try_open
                )
              }

            break
          default:
            if (this[key] != undefined)
              if (this[key].copy) copy[key] = this[key].copy()
              else if (this[key] instanceof Object) {
                copy[key] = ObjectHelper.copy(this[key])
              } else {
                copy[key] = this[key]
              }

            break
        }
    }
    copy.dispatchEvent(Component.events.copy)
    return copy
  }
  /**
   * Toggles Component between open and close
   * @returns {Component}
   */
  toggle() {
    if (this.isOpen) [this.close()]
    else this.open()
    return this
  }

  static parseDecorations(decorations) {
    if (decorations.length == 1) {
      if (decorations[0] instanceof Function) return decorations[0]
      return () => decorations[0]
    }
    return functionMerger(...decorations)
  }

  /**
   *
   * @param {Component} component
   * @return {Component}
   */
  removeComponent(component, triggerRefloat = true) {
    if (component.isBuilt) {
      let node = this.componentsOrder.head
      let index = 0
      let found = true
      while (node.getValue().getId() != component.getId()) {
        if (node == undefined) {
          found = false
          break
        }
        index++
        node = node.next
      }
      if (found) {
        if (this.componentsOrder.removeNodeAt(index)) {
          delete this.components[component.getChannel()][component.getId()]
          if (component.getFloat() != "none") {
            this.floatingComponents--
            if (triggerRefloat == true) {
              this.recalculateFloat()
            }
          }
          component.parent = undefined
          this.detachContainer(component.getContainer())
        }
      }
    } else {
      for (let i = 0; i < this.queue.length; i++) {
        if (this.queue[i].component.getId() == component.getId()) {
          this.queue.splice(i, i)
          i = this.queue.length
        }
      }
    }
    return this
  }

  /** @returns {Component} */
  removeAllComponents() {
    if (this.isBuilt) {
      let floatings = this.floatingComponents
      for (let channel in this.components) {
        for (let component in this.components[channel]) {
          this.removeComponent(this.components[channel][component], false)
        }
      }
      if (floatings != this.floatingComponents) this.recalculateFloat()
    } else {
      this.queue = []
    }

    return this
  }

  /**
   * Controls channels, open and closes needed components
   * @param {Component} component
   * @returns {Component}
   */
  handleComponentOpen(component) {
    this.openedComponents[component.getChannel()] = component.getName()
    for (const component_in in this.components[component.getChannel()]) {
      if (
        component.getId() ==
        this.components[component.getChannel()][component_in].getId()
      ) {
        continue
      }

      this.components[component.getChannel()][component_in].close()
    }
    // if (component.getChannel() == "none") {
    if (component.getFloat() != "none") this.recalculateFloat()

    return this
  }

  /**
   * Resize Controller, applies resize to all child elements and recises current one
   */
  resize(sizeOfParent) {
    if (sizeOfParent == undefined) {
      sizeOfParent == this.hasParent() ? this.parent.getSize() : new Vector()
    }
    let size = this.getSize(sizeOfParent)
    this.applySize(size)
    let position = this.getPosition(sizeOfParent, size)
    this.applyPosition(position)

    for (let channel in this.components) {
      for (let component in this.components[channel]) {
        this.components[channel][component].resize(size)
      }
    }
    this.applyDecoration(size, position)
    this.applyFontSize(sizeOfParent, size)
    this.recalculateFloat()
    if (this.parent && this.getFloat() != "none") this.parent.recalculateFloat()
    this.dispatchEvent(Component.events.resizeEnd)
  }

  hide() {
    if (this.isBuilt) this.container.style.display = "none"
    this.isVisible = false
    return this
  }

  show() {
    if (this.isBuilt) this.container.style.display = "block"
    if (!this.isOpen) this.open()
    this.isVisible = true
    return this
  }

  close(evt = {}) {
    this.hide()
    this.isOpen = false
    this.isVisible = false
    if (this.getFloat() != "none") {
      this.recalculateFloat()
    }
    this.dispatchEvent(Component.events.close, evt)
    return this
  }

  open(evt = {}) {
    this.isOpen = true
    this.isVisible = true
    if (this.parent && this.parent.isOpen) {
      if (this.getChannel() != "none") this.parent.handleComponentOpen(this)
    }

    this.container.style.display = "block"
    this.dispatchEvent(Component.events.open, evt)
  }

  /**
   * Makes component position indepent, removes bottomAligment, rightAligment and centerAligment,
   * position remain same but is now counted from top-left corner
   * @returns {Component}
   */
  unlockPosition() {
    this.position = this.getPosition()
    this.options.position = {
      fromButtom: false,
      fromRight: false,
      centered: {
        x: false,
        y: false,
      },
    }
    return this
  }

  /**
   * Adds HTMLComponent as child of component
   * @param {HTMLElement} container
   * @returns
   */
  attachContainer(container) {
    this.container.appendChild(container)
    return this
  }

  /**
   * Removes child HTMLComponent from component
   * @param {HTMLElement} container
   */
  detachContainer(container) {
    this.container.removeChild(container)
  }

  /** @returns {Component} */
  createAndConfigureContainer() {
    this.createHTMLElement()
    this.container.style.display = "none"
    this.container.style.position = "absolute"
    HTMLElementHelper.disableContextMenu(this.container)
    this.applyPointerEvents()
    return this
  }

  createHTMLElement() {
    this.container = document.createElement("div")
  }

  drag(evt) {
    let newMousePos = new Vector(evt.clientX, evt.clientY)
    let newPos = this.position.add_vec(
      newMousePos.sub_vec(this.mousePos).scale(1 / Component.getPixelSize())
    )
    this.setPosition(newPos.x, newPos.y)
    this.mousePos = newMousePos
  }
  recalculateFloat() {
    if (this.floatingComponents == 0) return this

    // console.log("recalculating floating")

    let floatList = new DoubleLinkedList()
    let size = this.getSize()
    let max_x = 0
    let node = this.componentsOrder.head
    while (node != undefined) {
      let component = node.getValue()
      if (component.isOpen && component.getFloat() != "none") {
        floatList.addValue(component)
        component.cashedSize = component.getFullSize()
        if (component.cashedSize.x > max_x) max_x = component.cashedSize.x
      }
      node = node.next
    }
    window.float = floatList

    if (size.x < max_x) size.x = max_x

    let outLine = new DoubleLinkedList()
    outLine.addValue(new Line(new Vector(), new Vector(size.x, 0)))
    let leftLineNode
    let componentNode = floatList.head
    while (componentNode != undefined) {
      let component = componentNode.getValue()

      if (component.getFloat() == "left") {
        if (leftLineNode == undefined) leftLineNode = outLine.head
        let start = leftLineNode
        let currentY = leftLineNode.getValue().start.y
        let accumulatedLength = 0

        while (accumulatedLength < component.cashedSize.x) {
          if (leftLineNode == undefined) {
            leftLineNode = outLine.head
            start = outLine.head
            accumulatedLength = 0
            currentY = leftLineNode.getValue().start.y
          }
          accumulatedLength += leftLineNode.getValue().getHorizontalLength()

          if (
            accumulatedLength < component.cashedSize.x &&
            currentY < leftLineNode.getValue().start.y
          ) {
            start.getValue().end.x = leftLineNode.getValue().end.x

            outLine.connect2Nodes(start, leftLineNode)
            start = leftLineNode.next
            accumulatedLength = 0
          } else if (accumulatedLength == component.cashedSize.x) {
            component.setPosition(start.getValue().start)
            start.value = start
              .getValue()
              .addVec(new Vector(0, component.cashedSize.y))
            start.value.end.x = leftLineNode.value.end.x

            outLine.connect2Nodes(start, leftLineNode.next)
            if (leftLineNode.next == undefined) {
              leftLineNode = outLine.head
            } else {
              leftLineNode = leftLineNode.next
            }
            break
          } else if (accumulatedLength > component.cashedSize.x) {
            component.setPosition(start.getValue().start)

            let splitted = leftLineNode
              .getValue()
              .splitAtX(start.getValue().start.x + component.cashedSize.x)
            splitted.left = splitted.left.addVec(
              new Vector(0, component.cashedSize.y)
            )
            if (start == leftLineNode) {
              start.value = splitted.left
              outLine.addNodeAfter(start, splitted.right)
              leftLineNode = leftLineNode.next
            } else {
              leftLineNode.value = splitted.right
              start.getValue().end.x = splitted.right.start.x
              start.value = start.value.addVec(
                new Vector(0, component.cashedSize.y)
              )
              outLine.connect2Nodes(start, leftLineNode)
            }

            break
          }

          leftLineNode = leftLineNode.next
        }
      }
      componentNode = componentNode.next
    }
    this.outLine = outLine
  }

  hasParent() {
    return !!this.parent
  }

  build() {
    // this.computeSize()
    this.createAndConfigureContainer()
    this.addListeners()
    this.applyZLayer()
    //this.applyResize()
    this.applyAttributes()

    this.isBuilt = true
    for (let component of this.queue) {
      this.addComponent(
        component.component,
        component.channel,
        component.component.options.informational.should_try_open
      )
    }
    delete this.queue
    this.dispatchEvent(Component.events.build)
    return this
  }

  /**
   * Return the object its called on, can be used to do some action in middle of method chaining
   */
  someAction() {
    return this
  }

  // *** WIP ***
  //Functions there are not finished

  addTooltipText(text) {
    this.tooltip = () => text
    return this
  }
  addTooltipFunction(func) {
    this.tooltip = func
    return this
  }

  setResizable(state = true) {
    this.isResizable = state
    if (this.isBuilt) this.applyResize()
    return this
  }
  applyResize() {
    this.container.style.resize = this.isResizable ? "both" : "none"
  }
}

Component.ZLAYERS = {
  //Default Personal Z layer for Dialog windows
  DIALOG: 1000,
  //Default Personal Z layers for Context Menus
  CONTEXT_MENU: 2000,
}

/**
 * What number need to be passed in setSize function to set side to same size as that side on parent
 */
Component.PARENT_SIZE_DETERMINER = -1
