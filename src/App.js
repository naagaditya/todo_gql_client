import React from 'react';
import logo from './logo.svg';
import './App.css';
import Draggable from './Draggable';

function App() {
  const arr = ['adtya', 'naag', 'adasda', 'adgfrew']
  return (
    <div className="App">
      <Draggable>
        {
          arr.map((a,i) => <div draggable key={i} style={{
            padding:'10px',
            height: '100px',
            width: '100px'
          }}>{a}</div>)
        }
      </Draggable>
    </div>
  );
}

export default App;
