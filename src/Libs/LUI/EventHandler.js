import ObjectHelper from "./Helpers/ObjectHelper.js"

/**
 * Represents an event handling mechanism that allows subscribing to events, dispatching events, and removing event listeners.
 */
export default class EventHandler {
  static registers = {}
  static ids = 0
  constructor() {
    this.subscribers = {}
  }

  /**
   * Dispatches an event of the specified type and passes the provided data to the event handlers.
   * @param {string} eventType - The type of event to dispatch (fire).
   * @param {Object} data - The data object to be passed to the event handlers.
   * @returns {EventHandler} - Returns the current instance of the EventHandler class.
   */
  dispatchEvent(eventType, data) {
    if (this.subscribers[eventType]) {
      for (const subscriber in this.subscribers[eventType]) {
        let handler = this.subscribers[eventType][subscriber]
        handler.func(data, this, handler.options)
        if (handler.options.once) delete this.subscribers[eventType][subscriber]
      }
    }
    return this
  }

  /**
   * Removes a listener from the specified event type using the provided ID.
   * @param {string} eventType - The event type from which to remove the event handler.
   * @param {number} id - The ID of the event handler to remove.
   * @returns {EventHandler} - Returns the current instance of the EventHandler class.
   */
  removeEventListener(eventType, id) {
    if (this.subscribers[eventType]) {
      delete this.subscribers[eventType][id]
    }
    return this
  }

  /**
   * Adds a listener to the specified event type and returns the assigned ID.
   * @param {string} eventType - The event type to which the event handler is added.
   * @param {Function} func - The function to be called when the event fires. It accepts eventData, targetObject and options as parameters.
   * @param {Object} id_handler - An object whose value field will be assigned to the generated ID.
   * @param {Object} options - Additional options for the event listener.
   * @param {boolean} options.once - Specifies if the listener should fire only once.
   * @param {boolean} options.return_id - Specifies whether to return the ID of the listener instead of the EventHandler object.
   * @param {Object} options.pointer - An object to track. When the tracked object is destroyed, the listener will also be removed.
   * @returns {number|EventHandler} - Returns the ID of the listener if `options.return_id` is `true`, otherwise returns the current instance of the EventHandler class.
   */
  addEventListener(eventType, func, id_handler = {}, options = {}) {
    if (this.subscribers[eventType] == undefined) {
      this.subscribers[eventType] = {}
    }

    let id = EventHandler.ids
    EventHandler.ids++
    id_handler.value = id

    if (options.pointer) {
      EventHandler.registers[id] = new FinalizationRegistry(() => {
        delete this.subscribers[eventType][id]
        delete EventHandler.registers[id]
      })
      EventHandler.registers[id].register(options.pointer, "nothing")
      delete options.pointer
    }

    this.subscribers[eventType][id] = { func: func, options: options }

    if (options.return_id) {
      return id
    }
    return this
  }

  /**
   * Creates a shallow copy of the subscribers object.
   * @returns {Object} - A shallow copy of the subscribers object.
   */
  copySubscribers() {
    return ObjectHelper.copy(this.subscribers)
  }

  /**
   * Copies the subscribers from the specified event handler object to the current instance.
   * @param {EventHandler} event_handler - The event handler object from which to copy the subscribers.
   */
  copySubscribersFrom(event_handler) {
    if (event_handler instanceof EventHandler) {
      this.subscribers = event_handler.copySubscribers()
    }
  }
}
