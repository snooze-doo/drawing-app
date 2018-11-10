import React, { Component } from 'react';
import { consume } from "../../utils/context";
import Layer from '../Layer/Layer';
import './AppCanvas.css'

class AppCanvas extends Component {
  render() {
  const { drawingState: { canvas } } = this.props
    return (
      <div 
        className='app-canvas'
        style={{
          position: 'absolute',
          width: `${canvas.transform.size.x}px`,
          height: `${canvas.transform.size.y}px`,
          backgroundColor: 'white',
          transform: `
            translate(
              ${canvas.transform.position.x}px,
              ${canvas.transform.position.y}px
            )
            rotate(
              ${canvas.transform.rotation}deg
            )
            scale(
              ${canvas.transform.scale}
            )
          `
        }}
      >
        {canvas.loading && (
          <div className='loading'>
            <div className="loader">Loading...</div>
          </div>
        )}
        {canvas.layers.map(e => {
          return <Layer key={`layer-${e.id}`} id={e.id} />
        })}
      </div>
    )
  }
}

export default consume(AppCanvas)
