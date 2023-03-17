"use client";
import { useRef, useLayoutEffect, useEffect, useState } from 'react';
import paper, { view, Path, Point, Size, PointText, Rectangle } from 'paper'
import Box from '@mui/material/Box';

export default function Test() {
  const canvasRef = useRef<any>(null);
  const initRef = useRef<any>(false);

  useEffect(() => {
    if (initRef.current) {
      return;
    }
    initRef.current = true;
    console.log("CALLED EFFECT", canvasRef.current)
    paper.setup(canvasRef.current)

    const rect = new Rectangle(
      new Point(view.center.x, view.center.y),
      new Size(100, 50),
    );
    const path = new Path.Rectangle(rect);
    path.fillColor = new paper.Color('#ee6622');

    view.onFrame = (ev) => {
      const dest = new Point(
        path.position.x - ev.delta * 100,
        path.position.y,
      );
      path.position = dest
    }
  }, [])

  return (
    <Box>
      <canvas style={{ width: '100vw', height: '100vh' }} id="canvas" ref={canvasRef} />
    </Box>
  );
}
