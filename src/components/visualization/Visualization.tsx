import React, { RefObject } from 'react';

interface VisualizationProps {
  clientCanvasRef: RefObject<HTMLCanvasElement>;
  serverCanvasRef: RefObject<HTMLCanvasElement>;
}

export const Visualization: React.FC<VisualizationProps> = ({
  clientCanvasRef,
  serverCanvasRef,
}) => {
  return (
    <div className="visualization">
      <div className="visualization-entry client">
        <canvas ref={clientCanvasRef} />
      </div>
      <div className="visualization-entry server">
        <canvas ref={serverCanvasRef} />
      </div>
    </div>
  );
};
