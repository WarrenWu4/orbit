import { useParams } from "react-router-dom";
import Page from "../layouts/Page";
import { useEffect } from "react";

export default function Play() {

    const { videoId } = useParams();
    console.log(videoId);

    async function openCamera() {
        try {
            // Request access to the video stream (camera)
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false, // Set to true if audio is needed
            });

            // Get the video element
            const video = document.getElementById("webcam") as HTMLVideoElement;

            if (video) {
                // Set the video stream to the video element
                video.srcObject = stream;

                // Play the video
                video.play();
            }

        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {

        openCamera();

    }, [])

    return (
        <Page>

            <div className="w-full aspect-video bg-black">
                <video id="webcam" className="w-full aspect-video"></video>
            </div>
        
        </Page>
    )
}