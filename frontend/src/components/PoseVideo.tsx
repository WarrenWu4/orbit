import React, { useEffect, useRef, useState } from 'react';
import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
} from '@mediapipe/tasks-vision';

const PoseDetectionComponent: React.FC = () => {
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | undefined>(undefined);
  const [webcamRunning, setWebcamRunning] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoHeight = '360px';
  const videoWidth = '480px';

  useEffect(() => {
    const createPoseLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
      );
      const landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'IMAGE',
        numPoses: 2,
      });
      setPoseLandmarker(landmarker);
    };

    createPoseLandmarker();
  }, []);

  const handleImageClick = async (event: React.MouseEvent<HTMLImageElement>) => {
    if (!poseLandmarker) {
      console.log('Wait for poseLandmarker to load before clicking!');
      return;
    }

    if (poseLandmarker.runningMode === 'VIDEO') {
      poseLandmarker.setOptions({ runningMode: 'IMAGE' });
    }

    const parent = event.currentTarget.parentNode as HTMLElement;
    const allCanvas = parent.getElementsByClassName('canvas');
    Array.from(allCanvas).forEach((n) => n.parentNode?.removeChild(n));

    poseLandmarker.detect(event.currentTarget, (result) => {
      const canvas = document.createElement('canvas');
      canvas.setAttribute('class', 'canvas');
      canvas.setAttribute('width', event.currentTarget.naturalWidth + 'px');
      canvas.setAttribute('height', event.currentTarget.naturalHeight + 'px');
      canvas.style.cssText = `left: 0px; top: 0px; width: ${event.currentTarget.width}px; height: ${event.currentTarget.height}px;`;
      parent.appendChild(canvas);
      const canvasCtx = canvas.getContext('2d')!;
      const drawingUtils = new DrawingUtils(canvasCtx);
      result.landmarks.forEach((landmark) => {
        drawingUtils.drawLandmarks(landmark, {
          radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1),
        });
        drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
      });
    });
  };

  const enableCam = async () => {
    if (!poseLandmarker) {
      console.log('Wait! poseLandmaker not loaded yet.');
      return;
    }

    setWebcamRunning(!webcamRunning);

    if (!webcamRunning) {
      const constraints = {
        video: true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', predictWebcam);
      }
    }
  };

  const predictWebcam = async () => {
    if (!videoRef.current || !canvasRef.current || !poseLandmarker) return;

    canvasRef.current.style.height = videoHeight;
    videoRef.current.style.height = videoHeight;
    canvasRef.current.style.width = videoWidth;
    videoRef.current.style.width = videoWidth;

    if (poseLandmarker.runningMode === 'IMAGE') {
      poseLandmarker.setOptions({ runningMode: 'VIDEO' });
    }

    const canvasCtx = canvasRef.current.getContext('2d')!;
    const drawingUtils = new DrawingUtils(canvasCtx);
    let lastVideoTime = -1;

    const loop = async () => {
      if (webcamRunning) {
        const currentTime = videoRef.current.currentTime;
        if (lastVideoTime !== currentTime) {
          lastVideoTime = currentTime;
          poseLandmarker.detectForVideo(videoRef.current, performance.now(), (result) => {
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            result.landmarks.forEach((landmark) => {
              drawingUtils.drawLandmarks(landmark, {
                radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1),
              });
              drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
            });
            canvasCtx.restore();
          });
        }
        window.requestAnimationFrame(loop);
      }
    };

    loop();
  };

  return (
    <div>
      <h1>Pose detection using the MediaPipe PoseLandmarker task</h1>
      <section id="demos">
        <h2>Demo: Detecting Images</h2>
        <p>
          <b>Click on an image below</b> to see the key landmarks of the body.
        </p>
        <div className="detectOnClick" onClick={handleImageClick}>
          <img
            src="https://assets.codepen.io/9177687/woman-ge0f199f92_640.jpg"
            width="100%"
            crossOrigin="anonymous"
            title="Click to get detection!"
            alt="Pose Detection 1"
          />
        </div>
        <div className="detectOnClick" onClick={handleImageClick}>
          <img
            src="https://assets.codepen.io/9177687/woman-g1af8d3deb_640.jpg"
            width="100%"
            crossOrigin="anonymous"
            title="Click to get detection!"
            alt="Pose Detection 2"
          />
        </div>

        <h2>Demo: Webcam continuous pose landmarks detection</h2>
        <p>
          Stand in front of your webcam to get real-time pose landmarker detection.
          <br />
          Click <b>enable webcam</b> below and grant access to the webcam if prompted.
        </p>

        <div id="liveView" className="videoView">
          <button onClick={enableCam} className="mdc-button mdc-button--raised">
            <span className="mdc-button__label">
              {webcamRunning ? 'DISABLE PREDICTIONS' : 'ENABLE WEBCAM'}
            </span>
          </button>
          <div style={{ position: 'relative' }}>
            <video ref={videoRef} style={{ width: '1280px', height: '720px' }} autoPlay playsInline />
            <canvas ref={canvasRef} className="output_canvas" width="1280" height="720" style={{ position: 'absolute', left: 0, top: 0 }} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default PoseDetectionComponent;
