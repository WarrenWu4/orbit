import { useContext, useEffect, useRef, useState } from "react"
import { AuthContext } from "../context/AuthContext"
import Page from "../layouts/Page";
import { FaAtlas, FaHistory, FaRegTrashAlt, FaVideo } from "react-icons/fa";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { db, storage } from "../firebase";
import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import Markdown from "react-markdown";
import { FaTimes } from "react-icons/fa";

export default function Dashboard() {

    const [content, setContent] = useState(<MainContent />);
    const user = useContext(AuthContext);

    useEffect(() => {

    }, [])

    return (
        <Page>

            {
                (user === null) ? (
                    <div className="w-full h-full grid place-items-center">
                        <h1 className="text-white">Please login first to use this feature</h1>
                    </div>
                ) : (
                    <div className="w-full h-full flex gap-4">
                        <Sidebar
                            username={user.displayName!}
                            userPhoto={user.photoURL!}
                            setContent={setContent}
                        />
                        <div className="w-full h-full border-4 p-4 border-white">
                            {content}
                        </div>
                    </div>
                )
            }

        </Page>
    )
}

interface SidebarProps {
    username: string;
    userPhoto: string;
    setContent: React.Dispatch<React.SetStateAction<JSX.Element>>;
}

function Sidebar({ username, userPhoto, setContent }: SidebarProps) {

    const sections = [
        { icon: <FaVideo />, title: "Upload Video", content: <MainContent /> },
        { icon: <FaAtlas />, title: "Manage Videos", content: <ManageVideos /> },
        { icon: <FaHistory />, title: "Dance History", content: <DanceHistory /> },
    ]

    return (
        <div className="max-w-[240px] w-full h-full border-4 border-white p-4 flex flex-col gap-y-8 font-orbit font-bold">

            {sections.map((section, index) => {
                return (
                    <button key={index} type="button" onClick={() => setContent(section.content)} className="flex items-center gap-x-4">
                        {section.icon}
                        <h4>{section.title}</h4>
                    </button>
                )
            })}

            <div className="mt-auto flex items-center gap-x-2 text-xl">
                <img src={userPhoto} className="w-6 h-6"/>
                <h4>{username}</h4>
            </div>

        </div>
    )
}

function MainContent() {

    const user = useContext(AuthContext);
    const videoTitle = useRef<HTMLInputElement>(null);
    const countryRef = useRef<HTMLSelectElement>(null);
    const [countryNames, setCountryNames] = useState<string[]>([]);
    const [countries, setCountries] = useState<{ [name: string]: string }>({});

    function handleVideoUpload(e: React.FormEvent) {
        e.preventDefault();
        const countryVal = countryRef.current?.value;
        const fileInput = document.getElementById("supercoolvideo") as HTMLInputElement;
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            alert("Please select a file first.");
            return;
        }
        const file = fileInput.files[0];
        const storageRef = ref(storage, `uploads/${file.name}`);

        // Upload the file
        const uploadTask = uploadBytesResumable(storageRef, file); uploadTask.on(
            "state_changed",
            (snapshot) => {
                // Progress calculation
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Upload is ${progress}% done`);
            },
            (error) => {
                // Handle errors
                console.error("Upload failed:", error);
            },
            async () => {
                // Upload completed successfully
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                console.log("File available at", downloadURL);
                // upload video link and data to firestore
                await fetch("http://localhost:5000/video_process", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        user: user!.uid,
                        title: (videoTitle.current) ? videoTitle.current.value : "o shit",
                        country: countries[countryVal!],
                        videoURL: downloadURL,
                        hearts: 0,
                        vectorData: []
                    }),
                });
            }
        );
        console.log("Video uploaded");
    }

    useEffect(() => {

        async function fetchCountries() {
            const response = await fetch("/countries.txt")
            const data = await response.text()
            const [names, codes] = data.split("\n").map(line => {
                return line.trim().split("|")
            })

            setCountryNames(names);
            const temp: { [name: string]: string } = {}
            names.forEach((name, idx) => {
                temp[name] = codes[idx];
            })
            setCountries(temp);
        }

        fetchCountries();

    }, [])

    return (
        <div>
            <h1 className="text-2xl font-bold">
                Upload Your Dance Video
            </h1>

            <div className="border-white border-2 py-1 my-2"></div>

            <form className="flex flex-col gap-y-4" onSubmit={handleVideoUpload}>

                <div className="flex flex-col gap-y-1">
                    <label>
                        Video Title
                    </label>
                    <input ref={videoTitle} type="text" className="text-black border-2 border-black rounded-md p-2" />
                </div>

                <div className="flex flex-col gap-y-1">
                    <label>
                        Video File
                    </label>
                    <input type="file" id="supercoolvideo" className="p-2" />
                </div>

                <div className="flex flex-col gap-y-1">
                    <label>Country of Origin</label>
                    <select ref={countryRef} className="border-2 border-black rounded-md p-2 text-black">
                        {countryNames.map((name, index) => {
                            return (
                                <option key={index}>{name}</option>
                            )
                        })}
                    </select>
                </div>

                <button type="submit" className="bg-black text-white py-2 rounded-md">
                    Submit
                </button>

            </form>
        </div>
    )
}

function ManageVideos() {

    const [videos, setVideos] = useState<any[]>([]);
    const user = useContext(AuthContext);

    useEffect(() => {

        async function fetchVideos() {
            const tempVideos: any[] = [];
            const q = query(collection(db, "videos"), where("user", "==", user!.uid));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                tempVideos.push({
                    title: doc.data().title,
                    docRefId: doc.id,
                });
            })
            setVideos(tempVideos);
        }

        fetchVideos();

    }, [])

    return (
        <div>

            <h1 className="text-2xl font-bold">
                Manage Dance Videos
            </h1>

            <div className="border-white border-2 py-1 my-2"></div>

            <div className="w-full flex flex-row gap-8 font-bold mb-2">
                <span className="">Video Name</span>
                <span className="ml-auto">Delete</span>
            </div>

            {videos.map((video) => {
                async function deleteVideo() {
                    await deleteDoc(doc(db, "videos", video.docRefId));
                }

                return (
                    <div key={video.docRefId} className="w-full p-4 flex justify-between">
                        <h1>{video.title}</h1>
                        <button className="text-xl" type="button" onClick={deleteVideo}>
                            <FaRegTrashAlt />
                        </button>
                    </div>
                )
            })}

        </div>
    )
}

function DanceHistory() {
    const user = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalContent, setModalContent] = useState("");

    function openModal(content: string) {
        setModalContent(content);
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
    }

    const [scores, setScore] = useState<any[]>([{
        date: "adahd",
        title: "Floss",
        score: "1234",
        notes: "Dancing Prancing",
    }]);

    useEffect(() => {
        async function fetchScores() {
            const score_data: any[] = [];
            const q = query(collection(db, "scores"), where("userId", "==", user!.uid));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                score_data.push(doc.data());
            });
            // Sort scores by date
            score_data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setScore(score_data);
        }

        fetchScores();
    }, []);

    return (
        <div>
            {
                isModalOpen && (
                    <div>
                        <div className="absolute inset-0 bg-black opacity-50" onClick={closeModal}></div>
                        <div className="absolute top-[10%] left-[25%] bg-indigo-900 p-8 font-white flex flex-col w-[800px] h-[500px]">
                            <div className="flex flex-row">
                                <h1 className="text-2xl flex-1 font-bold">{modalTitle}</h1>
                                <FaTimes className="cursor-pointer" onClick={closeModal} />
                            </div>
                            <div className="border-white border-2 py-1 my-2"></div>
                            <Markdown className="w-full overflow-y-auto">
                                {modalContent}
                            </Markdown>
                        </div>
                    </div>
                )
            }
            <h1 className="text-2xl font-bol">Dance History</h1>
            <div className="border-white border-2 py-1 my-2"></div>
            <div className="flex flex-row gap-8 font-bold mb-2">
                <span className="text-slate-300 w-1/3">Date</span>
                <span className="w-1/3">Title</span>
                <span className="w-1/3">Score</span>
                <span className="pr-10">Notes</span>
            </div>
            <div className="flex flex-col gap-2">
                {scores.map((item, index) => (
                    <div key={index} className="flex flex-row">
                        <div className="flex flex-row flex-1 gap-8">
                            <span className="text-slate-300 break-words w-1/3">{item.date}</span>
                            <span className="break-words w-1/3">{item.title}</span>
                            <span className="break-words w-1/3">{item.score}</span>
                        </div>
                        <button onClick={() => {
                            setModalTitle(item.title)
                            openModal(item.notes)
                        }}><img src="/map.png" className="w-[25px] mr-16" alt="notes" /></button>
                    </div>
                ))}
            </div>
        </div>
    )
}