import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { SourceImage } from '../types';

interface DrawingCanvasProps {
  onDrawingChange: (image: SourceImage | null) => void;
}

const COLORS = ['#FFFFFF', '#000000', '#EF4444', '#3B82F6', '#22C55E', '#EAB308'];

const DrawingCanvas = forwardRef<any, DrawingCanvasProps>(({ onDrawingChange }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [blankCanvasData, setBlankCanvasData] = useState<string | null>(null);
  const [strokeColor, setStrokeColor] = useState('#FFFFFF');
  const [lineWidth, setLineWidth] = useState(5);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const container = canvas.parentElement;
    if (container) {
        const { width } = container.getBoundingClientRect();
        canvas.width = width;
        canvas.height = width * (9 / 16);
    }
    
    const context = canvas.getContext('2d');
    if (!context) return;
    context.lineCap = 'round';
    context.strokeStyle = strokeColor;
    context.lineWidth = lineWidth;
    contextRef.current = context;

    if (!blankCanvasData) {
        setBlankCanvasData(canvas.toDataURL('image/png'));
    }
  }, [strokeColor, lineWidth, blankCanvasData]);

  const startDrawing = ({ nativeEvent }: React.MouseEvent | React.TouchEvent) => {
    const event = 'touches' in nativeEvent ? nativeEvent.touches[0] : nativeEvent;
    if (!event) return;
    const { offsetX, offsetY } = getCoords(event);
    if (!contextRef.current) return;
    contextRef.current.strokeStyle = strokeColor;
    contextRef.current.lineWidth = lineWidth;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    contextRef.current?.closePath();
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        if (dataUrl !== blankCanvasData) {
            const base64Data = dataUrl.split(',')[1];
            onDrawingChange({ data: base64Data, mimeType: 'image/png' });
        } else {
            onDrawingChange(null);
        }
    }
  };

  const draw = ({ nativeEvent }: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const event = 'touches' in nativeEvent ? nativeEvent.touches[0] : nativeEvent;
    if (!event) return;
    const { offsetX, offsetY } = getCoords(event);
    contextRef.current?.lineTo(offsetX, offsetY);
    contextRef.current?.stroke();
  };
  
  const getCoords = (event: MouseEvent | Touch) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const scaleX = canvasRef.current!.width / rect.width;
      const scaleY = canvasRef.current!.height / rect.height;

      return {
          offsetX: (event.clientX - rect.left) * scaleX,
          offsetY: (event.clientY - rect.top) * scaleY,
      };
  };

  const handleTouchEvent = (handler: (e: React.TouchEvent) => void) => (e: React.TouchEvent) => {
    e.preventDefault();
    handler(e);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      onDrawingChange(null);
    }
  };

  useImperativeHandle(ref, () => ({
    clearCanvas,
  }));

  return (
    <div className='w-full flex flex-col gap-4'>
        <div className="relative w-full aspect-video bg-gray-900/40 rounded-lg border-2 border-gray-600 overflow-hidden touch-none">
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseUp={finishDrawing}
                onMouseMove={draw}
                onMouseLeave={finishDrawing}
                onTouchStart={handleTouchEvent(startDrawing)}
                onTouchEnd={handleTouchEvent(finishDrawing)}
                onTouchMove={handleTouchEvent(draw)}
                className="w-full h-full"
            />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 bg-gray-900/40 p-2 rounded-lg">
                <label className="text-sm font-medium text-gray-400">Color:</label>
                <div className="flex items-center gap-1.5">
                    {COLORS.map(color => (
                        <button key={color} onClick={() => setStrokeColor(color)} className={`w-6 h-6 rounded-full border-2 transition ${strokeColor === color ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                    ))}
                </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-900/40 p-2 rounded-lg">
                <label htmlFor="lineWidth" className="text-sm font-medium text-gray-400">Size:</label>
                <input id="lineWidth" type="range" min="1" max="50" value={lineWidth} onChange={e => setLineWidth(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
            </div>
        </div>
        <button
            onClick={clearCanvas}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-200"
        >
            Clear Drawing
        </button>
    </div>
  );
});

export default DrawingCanvas;