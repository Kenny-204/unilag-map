import  { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { createMapGraph } from '../PathFinding.js';


const App = () => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredElement, setHoveredElement] = useState(null);
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const [path, setPath] = useState(null);
  
  const svgRef = useRef(null);
  
  // Constants for map
  const ROAD_WIDTH = 24;
  const LANE_WIDTH = 6;
  const FIRST_SEGMENT_LENGTH = 350;
  const SECOND_SEGMENT_LENGTH = 350;
  const NITHUB_SEGMENT_LENGTH = 300;
  const ROUNDABOUT_RADIUS = 20;
  const ROAD_START_Y = 350;
  const SIDE_ROAD_START = ROAD_START_Y - 160;
  const SIDE_ROAD_LENGTH = 80;
  const CHAPEL_PATH_START = ROAD_START_Y - FIRST_SEGMENT_LENGTH - 120;
  const CHAPEL_PATH_LENGTH = 120 + ROAD_WIDTH/2;
  const CHAPEL_TURN_LENGTH = 40;
  const CHAPEL_FINAL_LENGTH = 40;
  const MOSQUE_PATH_START = CHAPEL_PATH_START - 80;
  const MOSQUE_PATH_LENGTH = 100 + ROAD_WIDTH/2;
  const STRAIGHT_EXIT_LENGTH = 100;

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const newScale = Math.min(Math.max(0.5, scale - e.deltaY * 0.001), 2);
    setScale(newScale);
  };

  const handleZoomIn = () => {
    setScale(Math.min(scale + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale(Math.max(scale - 0.1, 0.5));
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setPath(null);
    setSelectedStart(null);
    setSelectedEnd(null);
  };

  const handleLocationClick = (location) => {
    if (!selectedStart) {
      setSelectedStart(location);
    } else if (!selectedEnd) {
      setSelectedEnd(location);
      const graph = createMapGraph();
      const result = graph.dijkstra(selectedStart, location);
      setPath(result.path);
    } else {
      setSelectedStart(location);
      setSelectedEnd(null);
      setPath(null);
    }
  };

  const getLocationCoordinates = (location) => {
    const coordinates = {
      // Original locations
      'Gate': { x: 100, y: ROAD_START_Y },
      'RB1': { x: 100, y: ROAD_START_Y - FIRST_SEGMENT_LENGTH },
      'RB2': { x: 100, y: ROAD_START_Y - FIRST_SEGMENT_LENGTH - SECOND_SEGMENT_LENGTH },
      'NitHub': { x: 400, y: ROAD_START_Y - FIRST_SEGMENT_LENGTH - SECOND_SEGMENT_LENGTH },
      'FES': { x: 100 - SIDE_ROAD_LENGTH - ROAD_WIDTH/2, y: SIDE_ROAD_START },
      'Chapel': { x: 100 - CHAPEL_TURN_LENGTH - ROAD_WIDTH/2, y: CHAPEL_PATH_START - CHAPEL_FINAL_LENGTH },
      'Mosque': { x: 100 - MOSQUE_PATH_LENGTH, y: MOSQUE_PATH_START },
      'RB1_straight': { x: 100, y: ROAD_START_Y - FIRST_SEGMENT_LENGTH - ROUNDABOUT_RADIUS - STRAIGHT_EXIT_LENGTH },
      'RB2_straight': { x: 100, y: ROAD_START_Y - FIRST_SEGMENT_LENGTH - SECOND_SEGMENT_LENGTH - ROUNDABOUT_RADIUS - STRAIGHT_EXIT_LENGTH },
      
      // FES turn nodes
      'FES_Turn1': { x: 100 - ROAD_WIDTH/2, y: SIDE_ROAD_START },
      'FES_Turn2': { x: 100 - SIDE_ROAD_LENGTH/2 - ROAD_WIDTH/2, y: SIDE_ROAD_START },
      
      // Chapel turn nodes
      'Chapel_Turn1': { x: 100 - ROAD_WIDTH/2, y: CHAPEL_PATH_START },
      'Chapel_Turn2': { x: 100 - CHAPEL_PATH_LENGTH/2, y: CHAPEL_PATH_START },
      'Chapel_Turn3': { x: 100 - CHAPEL_TURN_LENGTH - ROAD_WIDTH/2, y: CHAPEL_PATH_START },
      
      // Mosque turn nodes
      'Mosque_Turn1': { x: 100 - ROAD_WIDTH/2, y: MOSQUE_PATH_START },
      'Mosque_Turn2': { x: 100 - MOSQUE_PATH_LENGTH/2, y: MOSQUE_PATH_START },
      
      // NitHub turn nodes
      'NitHub_Turn1': { x: 250, y: ROAD_START_Y - FIRST_SEGMENT_LENGTH - SECOND_SEGMENT_LENGTH },
      'NitHub_Turn2': { x: 350, y: ROAD_START_Y - FIRST_SEGMENT_LENGTH - SECOND_SEGMENT_LENGTH }
    };
    return coordinates[location];
  };

  const renderPath = () => {
    if (!path || path.length < 2) return null;

    const pathCoords = path.map(getLocationCoordinates);
    const pathData = pathCoords.reduce((acc, coord, i) => {
      if (i === 0) return `M ${coord.x} ${coord.y}`;
      return `${acc} L ${coord.x} ${coord.y}`;
    }, '');

    return (
      <path
        d={pathData}
        stroke="#ef4444"
        strokeWidth="4"
        fill="none"
        strokeDasharray="8,8"
        className="animate-dash"
      />
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="border rounded-lg shadow-lg bg-white p-4">
        <div className="mb-4 flex gap-2">
          <button
            onClick={handleZoomIn}
            className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
            title="Reset View"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div 
          className="overflow-hidden border rounded bg-gray-50" 
          style={{ height: '600px' }}
          onWheel={handleWheel}
        >
          <svg 
            ref={svgRef}
            viewBox="-100 -100 1000 800"
            className="w-full h-full cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <g transform={`translate(${position.x}, ${position.y}) scale(${scale})`}>
              {/* Grid */}
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path 
                  d="M 50 0 L 0 0 0 50" 
                  fill="none" 
                  stroke="gray" 
                  strokeWidth="0.5" 
                  opacity="0.2"
                />
              </pattern>
              <rect 
                width="800" 
                height="600" 
                fill="url(#grid)" 
                x="-100" 
                y="-100"
              />

              {/* Main Road System */}
              <g>
                {/* Base roads */}
                <path
                  d={`
                    M 100 ${ROAD_START_Y}
                    L 100 ${ROAD_START_Y - FIRST_SEGMENT_LENGTH}
                    L 100 ${ROAD_START_Y - FIRST_SEGMENT_LENGTH - SECOND_SEGMENT_LENGTH}
                    L 400 ${ROAD_START_Y - FIRST_SEGMENT_LENGTH - SECOND_SEGMENT_LENGTH}
                  `}
                  stroke="#374151"
                  strokeWidth={ROAD_WIDTH}
                  strokeLinecap="butt"
                  fill="none"
                />

                {/* Straight exits from roundabouts */}
                <g>
                  {/* RB1 straight exit */}
                  <path
                    d={`
                      M 100 ${ROAD_START_Y - FIRST_SEGMENT_LENGTH - ROUNDABOUT_RADIUS}
                      L 100 ${ROAD_START_Y - FIRST_SEGMENT_LENGTH - ROUNDABOUT_RADIUS - STRAIGHT_EXIT_LENGTH}
                    `}
                    stroke="#374151"
                    strokeWidth={ROAD_WIDTH}
                    strokeLinecap="round"
                    fill="none"
                  />
                  
                  {/* RB2 straight exit */}
                  <path
                    d={`
                      M 100 ${ROAD_START_Y - FIRST_SEGMENT_LENGTH - SECOND_SEGMENT_LENGTH - ROUNDABOUT_RADIUS}
                      L 100 ${ROAD_START_Y - FIRST_SEGMENT_LENGTH - SECOND_SEGMENT_LENGTH - ROUNDABOUT_RADIUS - STRAIGHT_EXIT_LENGTH}
                    `}
                    stroke="#374151"
                    strokeWidth={ROAD_WIDTH}
                    strokeLinecap="round"
                    fill="none"
                  />
                </g>

                {/* Yellow center lines */}
                <path
                  d={`
                    M 100 ${ROAD_START_Y}
                    L 100 ${ROAD_START_Y - FIRST_SEGMENT_LENGTH}
                    L 100 ${ROAD_START_Y - FIRST_SEGMENT_LENGTH - SECOND_SEGMENT_LENGTH}
                    L 400 ${ROAD_START_Y - FIRST_SEGMENT_LENGTH - SECOND_SEGMENT_LENGTH}
                  `}
                  stroke="yellow"
                  strokeWidth="2"
                  strokeLinecap="butt"
                  fill="none"
                />

                {/* Yellow center lines for straight exits */}
                <g>
                  <path
                    d={`
                      M 100 ${ROAD_START_Y - FIRST_SEGMENT_LENGTH - ROUNDABOUT_RADIUS}
                      L 100 ${ROAD_START_Y - FIRST_SEGMENT_LENGTH - ROUNDABOUT_RADIUS - STRAIGHT_EXIT_LENGTH}
                    `}
                    stroke="yellow"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d={`
                      M 100 ${ROAD_START_Y - FIRST_SEGMENT_LENGTH - SECOND_SEGMENT_LENGTH - ROUNDABOUT_RADIUS}
                      L 100 ${ROAD_START_Y - FIRST_SEGMENT_LENGTH - SECOND_SEGMENT_LENGTH - ROUNDABOUT_RADIUS - STRAIGHT_EXIT_LENGTH}
                    `}
                    stroke="yellow"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                </g>

                {/* Lane dividers */}
                <g>
                {[LANE_WIDTH, -LANE_WIDTH].map((offset, index) => (
                    <path
                      key={index}
                      d={`
                        M ${100 + offset} ${ROAD_START_Y}
                        L ${100 + offset} ${ROAD_START_Y - FIRST_SEGMENT_LENGTH}
                        L ${100 + offset} ${ROAD_START_Y - FIRST_SEGMENT_LENGTH - SECOND_SEGMENT_LENGTH}
                        L 400 ${ROAD_START_Y - FIRST_SEGMENT_LENGTH - SECOND_SEGMENT_LENGTH}
                      `}
                      stroke="white"
                      strokeWidth="1"
                      strokeDasharray="10,10"
                      fill="none"
                    />
                  ))}
                  
                  {/* Lane dividers for straight exits */}
                  {[LANE_WIDTH, -LANE_WIDTH].map((offset, index) => (
                    <g key={`straight-exit-${index}`}>
                      <path
                        d={`
                          M ${100 + offset} ${ROAD_START_Y - FIRST_SEGMENT_LENGTH - ROUNDABOUT_RADIUS}
                          L ${100 + offset} ${ROAD_START_Y - FIRST_SEGMENT_LENGTH - ROUNDABOUT_RADIUS - STRAIGHT_EXIT_LENGTH}
                        `}
                        stroke="white"
                        strokeWidth="1"
                        strokeDasharray="10,10"
                        fill="none"
                      />
                      <path
                        d={`
                          M ${100 + offset} ${ROAD_START_Y - FIRST_SEGMENT_LENGTH - SECOND_SEGMENT_LENGTH - ROUNDABOUT_RADIUS}
                          L ${100 + offset} ${ROAD_START_Y - FIRST_SEGMENT_LENGTH - SECOND_SEGMENT_LENGTH - ROUNDABOUT_RADIUS - STRAIGHT_EXIT_LENGTH}
                        `}
                        stroke="white"
                        strokeWidth="1"
                        strokeDasharray="10,10"
                        fill="none"
                      />
                    </g>
                  ))}
                </g>
              </g>

              {/* Gate */}
              <g>
                <line 
                  x1="70" 
                  y1={ROAD_START_Y} 
                  x2="130" 
                  y2={ROAD_START_Y} 
                  stroke="#1e40af"
                  strokeWidth="4"
                  className={`transition-all duration-300 cursor-pointer ${hoveredElement === 'gate' ? 'stroke-blue-400' : ''} ${selectedStart === 'Gate' ? 'stroke-green-500' : ''} ${selectedEnd === 'Gate' ? 'stroke-red-500' : ''}`}
                  onMouseEnter={() => setHoveredElement('gate')}
                  onMouseLeave={() => setHoveredElement(null)}
                  onClick={() => handleLocationClick('Gate')}
                />
                <text 
                  x="150" 
                  y={ROAD_START_Y + 5} 
                  className="text-sm font-medium" 
                  fill="#1e40af"
                >
                  Gate
                </text>
              </g>

              {/* Buildings and Paths */}
              {/* NitHub */}
              <g>
                <rect
                  x={400}
                  y={ROAD_START_Y - FIRST_SEGMENT_LENGTH - SECOND_SEGMENT_LENGTH - 40}
                  width="60"
                  height="30"
                  fill="#e5e7eb"
                  stroke="#374151"
                  strokeWidth="1"
                  className={`transition-all duration-300 cursor-pointer ${hoveredElement === 'nithub' ? 'fill-gray-200' : ''} ${selectedStart === 'NitHub' ? 'fill-green-200' : ''} ${selectedEnd === 'NitHub' ? 'fill-red-200' : ''}`}
                  onMouseEnter={() => setHoveredElement('nithub')}
                  onMouseLeave={() => setHoveredElement(null)}
                  onClick={() => handleLocationClick('NitHub')}
                />
                <text
                  x={430}
                  y={ROAD_START_Y - FIRST_SEGMENT_LENGTH - SECOND_SEGMENT_LENGTH - 20}
                  className="text-sm font-medium"
                  fill="#1e40af"
                  textAnchor="middle"
                >
                  NitHub
                </text>
              </g>

              {/* FES Building and Path */}
              <g>
                <line
                  x1={100 - ROAD_WIDTH/2}
                  y1={SIDE_ROAD_START}
                  x2={100 - ROAD_WIDTH/2 - SIDE_ROAD_LENGTH}
                  y2={SIDE_ROAD_START}
                  stroke="#374151"
                  strokeWidth={LANE_WIDTH * 2}
                  strokeLinecap="round"
                />
                <rect
                  x={65 - SIDE_ROAD_LENGTH - ROAD_WIDTH/2}
                  y={SIDE_ROAD_START - 15}
                  width="30"
                  height="30"
                  fill="#e5e7eb"
                  stroke="#374151"
                  strokeWidth="1"
                  className={`transition-all duration-300 cursor-pointer ${hoveredElement === 'faculty' ? 'fill-gray-200' : ''} ${selectedStart === 'FES' ? 'fill-green-200' : ''} ${selectedEnd === 'FES' ? 'fill-red-200' : ''}`}
                  onMouseEnter={() => setHoveredElement('faculty')}
                  onMouseLeave={() => setHoveredElement(null)}
                  onClick={() => handleLocationClick('FES')}
                />
                <text 
                  x={80 - SIDE_ROAD_LENGTH - ROAD_WIDTH/2}
                  y={SIDE_ROAD_START + 5}
                  className="text-xs font-medium"
                  fill="#1e40af"
                  textAnchor="middle"
                >
                  FES
                </text>
              </g>

              {/* Chapel and Path */}
              <g>
                <line
                  x1={100 - ROAD_WIDTH/2}
                  y1={CHAPEL_PATH_START}
                  x2={100 - CHAPEL_PATH_LENGTH}
                  y2={CHAPEL_PATH_START}
                  stroke="#374151"
                  strokeWidth={LANE_WIDTH * 2}
                  strokeLinecap="butt"
                />
                <line
                  x1={100 - CHAPEL_TURN_LENGTH - ROAD_WIDTH/2}
                  y1={CHAPEL_PATH_START}
                  x2={100 - CHAPEL_TURN_LENGTH - ROAD_WIDTH/2}
                  y2={CHAPEL_PATH_START - CHAPEL_FINAL_LENGTH}
                  stroke="#374151"
                  strokeWidth={LANE_WIDTH * 2}
                  strokeLinecap="round"
                />
                <rect
                  x={85 - CHAPEL_TURN_LENGTH - ROAD_WIDTH/2}
                  y={CHAPEL_PATH_START - CHAPEL_FINAL_LENGTH - 25}
                  width="30"
                  height="25"
                  fill="#e5e7eb"
                  stroke="#374151"
                  strokeWidth="1"
                  className={`transition-all duration-300 cursor-pointer ${hoveredElement === 'chapel' ? 'fill-gray-200' : ''} ${selectedStart === 'Chapel' ? 'fill-green-200' : ''} ${selectedEnd === 'Chapel' ? 'fill-red-200' : ''}`}
                  onMouseEnter={() => setHoveredElement('chapel')}
                  onMouseLeave={() => setHoveredElement(null)}
                  onClick={() => handleLocationClick('Chapel')}
                />
                <text
                  x={100 - CHAPEL_TURN_LENGTH - ROAD_WIDTH/2}
                  y={CHAPEL_PATH_START - CHAPEL_FINAL_LENGTH - 10}
                  className="text-xs font-medium"
                  fill="#1e40af"
                  textAnchor="middle"
                >
                  Chapel
                </text>
              </g>

              {/* Mosque and Path */}
              <g>
                <line
                  x1={100 - ROAD_WIDTH/2}
                  y1={MOSQUE_PATH_START}
                  x2={100 - MOSQUE_PATH_LENGTH}
                  y2={MOSQUE_PATH_START}
                  stroke="#374151"
                  strokeWidth={LANE_WIDTH * 2}
                  strokeLinecap="round"
                />
                <rect
                  x={60 - MOSQUE_PATH_LENGTH}
                  y={MOSQUE_PATH_START - 15}
                  width="30"
                  height="30"
                  fill="#e5e7eb"
                  stroke="#374151"
                  strokeWidth="1"
                  className={`transition-all duration-300 cursor-pointer ${hoveredElement === 'mosque' ? 'fill-gray-200' : ''} ${selectedStart === 'Mosque' ? 'fill-green-200' : ''} ${selectedEnd === 'Mosque' ? 'fill-red-200' : ''}`}
                  onMouseEnter={() => setHoveredElement('mosque')}
                  onMouseLeave={() => setHoveredElement(null)}
                  onClick={() => handleLocationClick('Mosque')}
                />
                <text
                  x={75 - MOSQUE_PATH_LENGTH}
                  y={MOSQUE_PATH_START + 5}
                  className="text-xs font-medium"
                  fill="#1e40af"
                  textAnchor="middle"
                >
                  Mosque
                </text>
              </g>

              {/* Distance Labels */}
              <g>
                <text x="50" y={CHAPEL_PATH_START + 5} className="text-xs" fill="#1e40af">120m</text>
                <text x="50" y={MOSQUE_PATH_START + 5} className="text-xs" fill="#1e40af">100m</text>
                <text x="130" y={ROAD_START_Y - (FIRST_SEGMENT_LENGTH / 2)} className="text-xs" fill="#1e40af">350m</text>
                <text x="130" y={ROAD_START_Y - FIRST_SEGMENT_LENGTH - (SECOND_SEGMENT_LENGTH / 2)} className="text-xs" fill="#1e40af">350m</text>
                <text x="250" y={ROAD_START_Y - FIRST_SEGMENT_LENGTH - SECOND_SEGMENT_LENGTH - 10} className="text-xs" fill="#1e40af">300m</text>
                <text x="50" y={ROAD_START_Y - FIRST_SEGMENT_LENGTH - ROUNDABOUT_RADIUS - STRAIGHT_EXIT_LENGTH/2} className="text-xs" fill="#1e40af">100m</text>
                <text x="50" y={ROAD_START_Y - FIRST_SEGMENT_LENGTH - SECOND_SEGMENT_LENGTH - ROUNDABOUT_RADIUS - STRAIGHT_EXIT_LENGTH/2} className="text-xs" fill="#1e40af">100m</text>
              </g>

              {/* Roundabouts */}
              {[
                { y: ROAD_START_Y - FIRST_SEGMENT_LENGTH, label: 'RB1' },
                { y: ROAD_START_Y - FIRST_SEGMENT_LENGTH - SECOND_SEGMENT_LENGTH, label: 'RB2' }
              ].map((rb, index) => (
                <g key={index} transform={`translate(100, ${rb.y})`}>
                  <circle
                    r={ROUNDABOUT_RADIUS}
                    fill="#374151"
                    className={`transition-all duration-300 cursor-pointer ${hoveredElement === `roundabout${index + 1}` ? 'fill-gray-500' : ''} ${selectedStart === rb.label ? 'fill-green-500' : ''} ${selectedEnd === rb.label ? 'fill-red-500' : ''}`}
                    onMouseEnter={() => setHoveredElement(`roundabout${index + 1}`)}
                    onMouseLeave={() => setHoveredElement(null)}
                    onClick={() => handleLocationClick(rb.label)}
                  />
                  <circle
                    r={ROUNDABOUT_RADIUS - 8}
                    fill="#4ade80"
                  />
                  <text 
                    x="40"
                    y="0" 
                    className="text-sm font-medium"
                    fill="#1e40af"
                  >
                    {rb.label}
                  </text>
                </g>
              ))}

              {/* Render the path if it exists */}
              {renderPath()}

              {/* Scale indicator */}
              <g transform="translate(250, 50)">
                <line 
                  x1="0" 
                  y1="0" 
                  x2="50" 
                  y2="0" 
                  stroke="black" 
                  strokeWidth="2"
                />
                <text 
                  x="0" 
                  y="20" 
                  className="text-xs"
                >
                  50m
                </text>
              </g>
            </g>
          </svg>
        </div>

        {/* Controls Info Panel */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Map Controls</h3>
          <ul className="space-y-2 text-sm">
            <li>• Click and drag to pan the map</li>
            <li>• Use mouse wheel or buttons to zoom in/out</li>
            <li>• Click the reset button to return to default view</li>
            <li>• Click on locations to set start (green) and end (red) points for pathfinding</li>
            <li>• Current zoom: {Math.round(scale * 100)}%</li>
          </ul>
          {selectedStart && (
            <div className="mt-4">
              <p className="text-sm text-green-600">Start: {selectedStart}</p>
              {selectedEnd && (
                <p className="text-sm text-red-600">End: {selectedEnd}</p>
              )}
              {path && (
                <p className="text-sm mt-2">Path: {path.join(' → ')}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;