import React, { useState, useEffect, useRef } from 'react';
import { DrawingController } from '../controllers/DrawingController';
import { PixiCanvas } from './PixiCanvas';
import { PixiController } from '../controllers/PixiController';

export const GeneticPanel: React.FC = () => {
  const [pair, setPair] = useState<{ id1: string; strokes1: any[]; id2: string; strokes2: any[] } | null>(null);
  const [generation, setGeneration] = useState(0);
  const [loading, setLoading] = useState(false);
  const leftControllerRef = useRef<DrawingController | null>(null);
  const rightControllerRef = useRef<DrawingController | null>(null);
  const leftPixiRef = useRef<PixiController | null>(null);
  const rightPixiRef = useRef<PixiController | null>(null);

  const fetchPair = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8001/api/genetic/compare');
      const data = await res.json();
      setPair(data);
    } catch (error) {
      console.error('Failed to fetch comparison pair', error);
    } finally {
      setLoading(false);
    }
  };

  const vote = async (winnerId: string, loserId: string) => {
    await fetch('http://localhost:8001/api/genetic/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winner_id: winnerId, loser_id: loserId }),
    });
    fetchPair();
  };

  const nextGeneration = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8001/api/genetic/next_generation', {
        method: 'POST',
      });
      const data = await res.json();
      setGeneration(data.generation);
      fetchPair();
    } catch (error) {
      console.error('Failed to generate next generation', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPair();
  }, []);

  useEffect(() => {
    if (pair) {
      if (leftControllerRef.current) {
        leftControllerRef.current.loadStrokes(pair.strokes1);
      }
      if (rightControllerRef.current) {
        rightControllerRef.current.loadStrokes(pair.strokes2);
      }
    }
  }, [pair]);

  useEffect(() => {
    leftControllerRef.current = new DrawingController('ws://localhost:8001/ws/drawing');
    rightControllerRef.current = new DrawingController('ws://localhost:8001/ws/drawing');
    return () => {
      leftControllerRef.current?.disconnect();
      rightControllerRef.current?.disconnect();
    };
  }, []);

  if (!pair) return <div className="text-center p-4">加载中...</div>;

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">遗传算法绘画比较 - 第 {generation} 代</h2>
      <div className="flex gap-8 justify-center">
        <div className="text-center">
          <PixiCanvas
            controller={leftPixiRef.current!}
            width={300}
            height={300}
            backgroundColor={0xffffff}
          />
          <button
            onClick={() => vote(pair.id1, pair.id2)}
            disabled={loading}
            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
          >
            选择左边
          </button>
        </div>
        <div className="text-center">
          <PixiCanvas
            controller={rightPixiRef.current!}
            width={300}
            height={300}
            backgroundColor={0xffffff}
          />
          <button
            onClick={() => vote(pair.id2, pair.id1)}
            disabled={loading}
            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
          >
            选择右边
          </button>
        </div>
      </div>
      <button
        onClick={nextGeneration}
        disabled={loading}
        className="mt-6 px-6 py-2 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
      >
        生成下一代
      </button>
    </div>
  );
};