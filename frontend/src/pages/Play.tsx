import { useParams } from "react-router-dom";
import Page from "../layouts/Page";
import { useEffect, useRef } from "react";
import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";
import "./Play.css"; // Import the CSS file

export default function Play() {
  const { videoId } = useParams();
  console.log(videoId);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  let poseLandmarker: PoseLandmarker | undefined;
  let webcamRunning: boolean = false;

  async function loadPoseLandmarker() {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numPoses: 2,
    });
  }

  async function openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        videoRef.current.addEventListener("loadeddata", () => {
          resizeCanvasToMatchVideo();
          predictWebcam();
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  function resizeCanvasToMatchVideo() {
    if (videoRef.current && canvasRef.current) {
      // Set the canvas size to match the video size.
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      canvasRef.current.style.width = `${videoRef.current.clientWidth}px`;
      canvasRef.current.style.height = `${videoRef.current.clientHeight}px`;
    }
  }

  async function predictWebcam() {
    if (!poseLandmarker || !videoRef.current || !canvasRef.current) return;

    const canvasCtx = canvasRef.current.getContext("2d");
    const drawingUtils = new DrawingUtils(canvasCtx!);

    function drawResults(result: any) {
      canvasCtx!.clearRect(
        0,
        0,
        canvasRef.current!.width,
        canvasRef.current!.height
      );
      for (const landmark of result.landmarks) {
        // Use a slightly larger value to make dots visible but thinner than default
        drawingUtils.drawLandmarks(landmark, {
          radius: 2, // Adjust to make the dots thin but visible
        //   color: "#00FF00", // Optional: specify color if needed
        });

        // Use a slightly larger lineWidth to make lines thin but visible
        drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS, {
          lineWidth: 0.5, // Ensure the lines are thin but still visible
        //   color: "#00FF00", // Optional: specify color if needed
        });
      }
    }

    function detectFrame() {
      poseLandmarker!.detectForVideo(
        videoRef.current!,
        performance.now(),
        (result) => {
          drawResults(result);
        }
      );

      if (webcamRunning) {
        window.requestAnimationFrame(detectFrame);
      }
    }

    webcamRunning = true;
    detectFrame();
  }

  useEffect(() => {
    loadPoseLandmarker();
    openCamera();

    return () => {
      webcamRunning = false;
    };
  }, []);

  return (
    <Page>
      <div className="videoView">
        <video
          id="webcam"
          ref={videoRef}
          className="w-full aspect-video"
          autoPlay
          playsInline
          muted
        />
        <canvas
          id="output_canvas"
          ref={canvasRef}
          className="canvas output_canvas"
        />
      </div>
    </Page>
  );
}
