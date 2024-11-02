import { useParams } from "react-router-dom";
import Page from "../layouts/Page";
import { useEffect, useRef, useState } from "react";
import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";
import { FaPlay, FaPause, FaTachometerAlt } from "react-icons/fa";
import "./Play.css"; // Import the CSS file

export default function Play() {
  const { videoId } = useParams();
  console.log(videoId);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const webcamRef = useRef<HTMLVideoElement | null>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const webcamCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [similarityScore, setSimilarityScore] = useState<number | null>(null);

  let poseLandmarker: PoseLandmarker | undefined;
  let webcamRunning: boolean = false;
  let videoRunning: boolean = false;

  let videoPoseData: any = null;
  let webcamPoseData: any = null;

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

  function resizeCanvasToMatchVideo(
    videoElement: React.RefObject<HTMLVideoElement>,
    canvasElement: React.RefObject<HTMLCanvasElement>
  ) {
    if (videoElement.current && canvasElement.current) {
      canvasElement.current.width = videoElement.current.videoWidth;
      canvasElement.current.height = videoElement.current.videoHeight;
      canvasElement.current.style.width = `${videoElement.current.clientWidth}px`;
      canvasElement.current.style.height = `${videoElement.current.clientHeight}px`;

      videoElement.current.style.objectFit = "cover";
      videoElement.current.style.width = `${videoElement.current.clientWidth}px`;
      videoElement.current.style.height = `${videoElement.current.clientHeight}px`;
    }
  }

  function drawResults(
    result: any,
    canvasCtx: CanvasRenderingContext2D | null,
    source: "video" | "webcam"
  ) {
    if (!canvasCtx) {
      console.error("Canvas context is null");
      return;
    }

    canvasCtx.clearRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);

    if (result.landmarks && result.landmarks.length > 0) {
      console.log(`Drawing ${result.landmarks.length} landmarks on ${source}`);
      const drawingUtils = new DrawingUtils(canvasCtx);

      for (const landmark of result.landmarks) {
        drawingUtils.drawLandmarks(landmark, {
          radius: 2,
        });
        drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS, {
          lineWidth: 0.5,
        });
      }

      // Save pose data for similarity calculation
      if (source === "video") {
        videoPoseData = result.landmarks;
      } else if (source === "webcam") {
        webcamPoseData = result.landmarks;
        calculateSimilarityScore();
      }
    } else {
      console.warn(`No landmarks detected for ${source}`);
    }
  }

  function calculateSimilarityScore() {
    if (!videoPoseData || !webcamPoseData) return;

    let totalDistance = 0;
    let count = 0;

    for (
      let i = 0;
      i < Math.min(videoPoseData.length, webcamPoseData.length);
      i++
    ) {
      const videoLandmark = videoPoseData[i];
      const webcamLandmark = webcamPoseData[i];

      const distance = Math.sqrt(
        Math.pow(videoLandmark.x - webcamLandmark.x, 2) +
          Math.pow(videoLandmark.y - webcamLandmark.y, 2) +
          Math.pow(videoLandmark.z - webcamLandmark.z, 2)
      );

      totalDistance += distance;
      count++;
    }

    const averageDistance = totalDistance / count;
    const normalizedScore = Math.max(0, 100 - averageDistance * 1000); // Scale for visualization
    setSimilarityScore(normalizedScore);
  }

  async function predictVideo(
    videoElement: HTMLVideoElement,
    canvasElement: HTMLCanvasElement
  ) {
    if (!poseLandmarker) return;
    const canvasCtx = canvasElement.getContext("2d");

    function detectFrame() {
      if (!poseLandmarker || !videoElement) return;
      poseLandmarker.detectForVideo(
        videoElement,
        performance.now(),
        (result) => {
          drawResults(result, canvasCtx!, "video");
        }
      );

      if (!videoElement.paused && !videoElement.ended) {
        window.requestAnimationFrame(detectFrame);
      }
    }

    detectFrame();
  }

  async function predictWebcam() {
    if (!poseLandmarker || !webcamRef.current || !webcamCanvasRef.current)
      return;

    const canvasCtx = webcamCanvasRef.current.getContext("2d");

    function detectFrame() {
      if (!poseLandmarker || !webcamRef.current) return;
      poseLandmarker.detectForVideo(
        webcamRef.current,
        performance.now(),
        (result) => {
          drawResults(result, canvasCtx!, "webcam");
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
    loadPoseLandmarker().then(() => {
      if (videoRef.current) {
        videoRef.current.addEventListener("loadeddata", () => {
          resizeCanvasToMatchVideo(videoRef, videoCanvasRef);
          predictVideo(videoRef.current!, videoCanvasRef.current!);
        });

        videoRef.current.addEventListener("timeupdate", () => {
          setCurrentTime(videoRef.current!.currentTime);
        });
      }
      openCamera();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        handlePlayPause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      webcamRunning = false;
      videoRunning = false;
    };
  }, []);

  async function openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
        webcamRef.current.play();

        webcamRef.current.addEventListener("loadeddata", () => {
          resizeCanvasToMatchVideo(webcamRef, webcamCanvasRef);
          predictWebcam();
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackRate(speed);
    }
  };

  const handleTimelineChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Number(event.target.value);
    }
  };

  return (
    <Page>
      <div className="flex flex-row justify-between space-x-4">
        {/* Dance/Comparison Video with Pose Detection Overlay */}
        <div className="videoView" style={{ height: "500px" }}>
          <video
            id="danceVideo"
            ref={videoRef}
            src="/posedemovid.mov" // Source for the dance video
            className="w-full h-full"
            autoPlay
            loop
            muted
            style={{ objectFit: "cover" }}
          />
          <canvas
            id="video_output_canvas"
            ref={videoCanvasRef}
            className="canvas output_canvas"
            style={{
              height: "100%",
              width: "100%",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
        </div>

        {/* Webcam Video with Pose Detection Overlay */}
        <div className="videoView" style={{ height: "500px" }}>
          <video
            id="webcam"
            ref={webcamRef}
            className="w-full h-full"
            autoPlay
            playsInline
            muted
            style={{ objectFit: "cover" }}
          />
          <canvas
            id="webcam_output_canvas"
            ref={webcamCanvasRef}
            className="canvas output_canvas"
            style={{
              height: "100%",
              width: "100%",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="controls flex justify-between items-center p-2 bg-gray-800 rounded-lg text-white">
        <button
          onClick={handlePlayPause}
          className="btn p-2 bg-blue-600 rounded-full hover:bg-blue-700 flex items-center"
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        <div className="speed-controls flex space-x-2">
          {[0.5, 1, 1.5, 2].map((speed) => (
            <button
              key={speed}
              onClick={() => handleSpeedChange(speed)}
              className={`btn p-2 rounded-full ${
                playbackRate === speed ? "bg-green-600" : "bg-gray-600"
              } hover:bg-green-700 flex items-center`}
            >
              <FaTachometerAlt className="mr-1" />
              {speed}x
            </button>
          ))}
        </div>
        <input
          type="range"
          min="0"
          max={videoRef.current?.duration || 0}
          value={currentTime}
          onChange={handleTimelineChange}
          className="timeline w-full mx-4"
        />
      </div>

      {/* Display Similarity Score */}
      {similarityScore !== null && (
        <div className="text-center mt-4 text-white"></div>
      )}
    </Page>
  );
}
