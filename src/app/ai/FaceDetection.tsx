import { useRef, useState, useEffect, useCallback } from "react";
import * as faceapi from "face-api.js";

type Props = {
  onFaceDetect: (name: string) => void;
};

const FaceDetection: React.FC<Props> = ({ onFaceDetect }) => {
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceRecognitionModelUrl = "/models/faceRecognitionModel.json";
  const faceMatcherTolerance = 0.6;
  const faceDetectionInterval = 100;

  const loadModels = async () => {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
      faceapi.nets.ageGenderNet.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    ]);
    setIsLoadingModels(false);
  };

  useEffect(() => {
    loadModels();
  }, []);

  const startVideo = useCallback(async () => {
    if (!videoRef.current || isLoadingModels) return;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  }, [isLoadingModels]);

  useEffect(() => {
    startVideo();
  }, [startVideo]);

  useEffect(() => {
    const detectFace = async () => {
      if (!videoRef.current || !canvasRef.current || isLoadingModels) {
        return;
      }

      const faceRecognitionModel = await (
        await fetch(faceRecognitionModelUrl)
      ).json();
      const labeledFaceDescriptors = faceRecognitionModel.map((item: any) => {
        const descriptors = item.descriptors.map(
          (descriptor: number[]) => new Float32Array(descriptor)
        );
        return new faceapi.LabeledFaceDescriptors(item.label, descriptors);
      });

      const faceMatcher = new faceapi.FaceMatcher(
        labeledFaceDescriptors,
        faceMatcherTolerance
      );

      const detections = await faceapi
        .detectAllFaces(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (detections.length === 0) {
        return;
      }

      const bestMatch = faceMatcher.findBestMatch(detections[0].descriptor);
      onFaceDetect(bestMatch.label);

      if (canvasRef.current) {
        const displaySize = {
          width: videoRef.current.clientWidth,
          height: videoRef.current.clientHeight,
        };
        faceapi.matchDimensions(canvasRef.current, displaySize);
        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize
        );
        const context = canvasRef.current.getContext(
          "2d"
        ) as CanvasRenderingContext2D; // Add explicit type casting
        if (context) {
          context.clearRect(0, 0, displaySize.width, displaySize.height);
          faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
        }
      }
    };

    const intervalId = setInterval(detectFace, faceDetectionInterval);
    return () => {
      clearInterval(intervalId);
    };
  }, [onFaceDetect, isLoadingModels]);

  return (
    <div className="flex flex-col items-center space-y-4">
      {isLoadingModels ? (
        <p>Loading models...</p>
      ) : (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="border-solid border-2 border-gray-600 max-w-md max-h-md"
          ></video>
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 border-solid border-2 border-gray-max-w-md max-h-md"
          />
        </div>
      )}
    </div>
  );
};

export default FaceDetection;
