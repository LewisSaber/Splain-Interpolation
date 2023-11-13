let DataFrameRegistry = {
  frames: {},
  addDataFrame(df) {
    this.frames[df.getName()] = df
  },
  hasFrame(name) {
    return Object.keys(frames).includes(name)
  },
  getDataFrame(name) {
    return this.frames[name]
  },
  removeDataFrame(name) {
    this.frames[name] == undefined
  },
}
export default DataFrameRegistry
