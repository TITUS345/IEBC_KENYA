import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

interface FaceRecognitionProps {
  onFaceDetected: (embeddings: number[], capturedImage: File) => void;
  onError: (error: string) => void;
  uploadedImage?: File | null;
  onProcessing?: (isProcessing: boolean) => void;
}

const FaceRecognition: React.FC<FaceRecognitionProps> = ({ onFaceDetected, onError, uploadedImage, onProcessing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
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

  // Process uploaded image
  useEffect(() => {
    if (uploadedImage && isModelLoaded) {
      processUploadedImage(uploadedImage);
    }
  }, [uploadedImage, isModelLoaded]);

  const processUploadedImage = async (imageFile: File) => {
    setIsDetecting(true);
    onProcessing?.(true);
    try {
      const image = await faceapi.bufferToImage(imageFile);
      const detection = await faceapi
        .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        onError('No face detected in uploaded image. Please ensure the image clearly shows your face.');
        setIsDetecting(false);
        onProcessing?.(false);
        return;
      }

      onFaceDetected(Array.from(detection.descriptor), imageFile);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process uploaded image';
      onError(message);
    } finally {
      setIsDetecting(false);
      onProcessing?.(false);
    }
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to access camera';
      onError(message);
    }
  };

  useEffect(() => {
    startVideo();
  }, []);

  const captureImage = (): Promise<File> => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current) {
        reject(new Error('Video element not available'));
        return;
      }

      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'face-capture.jpg', { type: 'image/jpeg' });
          resolve(file);
        } else {
          reject(new Error('Failed to capture image'));
        }
      }, 'image/jpeg', 0.9);
    });
  };

  const detectFace = async () => {
    if (!isModelLoaded || !videoRef.current || !canvasRef.current) return;

    setIsDetecting(true);
    onProcessing?.(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      await new Promise<void>((resolve) => {
        const handler = () => resolve();
        video.addEventListener('loadedmetadata', handler, { once: true });
      });
    }

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    if (displaySize.width === 0 || displaySize.height === 0) {
      onError('Camera is not ready yet. Please wait a moment and try again.');
      setIsDetecting(false);
      onProcessing?.(false);
      return;
    }

    canvas.width = displaySize.width;
    canvas.height = displaySize.height;
    faceapi.matchDimensions(canvas, displaySize);

    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        onError('No face detected. Please ensure your face is clearly visible and try again.');
        setIsDetecting(false);
        return;
      }

      const resizedDetection = faceapi.resizeResults(detection, displaySize);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetection as any);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetection as any);
      }

      const capturedImage = await captureImage();
      onFaceDetected(Array.from(detection.descriptor), capturedImage);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Detection error occurred';
      onError(message);
    } finally {
      setIsDetecting(false);
      onProcessing?.(false);
    }
  };

  return (
    <div className="face-recognition flex flex-col items-center gap-4 w-full">
      <div className="relative w-full max-w-md">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          width="640"
          height="480"
          className="w-full border-2 border-gray-300 rounded-lg bg-black"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full border-2 border-transparent rounded-lg"
        />
      </div>
      <button
        onClick={detectFace}
        disabled={!isModelLoaded || isDetecting}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDetecting ? 'Detecting... Please hold still' : 'Capture Face'}
      </button>
      {!isModelLoaded && <p className="text-sm text-gray-600">Loading models...</p>}
    </div>
  );
};

export default FaceRecognition;