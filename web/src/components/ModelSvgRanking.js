import React, { useState } from 'react';

// interface ModelRankItem {
// score : number;
// name : string;
// logo : string;
// }

const ModelSvgRanking = ({items}) => {

  items.sort((a, b) => a.score < b.score ? -1 : a.score > b.score ? 1 : 0)
  const delta = items.reduce((a, b) => a + b.score, 0)/items.length;
  const max = items.reduce((a, b) => Math.max(a, b.score), -Infinity) + delta;
  const min = items.reduce((a, b) => Math.min(a, b.score), Infinity) - delta;

  const [hoveredItem, setHoveredItem] = useState(null);

  const svgWidth = 1000;
  const svgHeight = 100;

  return (<>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${svgWidth} ${svgHeight}`} className='rounded-lg border-[1px] border-white'>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{"stopColor": "rgb(0,255,0)", "stopOpacity": "1"}} />
          <stop offset="50%" style={{"stopColor": "rgb(0,128,128)", "stopOpacity": "1"}}/>
          <stop offset="100%" style={{"stopColor": "rgb(0,0,255)", "stopOpacity": "1"}} />
        </linearGradient>
         {/* Shadow filter */}
         <filter id="shadow" x="-20%" y="-20%" width="150%" height="150%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="black" floodOpacity="0.5" />
        </filter>
      </defs>
      <text height="25"
                  fill="black"
                  stroke="white"
                  strokeWidth="1"
                  rx="3"
                  ry="3">{hoveredItem}</text>
      <rect width={svgWidth} height={svgHeight} fill="url(#gradient)" />
      {items.map((item, index) => {
        

        console.log((item.score - min)/(max - min));
        const xPosition = (((item.score - min)/(max - min))) * svgWidth;
        // const amplitude = 20;
        // const frequency = 1.2;
        const yPosition = svgHeight / 2;
        // const yPosition = 50 + amplitude * Math.sin(index * frequency * Math.PI);

        // Check if the yPosition is too close to the top
        const isTooCloseToTop = yPosition - 55 < 0;
        const tooltipYPosition = isTooCloseToTop ? yPosition + 15 : yPosition - 55;
        const textYPosition = isTooCloseToTop ? yPosition + 32 : yPosition - 40;

        return (
          <g key={item.name}
            onMouseEnter={() => setHoveredItem(item.name)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            {/* White background for the image */}
            <rect
              x={xPosition - 17}
              y={yPosition - 22}
              width="32"
              height="32"
              fill="white"
              stroke="white"
              rx="5"
              ry="5"
              filter="url(#shadow)"
            />
            {/* Company logo */}
            <image
              href={`/provider/${item.logo}`}
              x={xPosition - 15}
              y={yPosition - 20}
              width="28"
              height="28"
              z={-10}
            />
            
            {/* Tooltip on hover */}
            {hoveredItem === item.name && (
              <g>
                <rect
                  x={xPosition - 50 / 2 - 10}
                  y={tooltipYPosition}
                  width={50 + 20}
                  height="25"
                  fill="black"
                  stroke="white"
                  strokeWidth="1"
                  rx="3"
                  ry="3"
                  z={10}
                  filter="url(#shadow)"
                />
                <text
                  x={xPosition}
                  y={textYPosition}
                  textAnchor="middle"
                  fontSize="12"
                  fill="white"
                  z={10}
                >
                  {item.score.toFixed(4)}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
    </>);
};

export default ModelSvgRanking;
