import React, { useState, useEffect, useRef } from 'react';
import './App.css'


function Form() {
  function onFormSubmit(event) {

    event.preventDefault();
    const formData = new FormData(event.target);
    console.log(formData.get("device"));
    console.log(formData.get("cluster"));
    console.log(event.nativeEvent.submitter.value);
  }
  return (
    <div className="main-form w-full max-w-xs">
      <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={onFormSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            Device
          </label>
          <select className="rounded-md shadow-lg w-full h-8" name="device" id="device">
            <option value="OMP">OMP</option>
            <option value="BFD">BFD</option>
            <option value="Auto-Tunnel">Auto-Tunnel</option>
            <option value="SSE">SSE</option>
            <option value="Device">Device</option>
            <option value="B2B-HA">B2B-HA</option>
          </select>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cluster">Cluster</label>
          <select className="rounded-md shadow-lg w-full h-8" name="cluster" id="cluster">
            <option value="1K">1K</option>
            <option value="2K">2K</option>
            <option value="5K">5K</option>
            <option value="10K">10K</option>
          </select>

        </div>
        <div className="flex items-center justify-around">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" name="action" value="configure" type="submit">
            Configure
          </button>
          <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" name="action" value="destroy" type="submit">
            Destroy
          </button>

        </div>
      </form>
    </div>
  );

}

function CommandInterface() {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('');
  const outputRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    wsRef.current = new WebSocket('ws://localhost:3000');

    wsRef.current.onopen = () => {
      console.log('WebSocket connection established');
    };

    wsRef.current.onmessage = (event) => {
      setOutput(prevOutput => prevOutput + event.data + '\n');
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const runCommand = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(command);
      setCommand(''); // Clear the input field
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      runCommand();
    }
  };

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div>
      <h1>Command Output</h1>
      <input
        type="text"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Enter command"
      />
      <pre ref={outputRef} style={{ maxHeight: '400px', overflow: 'auto' }}>
        {output}
      </pre>
    </div>
  );
}
function App() {

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="font-sans text-3xl m-5">
        Configure Devices
      </h1>
      <Form />
      <CommandInterface />
    </div>
  )
}

export default App
