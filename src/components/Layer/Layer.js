import React, { Component } from 'react'
import { consume } from "../../utils/context"
import './Layer.css'

class Layer extends Component {
  componentDidMount = () => {
    const { drawingMethods: { loadLayer }, id } = this.props
    const element = this.refs[`layer-${id}`]
    const ctx = element.getContext('2d')
    ctx.imageSmoothingEnabled = false
    loadLayer(id, { ctx, element })
  }



  render() {
    const { drawingState: { canvas }, id } = this.props
    return <canvas
      className={`layer${canvas.activeLayer === id ? ' active' : ''}`}
      ref={`layer-${id}`}
      width={canvas.size.x}
      height={canvas.size.y}
    />
  }
}

export default consume(Layer)
