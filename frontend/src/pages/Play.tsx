import { useParams, useNavigate } from "react-router-dom";
import Page from "../layouts/Page";
import { useContext, useEffect, useRef, useState } from "react";
import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";
import { FaPlay, FaPause, FaTachometerAlt } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5"; // Import an icon for the back button
import "./Play.css"; // Import the CSS file
import calculateScore from "../lib/scoreCalculator";
import GeminiContentComponent from "../components/GeminiContentComponent";
import { AuthContext } from "../context/AuthContext";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast";

export default function Play() {
  const { videoId } = useParams();
  const navigate = useNavigate(); // Use navigate for going back

  const [score, setScore] = useState(0);
  let angleData: number[][] = [];
  const user = useContext(AuthContext);

  const webcamRef = useRef<HTMLVideoElement | null>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const webcamCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [countDown, setCountDown] = useState(0);
  const [frames, setFrames] = useState<string[]>([]);
  const [playAgain, setPlayAgain] = useState(false);
  const [playModal, setPlayModal] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const aheadVideoRef = useRef<HTMLVideoElement | null>(null); // Off-screen video element
  const carouselRef = useRef<HTMLDivElement | null>(null);

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

  async function handleSaveScore() {
    try {
      await addDoc(collection(db, "scores"), {
        userId: user?.uid,
        title: videoId,
        score: score,
        date: new Date().toISOString()
      });

      toast.success("Score has been 🚀");
      resetPlay();
    } catch (error) {
      toast.error("Failed to save score");
      console.log(error);
    }
  }

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

  async function predictWebcam(vectorData: string) {
    if (!poseLandmarker || !webcamRef.current || !webcamCanvasRef.current)
      return;

    const canvasCtx = webcamCanvasRef.current.getContext("2d");

    let lastScoreUpdateTime = 0;

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
              if (
                videoRef.current!.currentTime > 0 &&
                videoRef.current!.paused === false &&
                videoRef.current?.ended === false
              ) {
                // every 5 seconds, update the score
                if (Math.floor(videoRef.current!.currentTime / 5) !== Math.floor(lastScoreUpdateTime / 5)) {
                  const calcData = calculateScore(
                    vectorData,
                    result.landmarks,
                    videoRef.current!.currentTime
                  );
                  setScore((prev) => Math.round(calcData.scoreData)+prev);
                  angleData = [...angleData, calcData.angleData];
                  lastScoreUpdateTime = videoRef.current!.currentTime;
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

  // Dynamic video source based on videoId from route params
  const videoIds = ["ballet", "afro", "footloose", "dynamite", "bhangra", "salsa", "haidilao", "samba", "floss", "butter", "drill", "rasputin"]
  const [videoSrc, setVideoSrc] = useState((videoId !== undefined && videoIds.includes(videoId)) ? `/videos/${videoId}.mov`: "");
  useEffect(() => {
    async function getVideoLink() {
      console.log(videoSrc);
      if (videoSrc !==  "") {
        return;
      }
      if (videoId !== undefined) {
        const docRef = doc(db, "videos", videoId!);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setVideoSrc(docSnap.data().videoURL);
        }
      }
    }
    getVideoLink();

    async function getVectorData() {
      const response = await fetch(`/vectors/${videoId}_pose_vectors.txt`);
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

  function resetPlay() {
    setIsPlaying(false);
    setFrames([]);
    setScore(0);
    if (videoRef.current && aheadVideoRef.current) {
      videoRef.current.currentTime = 0;
      aheadVideoRef.current.currentTime = 2;
    }
    setPlayModal(false);

    setTimeout(() => {
      setPlayAgain(false);
    }, 3000);
  }

  useEffect(() => {
    if (playAgain) {
      resetPlay();
    }
  }, [playAgain]);

  async function openCamera(vectorData: string) {
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

  const handleTimelineChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Number(event.target.value);
    }
  };

  useEffect(() => {
    if (videoRef.current && aheadVideoRef.current) {
      // Sync the play state
      videoRef.current.addEventListener("play", () => {
        aheadVideoRef.current!.play();
      });

      videoRef.current.addEventListener("pause", () => {
        aheadVideoRef.current!.pause();
      });

      videoRef.current.addEventListener("ended", () => {
        console.log(angleData);
        setPlayModal(true);
      });

      // Set up the ahead video
      aheadVideoRef.current.src = videoRef.current.src;
      aheadVideoRef.current.currentTime = videoRef.current.currentTime + 2; // 1 second ahead
      aheadVideoRef.current.muted = true; // Mute the off-screen video
    }

    return () => {
      if (videoRef.current && aheadVideoRef.current) {
        videoRef.current.removeEventListener("play", () => {
          aheadVideoRef.current!.play();
        });
        videoRef.current.removeEventListener("pause", () => {
          aheadVideoRef.current!.pause();
        });
      }
    };
  }, [videoSrc]);

  useEffect(() => {
    async function captureInitialFrames() {
      if (aheadVideoRef.current) {
        const canvas = document.createElement("canvas");
        canvas.width = aheadVideoRef.current.videoWidth;
        canvas.height = aheadVideoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");

        for (let i = 0; i < 5; i++) {
          aheadVideoRef.current.currentTime = i + 1; // Move to the next second ahead
          await new Promise((resolve) => {
            aheadVideoRef.current!.onseeked = () => {
              if (ctx) {
                ctx.drawImage(
                  aheadVideoRef.current!,
                  0,
                  0,
                  canvas.width,
                  canvas.height
                );
                const frame = canvas.toDataURL("image/jpeg");
                setFrames((prevFrames) => {
                  if (!prevFrames.includes(frame)) {
                    return [...prevFrames, frame];
                  }
                  return prevFrames;
                });
              }
              resolve(true);
            };
          });
        }
      }
    }

    if (aheadVideoRef.current) {
      aheadVideoRef.current.addEventListener(
        "loadedmetadata",
        captureInitialFrames
      );
    }

    return () => {
      if (aheadVideoRef.current) {
        aheadVideoRef.current.removeEventListener(
          "loadedmetadata",
          captureInitialFrames
        );
      }
    };
  }, [videoSrc]);

  // Frame capturing logic
  useEffect(() => {
    if (aheadVideoRef.current) {
      const captureFrameAhead = () => {
        const canvas = document.createElement("canvas");
        canvas.width = aheadVideoRef.current!.videoWidth;
        canvas.height = aheadVideoRef.current!.videoHeight;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(
            aheadVideoRef.current!,
            0,
            0,
            canvas.width,
            canvas.height
          );
          const frame = canvas.toDataURL("image/jpeg");

          setFrames((prevFrames) => {
            if (
              prevFrames.length === 0 ||
              prevFrames[prevFrames.length - 1] !== frame
            ) {
              return [...prevFrames, frame];
            }
            return prevFrames;
          });
        }
      };

      // Set interval based on playback rate
      const intervalDuration = 1250 / playbackRate; // Adjust interval inversely proportional to playback rate
      const interval = setInterval(captureFrameAhead, intervalDuration);

      return () => clearInterval(interval);
    }
  }, [videoSrc, playbackRate]); // Dependency includes playbackRate to adjust the interval when it changes

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current && aheadVideoRef.current) {
      videoRef.current.playbackRate = speed;
      aheadVideoRef.current.playbackRate = speed; // Apply speed to ahead video as well
      setPlaybackRate(speed); // Update state to trigger re-render and interval adjustment
    }
  };

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = carouselRef.current.scrollWidth;
    }
  }, [frames]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        aheadVideoRef.current?.pause();
      } else {
        setTimeout(() => {
          videoRef.current?.play();
          aheadVideoRef.current?.play();
        }, 3000);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const displayedFrames = frames.slice(-5);

  return (
    <Page>
      {/* Back Button */}
      <div className="mb-12">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-cyan-300 hover:text-pink-500 transition-all duration-300"
          >
            <IoArrowBack className="mr-2" /> Back
          </button>
        </div>

        {/* Title */}
        <div className="flex flex-row justify-between">
          <h1 className="text-center font-extrabold text-3xl my-3 tracking-wider">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-pink-500 subtle-neon-text">
              {videoId?.toUpperCase()}
            </span>
          </h1>
          <h1 className="text-center font-extrabold text-3xl my-3 tracking-wider">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-pink-500 subtle-neon-text">
              Score: {score.toString().padStart(6, "0")}
            </span>
          </h1>
        </div>

        <video ref={aheadVideoRef} style={{ display: "none" }} />

        {/* Main video and carousel */}
        {/* Existing video, controls, and carousel implementation */}
        {displayedFrames.length > 0 && (
          <div
            ref={carouselRef}
            className="carousel-container gap-2 mt-4 flex justify-between p-2"
          >
            {displayedFrames.map((frame, index) => (
              <div key={index} className="carousel-item w-1/6">
                <img
                  src={frame}
                  alt={`Frame ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                  style={{
                    transform: "scaleX(-1)",
                    border: "1px solid #00ffff", // Neon blue border
                    boxShadow:
                      "0 0 10px #00ffff, 0 0 10px #00ffff, 0 0 10px #00ffff", // Neon glow effect
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-row justify-between space-x-4 my-6 relative">
          {/* Dance/Comparison Video with Pose Detection Overlay */}
          <div
            className="videoView relative border-2 border-cyan-500 rounded-lg shadow-subtle"
            style={{ height: "450px" }}
          >
            <video
              id="danceVideo"
              ref={videoRef}
              src={videoSrc}
              className="w-full h-full rounded-lg"
              style={{ objectFit: "cover" }}
            />
            <canvas
              id="video_output_canvas"
              ref={videoCanvasRef}
              className="canvas output_canvas rounded-lg"
              style={{
                height: "100%",
                width: "100%",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            />
            {countDown > 0 && (
              <div className="absolute inset-0 text-4xl bg-black bg-opacity-75 flex flex-col items-center justify-center text-cyan-300 subtle-neon-text rounded-lg">
                {countDown}
              </div>
            )}
          </div>

          {/* Webcam Video with Pose Detection Overlay */}
          <div
            className="videoView relative border-2 border-pink-500 rounded-lg shadow-subtle"
            style={{ height: "450px" }}
          >
            <video
              id="webcam"
              ref={webcamRef}
              className="w-full h-full rounded-lg"
              playsInline
              muted
              style={{ objectFit: "cover" }}
            />
            <canvas
              id="webcam_output_canvas"
              ref={webcamCanvasRef}
              className="canvas output_canvas rounded-lg"
              style={{
                height: "100%",
                width: "100%",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            />
          </div>
          {playModal && (
            <div className="flex mr-4 flex-col border-2 border-cyan-500 rounded-lg">
              <div className="absolute inset-0 bg-gray-800 bg-opacity-[90%] flex flex-col items-center justify-center text-white rounded-lg">
                <h1 className="text-2xl mb-4">Game Over</h1>
                <div className="flex space-x-4 mb-8">
                  <button
                    onClick={() => setPlayAgain(true)}
                    className="px-4 py-2 border-4 border-cyan-500 rounded-lg bg-indigo-500 hover:bg-indigo-900 transition-all duration-300"
                  >
                    Play Again
                  </button>
                  <a href="/explore">
                    <button
                      onClick={() => setPlayModal(false)}
                      className="px-4 py-2 border-4 border-cyan-500 rounded-lg bg-pink-500 hover:bg-pink-700 transition-all duration-300"
                    >
                      More dances
                    </button>
                  </a>
                </div>
                {
                  user == null ?
                    (<a href="/login">
                      <button className="px-10 py-2 border-4 border-cyan-500 rounded-lg
                        bg-gradient-to-b from-indigo-500 to-pink-500 subtle-neon-text hover:opacity-75 transition-all duration-300">
                        Login in to Save Score
                      </button>
                    </a>) :
                    (<button className="px-28 py-2 border-4 border-cyan-500 rounded-lg
                        bg-gradient-to-b from-indigo-500 to-pink-500 subtle-neon-text hover:opacity-75 transition-all duration-300"
                      onClick={handleSaveScore}>
                      Save Score
                    </button>)
                }
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="controls flex justify-between items-center p-2 bg-gradient-to-r from-gray-900 to-purple-900 rounded-lg text-cyan-300 mb-4 border border-cyan-500 shadow-subtle">
          <button
            onClick={handlePlayPause}
            className="btn p-2 bg-purple-700 rounded-full hover:bg-purple-900 flex items-center transition-all duration-300"
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <div className="speed-controls flex space-x-2 ml-2">
            {[0.25, 0.5, 1, 1.5, 2].map((speed) => (
              <button
                disabled={isPlaying}
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                className={`btn p-2 rounded-full ${
                  playbackRate === speed ? "bg-purple-500" : "bg-gray-700"
                } ${
                  !isPlaying && "hover:bg-purple-600"
                } flex items-center transition-all duration-300`}
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
            className="timeline w-full mx-4 bg-transparent accent-purple-500 rounded-lg"
          />
        </div>
        <div>
          <GeminiContentComponent danceName={videoId}/>
        </div>
      </div>
    </Page>
  );
}
