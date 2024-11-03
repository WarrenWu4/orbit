import { useParams, useNavigate } from "react-router-dom";
import Page from "../layouts/Page";
import { useEffect, useRef, useState } from "react";
import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";
import { FaPlay, FaPause, FaTachometerAlt } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5"; // Import an icon for the back button
import "./Play.css"; // Import the CSS file
import calculateScore from "../lib/scoreCalculator";

export default function Play() {
  const { videoId } = useParams();
  const navigate = useNavigate(); // Use navigate for going back

  const [score, setScore] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const webcamRef = useRef<HTMLVideoElement | null>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const webcamCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [countDown, setCountDown] = useState(0);

  useEffect(() => {
    if (isPlaying) {
      setCountDown(3);
      const countdownInterval = setInterval(() => {
        setCountDown((prevCount) => {
          if (prevCount === 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);
    }
  }, [isPlaying]);

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
      // console.log(`Drawing ${result.landmarks.length} landmarks on ${source}`);
      const drawingUtils = new DrawingUtils(canvasCtx);

      for (const landmark of result.landmarks) {
        drawingUtils.drawLandmarks(landmark, {
          radius: 2.5,
          color: "purple",
        });
        drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS, {
          lineWidth: 2,
        });
      }
    } else {
      console.warn(`No landmarks detected for ${source}`);
    }
  }

  async function predictWebcam(vectorData:string) {
    if (!poseLandmarker || !webcamRef.current || !webcamCanvasRef.current)
      return;

    const canvasCtx = webcamCanvasRef.current.getContext("2d");

    function detectFrame() {
      if (!poseLandmarker || !webcamRef.current) return;
      poseLandmarker.detectForVideo(
        webcamRef.current,
        performance.now(),
        (result) => {
          if (result && result.landmarks) {
            // console.log("Webcam Pose Vectors:", result.landmarks);
            // get the nearest time frame
            if (videoRef) {
              if (videoRef.current!.currentTime > 0 && videoRef.current!.paused === false && videoRef.current?.ended === false) {
                const score = calculateScore(vectorData, result.landmarks, videoRef.current!.currentTime);
                if ((videoRef.current!.currentTime % 5) <= 0.1) {
                  setScore(Math.round(score));
                }
              }
            }

            // Draw landmarks and connections on the canvas
            drawResults(result, canvasCtx!, "webcam");
          } else {
            console.log("No landmarks detected in the webcam frame.");
          }
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

    async function getVectorData() {
      const response = await fetch("/rasputin_pose_vectors.txt");
      const text = await response.text();
      loadPoseLandmarker().then(() => {
        if (videoRef.current) {
          videoRef.current.addEventListener("loadeddata", () => {
            resizeCanvasToMatchVideo(videoRef, videoCanvasRef);
          });
  
          videoRef.current.addEventListener("timeupdate", () => {
            setCurrentTime(videoRef.current!.currentTime);
          });
        }
        openCamera(text);
      });
    }
    getVectorData();

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
    };
  }, []);

  async function openCamera(vectorData:string) {
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
          predictWebcam(vectorData);
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
        setTimeout(() => {
          videoRef.current?.play();
        }, 3000);
        // videoRef.current.play();
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

  // Dynamic video source based on videoId from route params
  const videoSrc = `/videos/${videoId}.mov`;

  return (
    <Page>
      {/* Back Button */}
      <div className="mb-12">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-white"
          >
            <IoArrowBack className="mr-2" /> Back
          </button>
        </div>

        {/* Title */}
        <div className="flex flex-row justify-between">
          <h1 className="text-center font-bold text-3xl my-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-indigo-500 to-pink-500">
              {videoId?.toUpperCase()}
            </span>
          </h1>
          <h1 className="text-center font-bold text-3xl my-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-indigo-500 to-pink-500">
              Score: {score.toString().padStart(6, '0')}
            </span>
          </h1>
        </div>

        <div className="flex flex-row justify-between space-x-4 my-6">
          {/* Dance/Comparison Video with Pose Detection Overlay */}
          <div className="videoView relative" style={{ height: "500px" }}>
            <video
              id="danceVideo"
              ref={videoRef}
              src={videoSrc} // Use dynamic video source
              className="w-full h-full"
              loop
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
            {countDown > 0 && (
              <div className="absolute inset-0 text-4xl bg-gray-700 bg-opacity-75 flex flex-col items-center justify-center text-white">
                {countDown}
              </div>
            )}
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
        <div className="controls flex justify-between items-center p-2 bg-gray-800 rounded-lg text-white mb-4">
          <button
            onClick={handlePlayPause}
            className="btn p-2 bg-blue-600 rounded-full hover:bg-blue-700 flex items-center"
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <div className="speed-controls flex space-x-2">
            {[0.25, 0.5, 1, 1.5, 2].map((speed) => (
              <button
                disabled={isPlaying}
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                className={`btn p-2 rounded-full ${playbackRate === speed ? "bg-green-600" : "bg-gray-600"
                  } ${!isPlaying && "hover:bg-green-700"} flex items-center`}
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
      </div>
    </Page>
  );
}
