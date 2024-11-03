import { useEffect, useState } from "react";
import Page from "../layouts/Page";
import ReactPlayer from "react-player";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { HiCursorClick } from "react-icons/hi";

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
      id: "haidilao",
      title: "Haidilao",
      videoURL: "/videos/haidilao.mov",
      hearts: 500,
      country: "cn",
    },
    {
        id:"samba",
        title:"Samba",
        videoURL:"/videos/samba.mov",
        hearts: 300,
        country: "br",
    },
    {
        id:"floss",
        title:"Floss",
        videoURL:"/videos/floss.mov",
        hearts: 200,
        country: "us",
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

  useEffect(() => {
          async function fetchVideos() {
            // fetch videos from the database
            const querySnapshot = await getDocs(collection(db, "videos"));
            const tempVideos: any[] = [];
            querySnapshot.forEach((doc) => {
              tempVideos.push({
                id: doc.id,
                ...doc.data(),
              });
            });
            setVideos((prev) => [...prev, ...tempVideos]);
          }

          fetchVideos();
        }, []);

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
                order={index}
                videoId={video.id}
                videoUrl={video.videoURL}
                videoTitle={video.title}
                hearts={video.hearts}
                country={video.country}
                setVideos={setVideos}
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
          className="flex flex-col border-4 border-neon-purple px-4 py-2 hover:shadow-retro hover:border-neon-blue hover:bg-gray-800 hover:text-neon-blue transition-all duration-300 relative gap-2"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="absolute top-[-12px] right-[-12px] border-4 border-neon-blue"></div>
          <div className="flex flex-row items-center gap-2">
            <img
              src="/musical-note.png"
              alt="Music note"
              className="w-[15px]"
            />
            <img
              className="ml-2 w-[30px] h-[20px]"
              src={`https://flagcdn.com/w160/${props.country.toLowerCase()}.png`}
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

          <div className="video-container relative overflow-x-hidden border-2 border-neon-blue">
            <ReactPlayer
              url={props.videoUrl}
              playing={isHovered}
              height="100%"
              style={{ aspectRatio: "16/9", transform: "translateX(-30%)" }}
            />

            {!isHovered && (
              <div className="absolute z-2 inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-neon-purple">
                <div className="w-fit h-fit relative -translate-x-1">
                  <HiCursorClick className="text-3xl text-white" />
                  <span className="absolute top-0 left-0 inline-flex rounded-full h-fit w-fit bg-white"></span>
                  <span className="top-0 left-0 animate-ping absolute inline-flex h-4 w-4 rounded-full bg-white opacity-75"></span>
                </div>
                <span className="mt-2 text-white">Hover Me</span>
              </div>
            )}
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="text-neon-blue font-bold">{props.videoTitle}</div>
            <div className="flex flex-row text-neon-purple items-center gap-x-2">
                {props.hearts}
                <img src="/heart-icon.png" alt="Heart" className="w-4 h-4 mr-1" />
            </div>
          </div>
        </div>
      </a>
    );
  }
}
