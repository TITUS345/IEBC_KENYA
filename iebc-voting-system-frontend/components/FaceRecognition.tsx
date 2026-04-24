import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

interface FaceRecognitionProps {
  onFaceDetected: (embeddings: number[]) => void;
  onError: (error: string) => void;
}

const FaceRecognition: React.FC<FaceRecognitionProps> = ({ onFaceDetected, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        // Load models from CDN
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ]);
        setIsModelLoaded(true);
      } catch (error) {
        onError('Failed to load face recognition models');
      }
    };

    loadModels();
  }, [onError]);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      onError('Failed to access camera');
    }
  };

  const detectFace = async () => {
    if (!isModelLoaded || !videoRef.current || !canvasRef.current) return;

    setIsDetecting(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const displaySize = { width: video.width, height: video.height };

    faceapi.matchDimensions(canvas, displaySize);

    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (detections.length > 0) {
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      }

      // Get the first face descriptor
      const descriptor = detections[0].descriptor;
      onFaceDetected(Array.from(descriptor));
    } else {
      onError('No face detected');
    }

    setIsDetecting(false);
  };

  return (
    <div className="face-recognition">
      <video
        ref={videoRef}
        autoPlay
        muted
        width="640"
        height="480"
        onLoadedMetadata={startVideo}
      />
      <canvas ref={canvasRef} />
      <button
        onClick={detectFace}
        disabled={!isModelLoaded || isDetecting}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        {isDetecting ? 'Detecting...' : 'Capture Face'}
      </button>
      {!isModelLoaded && <p>Loading models...</p>}
    </div>
  );
};

export default FaceRecognition;