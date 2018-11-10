import KE from './keyevents'

const T = {
  NONE: {
    id: 0,
    name: 'None',
    key: null,
    tmp_key: null,
    default_cursor: 'default',
    url_cursor: 'url()'
  },
  CURSOR: {
    id: 1,
    name: "Cursor",
    key: KE.DOM_VK_V,
    tmp_key: null,
    default_cursor: 'default',
    url_cursor: 'url()'
  },
  BRUSH: {
    id: 2,
    name: "Brush",
    key: KE.DOM_VK_B,
    tmp_key: null,
    default_cursor: 'crosshair',
    url_cursor: 'url()'
  },
  HAND: {
    id: 3,
    name: "Hand",
    key: KE.DOM_VK_H,
    tmp_key: [ KE.DOM_VK_SPACE ],
    default_cursor: 'grab',
    url_cursor: 'url()'
  },
  ROTATION: {
    id: 4,
    name: "Rotation",
    key: KE.DOM_VK_R,
    tmp_key: [ KE.DOM_VK_ALT, KE.DOM_VK_SPACE ],
    default_cursor: `url(cursors/rotate.png) 16 16, default`,
    url_cursor: 'url(cursors/rotate.png)'
  },
  ZOOM: {
    id: 5,
    name: "Zoom",
    key: KE.DOM_VK_Z,
    tmp_key: null,
    default_cursor: 'zoom-in',
    url_cursor: 'url()'
  },
  ZOOM_IN: {
    id: 6,
    name: "Zoom In",
    key: null,
    tmp_key: [ KE.DOM_VK_CONTROL, KE.DOM_VK_SPACE ],
    default_cursor: 'zoom-in',
    url_cursor: 'url()'
  },
  ZOOM_OUT: {
    id: 7,
    name: "Zoom Out",
    key: null,
    tmp_key: [ KE.DOM_VK_CONTROL, KE.DOM_VK_ALT, KE.DOM_VK_SPACE ],
    default_cursor: 'zoom-out',
    url_cursor: 'url()'
  }
}

export const ToolsArray = [
  T.NONE, T.CURSOR, T.BRUSH,
  T.HAND, T.ROTATION, T.ZOOM,
  T.ZOOM_IN, T.ZOOM_OUT
]

export default T