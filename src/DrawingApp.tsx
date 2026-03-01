import React, { useRef, useEffect, useState } from "react";
import { DrawingCanvas } from "./components/DrawingCanvas";
import { DrawingController } from "./controllers/DrawingController";

export const DrawingApp: React.FC = () => {
  const drawingControllerRef = useRef<DrawingController | null>(null);
  const [suggestion, setSuggestion] = useState<any>(null);

  if (!drawingControllerRef.current) {
    const controller = new DrawingController('ws://localhost:8001/ws/drawing');
    controller.onSuggestion((sug) => setSuggestion(sug));
    drawingControllerRef.current = controller;
  }

  useEffect(() => {
    drawingControllerRef.current?.connect();
    return () => {
      drawingControllerRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <h2 className="text-2xl mb-2">自由绘画示例 (Pixi)</h2>
        <DrawingCanvas
          controller={drawingControllerRef.current!}
          width={800}
          height={600}
          backgroundColor={0xffffff}
        />
        {suggestion && (
          <div className="mt-4 p-4 bg-gray-800 rounded">
            <h3>推荐建议</h3>
            <pre>{JSON.stringify(suggestion, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};