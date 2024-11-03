// import { useEffect, useState } from "react";
// import Page from "../layouts/Page";
// import ReactPlayer from "react-player";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "../firebase";

// export default function Explore() {
//   const videos = [
//     { id: "ballet", title: "Ballet", videoURL: "/videos/ballet.mov" },
//     { id: "afro", title: "Afro", videoURL: "/videos/afro.mov" },
//     { id: "footloose", title: "Footloose", videoURL: "/videos/footloose.mov" },
//     { id: "dynamite", title: "Dynamite", videoURL: "/videos/dynamite.mov" },
//     { id: "bhangra", title: "Bhangra", videoURL: "/videos/bhangra.mov" },
//     { id: "salsa", title: "Salsa", videoURL: "/videos/salsa.mov" },
//     { id: "butter", title: "Butter", videoURL: "/videos/butter.mov" },
//     { id: "drill", title: "Drill", videoURL: "/videos/drill.mov" },
//     { id: "rasputin", title: "Rasputin", videoURL: "/videos/rasputin.mov" },
//   ];

// //

//   return (
//     <Page>
//       <div className="w-full h-full flex flex-col items-center">
//         <h1 className="text-white font-bold text-3xl">trending dances</h1>
//         <span className="mb-8">play a trending dance</span>

//         <div className="grid grid-cols-3 gap-y-16 gap-x-16 mx-16">
//           {videos.length !== 0 &&
//             videos.map((video, index) => (
//               <VideoCard
//                 key={index}
//                 videoId={video.id}
//                 videoUrl={video.videoURL}
//                 videoTitle={video.title}
//                 hearts={video.hearts}
//               />
//             ))}
//         </div>
//       </div>
//     </Page>
//   );
// }

// function VideoCard(props: any) {
//   const [isHovered, setIsHovered] = useState(false);
//   return (
//     <div
//       className="flex flex-col border-4 border-white px-4 py-2 hover:shadow-arcade hover:cursor-pointer relative gap-1"
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <div className="absolute top-[-16px] right-[-16px] border-8 border-white"></div>
//       <div className="flex flex-row">
//         <div className="flex flex-1 flex-row gap-2 items-center">
//           <div className="w-[15px]">
//             <img src="/musical-note.png" alt="Music note" />
//           </div>
//           {/* <span>{props.musicTitle.length > 10 ? `${props.musicTitle.substring(0, 10)}...` : props.musicTitle}</span> */}
//         </div>
//         <a
//           href={`/play/${props.videoId}`}
//           className="flex flex-row gap-2 items-center underline text-sm"
//         >
//           try it!
//           <div className="w-[25px]">
//             <img src="/joystick.png" alt="play" />
//           </div>
//         </a>
//       </div>

//       <div className="video-container relative overflow-x-hidden">
//         <ReactPlayer
//           url={props.videoUrl}
//           playing={isHovered}
//           height="100%"
//           style={{ aspectRatio: "16/9", transform: "translateX(-30%)" }}
//         />

//         {!isHovered && (
//           <div className="absolute z-2 inset-0 bg-gray-700 bg-opacity-75 flex flex-col items-center justify-center text-white">
//             <img src="/tap.png" alt="" />
//             <span>Hover Me</span>
//           </div>
//         )}
//       </div>
//       <div>{props.videoTitle}</div>
//       <div className="w-full flex flex-row">
//         {/* <span className="font-bold flex-1">{props.creator}</span> */}
//         <span>
//           <img src="" alt="" />
//           {props.heart}
//         </span>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import Page from "../layouts/Page";
import ReactPlayer from "react-player";

export default function Explore() {
  const [videos, setVideos] = useState([
    {
      id: "ballet",
      title: "Ballet",
      videoURL: "/videos/ballet.mov",
      hearts: 120,
      country: "fr",
    },
    {
      id: "afro",
      title: "Afro",
      videoURL: "/videos/afro.mov",
      hearts: 250,
      country: "ng",
    },
    {
      id: "footloose",
      title: "Footloose",
      videoURL: "/videos/footloose.mov",
      hearts: 300,
      country: "us",
    },
    {
      id: "dynamite",
      title: "Dynamite",
      videoURL: "/videos/dynamite.mov",
      hearts: 500,
      country: "kr",
    },
    {
      id: "bhangra",
      title: "Bhangra",
      videoURL: "/videos/bhangra.mov",
      hearts: 150,
      country: "in",
    },
    {
      id: "salsa",
      title: "Salsa",
      videoURL: "/videos/salsa.mov",
      hearts: 220,
      country: "es",
    },
    {
      id: "butter",
      title: "Butter",
      videoURL: "/videos/butter.mov",
      hearts: 330,
      country: "kr",
    },
    {
      id: "drill",
      title: "Drill",
      videoURL: "/videos/drill.mov",
      hearts: 440,
      country: "us",
    },
    {
      id: "rasputin",
      title: "Rasputin",
      videoURL: "/videos/rasputin.mov",
      hearts: 280,
      country: "ru",
    },
  ]);

  // useEffect(() => {
  //         async function fetchVideos() {
  //           // fetch videos from the database
  //           const querySnapshot = await getDocs(collection(db, "videos"));
  //           const tempVideos: any[] = [];
  //           querySnapshot.forEach((doc) => {
  //             tempVideos.push({
  //               id: doc.id,
  //               ...doc.data(),
  //             });
  //           });
  //           setVideos(tempVideos);
  //         }

  //         fetchVideos();
  //       }, []);

  return (
    <Page>
      <div className="w-full h-full flex flex-col items-center">
        <h1 className="text-neon-blue font-extrabold text-4xl neon-highlight">
          Trending Dances
        </h1>
        <span className="mb-8 text-neon-purple font-medium tracking-wider">
          Learn new dances from across the world
        </span>

        <div className="grid grid-cols-3 gap-y-16 gap-x-16 mx-16">
          {videos
            .sort((a, b) => a.id.localeCompare(b.id)) // Sort videos alphabetically by title
            .map((video, index) => (
              <VideoCard
                key={index}
                videoId={video.id}
                videoUrl={video.videoURL}
                videoTitle={video.title}
                hearts={video.hearts}
                country={video.country}
              />
            ))}
        </div>
      </div>
    </Page>
  );

  function VideoCard(props: any) {
    const [isHovered, setIsHovered] = useState(false);
    return (
      <a href={`/play/${props.videoId}`} className="retro-card-link">
        <div
          className="flex flex-col border-4 border-neon-purple rounded-lg px-4 py-2 hover:shadow-retro hover:border-neon-blue hover:bg-gray-800 hover:text-neon-blue transition-all duration-300 relative gap-2"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="absolute top-[-12px] right-[-12px] border-4 border-neon-purple rounded-full"></div>
          <div className="flex flex-row items-center gap-2">
            <img
              src="/musical-note.png"
              alt="Music note"
              className="w-[15px]"
            />
            <img
              className="ml-2 w-[30px] h-[20px]"
              src={`https://flagcdn.com/w20/${props.country}.png`}
              alt={`${props.country} flag`}
            />
            <a
              href={`/play/${props.videoId}`}
              className="flex flex-row gap-2 items-center underline text-sm ml-auto text-neon-blue hover:text-neon-purple"
            >
              try it!
              <div className="w-[25px]">
                <img src="/joystick.png" alt="play" />
              </div>
            </a>
          </div>

          <div className="video-container relative overflow-x-hidden border-2 border-neon-blue rounded-md">
            <ReactPlayer
              url={props.videoUrl}
              playing={isHovered}
              height="100%"
              style={{ aspectRatio: "16/9", transform: "translateX(-30%)" }}
            />

            {!isHovered && (
              <div className="absolute z-2 inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-neon-purple">
                <img src="/tap.png" alt="Tap" className="w-8" />
                <span className="font-mono">Hover Me</span>
              </div>
            )}
          </div>
          <div className="text-neon-blue font-bold">{props.videoTitle}</div>
          <div className="w-full flex flex-row text-neon-purple">
            <span className="flex items-center">
              <img src="/heart-icon.png" alt="Heart" className="w-4 h-4 mr-1" />
              {props.hearts} Hearts
            </span>
          </div>
        </div>
      </a>
    );
  }
}
