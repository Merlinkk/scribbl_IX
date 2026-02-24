'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useWebSocket } from '@/components/providers/WebSocketProvider';
import { COLORS, BRUSH_SIZES, EVENTS } from '@/lib/constants';
import { motion } from 'framer-motion';

interface Point { x: number; y: number; }

// Backend binary packet: 12 bytes
// [0] msgType  [1] tool  [2] colorIdx  [3] brushSize
// [4-5] x1  [6-7] y1  [8-9] x2  [10-11] y2  (all big-endian uint16)
const DRAW_PACKET_SIZE = 12;
const CANVAS_W = 800;
const CANVAS_H = 600;

function encodePacket(tool: number, colorIdx: number, size: number, from: Point, to: Point): Uint8Array {
  const buf = new ArrayBuffer(DRAW_PACKET_SIZE);
  const v = new DataView(buf);
  v.setUint8(0, 0x01);
  v.setUint8(1, tool);
  v.setUint8(2, colorIdx);
  v.setUint8(3, size);
  v.setUint16(4, Math.round(from.x), false);
  v.setUint16(6, Math.round(from.y), false);
  v.setUint16(8, Math.round(to.x), false);
  v.setUint16(10, Math.round(to.y), false);
  return new Uint8Array(buf);
}

function decodePacket(buf: ArrayBuffer) {
  if (buf.byteLength < DRAW_PACKET_SIZE) return null;
  const v = new DataView(buf);
  return {
    tool:     v.getUint8(1),
    colorIdx: v.getUint8(2),
    size:     v.getUint8(3),
    x1:       v.getUint16(4, false),
    y1:       v.getUint16(6, false),
    x2:       v.getUint16(8, false),
    y2:       v.getUint16(10, false),
  };
}

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);

  const [color, setColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1]);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');

  const { isDrawer, phase } = useGameStore();
  const { sendBinary, sendMessage, registerDrawHandler } = useWebSocket();

  const canDraw = isDrawer() && phase === 'drawing';

  // Set internal canvas resolution once
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }, []);

  const paintLine = useCallback((from: Point, to: Point, strokeColor: string, size: number) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }, []);

  // Register binary draw handler from remote players
  useEffect(() => {
    const unregister = registerDrawHandler((buffer: ArrayBuffer) => {
      if (buffer.byteLength === 0) {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx && canvas) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H); }
        return;
      }
      const pkt = decodePacket(buffer);
      if (!pkt) return;
      const strokeColor = pkt.tool === 1 ? '#ffffff' : (COLORS[pkt.colorIdx] ?? '#000000');
      paintLine({ x: pkt.x1, y: pkt.y1 }, { x: pkt.x2, y: pkt.y2 }, strokeColor, pkt.size);
    });
    return unregister;
  }, [registerDrawHandler, paintLine]);

  // Clear canvas on new round
  useEffect(() => {
    if (phase === 'choosing' || phase === 'roundEnd') {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H); }
    }
  }, [phase]);

  // Convert a mouse/touch event to canvas-space coordinates
  // Uses the canvas element's bounding rect so it works at any CSS scale
  const getCoords = useCallback((e: React.MouseEvent | React.TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    // Map from CSS pixels → internal canvas pixels
    return {
      x: ((clientX - rect.left) / rect.width)  * CANVAS_W,
      y: ((clientY - rect.top)  / rect.height) * CANVAS_H,
    };
  }, []);

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!canDraw) return;
    e.preventDefault();
    const pt = getCoords(e);
    if (pt) { isDrawingRef.current = true; lastPointRef.current = pt; }
  }, [canDraw, getCoords]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current || !canDraw) return;
    e.preventDefault();
    const pt = getCoords(e);
    const last = lastPointRef.current;
    if (!pt || !last) return;

    const strokeColor = tool === 'eraser' ? '#ffffff' : color;
    paintLine(last, pt, strokeColor, brushSize);

    const colorIdx = COLORS.indexOf(color);
    sendBinary(encodePacket(tool === 'eraser' ? 1 : 0, colorIdx >= 0 ? colorIdx : 0, brushSize, last, pt));

    lastPointRef.current = pt;
  }, [canDraw, tool, color, brushSize, getCoords, paintLine, sendBinary]);

  const handleEnd = useCallback(() => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  }, []);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    sendMessage(EVENTS.CLEAR_CANVAS, {});
  }, [sendMessage]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Canvas area — fills available space, canvas scales via CSS */}
      <div ref={containerRef} className="flex-1 relative flex items-center justify-center bg-gray-100 p-2 overflow-hidden">
        <canvas
          ref={canvasRef}
          className={`bg-white shadow-lg rounded-lg ${canDraw ? 'cursor-crosshair' : 'cursor-default'}`}
          style={{ maxWidth: '100%', maxHeight: '100%', aspectRatio: `${CANVAS_W} / ${CANVAS_H}`, objectFit: 'contain' }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
        {!canDraw && phase === 'drawing' && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="bg-black/30 text-white px-4 py-1.5 rounded-full font-bold text-sm">
              👀 Watch and guess!
            </div>
          </div>
        )}
      </div>

      {/* Drawing Tools */}
      {canDraw && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/95 border-t-4 border-pastel-purple p-3 flex flex-wrap items-center justify-center gap-4"
        >
          <div className="flex gap-1 flex-wrap justify-center">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => { setColor(c); setTool('brush'); }}
                className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                  color === c && tool === 'brush' ? 'border-gray-800 scale-110 ring-2 ring-pastel-purple' : 'border-gray-300'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="flex gap-2 items-center border-l-2 border-gray-200 pl-4">
            {BRUSH_SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setBrushSize(s)}
                className={`rounded-full bg-gray-800 transition-transform hover:scale-110 ${
                  brushSize === s ? 'ring-2 ring-pastel-purple ring-offset-2' : ''
                }`}
                style={{ width: s + 10, height: s + 10 }}
              />
            ))}
          </div>

          <div className="flex gap-2 border-l-2 border-gray-200 pl-4">
            <button onClick={() => setTool('brush')}
              className={`p-2 rounded-lg text-xl transition-colors ${tool === 'brush' ? 'bg-pastel-purple text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >✏️</button>
            <button onClick={() => setTool('eraser')}
              className={`p-2 rounded-lg text-xl transition-colors ${tool === 'eraser' ? 'bg-pastel-purple text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >🧹</button>
            <button onClick={handleClear}
              className="p-2 rounded-lg text-xl bg-red-100 hover:bg-red-200 transition-colors"
            >🗑️</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
