import { useEffect, useRef, useState } from "react";
import Page from "../layouts/Page";
import {
    PoseLandmarker,
    FilesetResolver,
    DrawingUtils,
  } from "@mediapipe/tasks-vision";

export default function Expiremental() {

    const [player1Score, setPlayer1Score] = useState(0);
    const [player2Score, setPlayer2Score] = useState(0);

    const player1WebCam = useRef<HTMLVideoElement>(null);
    const player1WebCamCanvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {

        async function setupVideoSplit() {
            try {
            loadPoseLandmarker().then(() => {
                openCamera();
              });
            } catch (error) {
            console.error("Error accessing the camera: ", error);
            }
        }

        setupVideoSplit();

    }, [])

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
          canvasElement.current.style.width = `${videoElement.current.clientWidth} px`;
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

    async function predictWebcam(webcamRef: React.RefObject<HTMLVideoElement>, webcamCanvasRef: React.RefObject<HTMLCanvasElement>) {
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
                // if (videoRef) {
                //   if (videoRef.current!.currentTime > 0 && videoRef.current!.paused === false && videoRef.current?.ended === false) {
                //     const score = calculateScore(vectorData, result.landmarks, videoRef.current!.currentTime);
                //     if ((videoRef.current!.currentTime % 5) <= 0.1) {
                //       setScore(Math.round(score));
                //     }
                //   }
                // }
    
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

    async function openCamera() {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
    
          if (player1WebCam.current) {
            player1WebCam.current.srcObject = stream;
            player1WebCam.current.play();
    
            player1WebCam.current.addEventListener("loadeddata", () => {
              resizeCanvasToMatchVideo(player1WebCam, player1WebCamCanvasRef);
              predictWebcam(player1WebCam, player1WebCamCanvasRef);
            });
          }
        } catch (error) {
          console.error(error);
        }
      }

    return (
        <Page>

            <div className="w-full flex justify-between">
                <h1 className="text-center font-bold text-3xl my-3">
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-indigo-500 to-pink-500">
                    P1 Score: {player1Score.toString().padStart(6, '0')}
                    </span>
                </h1>
                <h1 className="text-center font-bold text-3xl my-3">
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-indigo-500 to-pink-500">
                    P2 Score: {player2Score.toString().padStart(6, '0')}
                    </span>
                </h1>
            </div>
            
            <div className="flex w-full h-full overflow-hidden relative">
                <video className="w-full h-full absolute top-0 left-0 object-cover" id="leftVideo" ref={player1WebCam}></video>
                <canvas
                    id="webcam_output_canvas"
                    ref={player1WebCamCanvasRef}
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
        </Page>
    )
}