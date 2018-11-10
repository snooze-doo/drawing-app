import React, { Component } from 'react';
import { consume } from "../../utils/context";
import Layer from '../Layer/Layer';
import './AppCanvas.css'

class AppCanvas extends Component {
  render() {
  const { drawingState: { canvas, transform } } = this.props
    return (
      <div 
        className='app-canvas'
        style={{
          position: 'absolute',
          width: `${canvas.size.x}px`,
          height: `${canvas.size.y}px`,
          backgroundColor: 'white',
          transition: '0s ease-out',
          transform: `
            translate(
              ${transform.position.x}px,
              ${transform.position.y}px
            )
            rotate(
              ${transform.rotation}deg
            )
            scale(
              ${transform.scale}
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
