import React, { Component } from 'react';
import { consume } from "../../utils/context";

class Layer extends Component {
  componentDidMount = () => {
    const { drawingMethods: { loadLayer }, id } = this.props
    const canvas = this.refs[`layer-${id}`]
    const ctx = canvas.getContext('2d')
    loadLayer(id, { ctx, canvas })
  }



  render() {
    const { drawingState: { canvas }, id } = this.props
    return <canvas
      className={`layer${canvas.activeLayer === id ? ' active' : ''}`}
      ref={`layer-${id}`}
      width={canvas.transform.size.x}
      height={canvas.transform.size.y}
    />
  }
}

export default consume(Layer)
