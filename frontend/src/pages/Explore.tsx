import { useState } from "react";
import Page from "../layouts/Page";
import ReactPlayer from "react-player";

export default function Explore() {



    return (
        <Page>

            <div className="w-full h-full flex flex-col items-center">

                <h1 className="text-white font-bold text-3xl">trending dances</h1>
                <span className="mb-8">play a trending dance</span>

                <div className="grid grid-cols-3 gap-y-16 gap-x-16 mx-16">
                    {
                        [1, 2, 3, 4, 5, 6, 7, 8].map((video, index) => (
                            <VideoCard key={index}
                                videoUrl={`https://www.youtube.com/watch?v=tCDvOQI3pco`}
                                musicTitle="Thriller"
                                creator="Jelly FIsh"
                                videoTitle="Werewolf Dance"
                            />
                        ))
                    }
                </div>

            </div>

        </Page>
    )
}

function VideoCard(props: any) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="flex flex-col border-4 border-white px-4 py-2 hover:shadow-arcade hover:cursor-pointer relative gap-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="absolute top-[-16px] right-[-16px] border-8 border-white"></div>
            <div className="flex flex-row">
                <div className="flex flex-1 flex-row gap-2 items-center">
                    <div className="w-[15px]">
                        <img src="/musical-note.png" alt="Music note" />
                    </div>
                    <span>{props.musicTitle.length > 10 ? `${props.musicTitle.substring(0, 10)}...` : props.musicTitle}</span>
                </div>
                <div className="flex flex-row gap-2 items-center underline text-sm">
                    try it!
                    <div className="w-[25px]">
                        <img src="/joystick.png" alt="play" />
                    </div>

                </div>
            </div>


            <div className="video-container relative">
                {!isHovered && (
                    <div className="absolute inset-0 bg-gray-700 bg-opacity-75 flex flex-col items-center justify-center text-white">
                        <img src="/tap.png" alt="" />
                        <span>Hover Me</span>
                    </div>
                )}
                <ReactPlayer
                    url={props.videoUrl}
                    playing={isHovered}
                    width="100%"
                    style={{ aspectRatio: '9/12' }}
                />
            </div>
            <div className="text-sm">{props.videoTitle}</div>
            <div className="flex flex-row">
                <span className="font-bold flex-1">{props.creator}</span>
                <span className="flex gap-1"><img className="w-[20px]" src="/pixel-heart.png" alt="Missing" />1500</span>
            </div>
        </div>
    )
}
