import React, { Component } from 'react';
import { provide } from "./utils/context";
import AppCanvas from './components/AppCanvas/AppCanvas'
import Debug from './components/Debug/Debug'
import './App.css';
import Info from './components/Info/Info';

class App extends Component {
  render() {
    return (
      <div ref='app' className='app'>
        <Info />
        <Debug />
        <AppCanvas />
      </div>
    );
  }
}

export default provide(App)
