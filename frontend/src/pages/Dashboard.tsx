import { useContext, useEffect } from "react"
import { AuthContext } from "../context/AuthContext"
import { redirect } from "react-router-dom";
import Page from "../layouts/Page";
import { FaAtlas, FaHistory, FaVideo } from "react-icons/fa";
import BasicForm from "../components/BasicForm";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../firebase";

export default function Dashboard() {

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
                ): (
                    <div className="w-full h-full flex gap-4">
                        <Sidebar
                            username={user.displayName!}
                        />
                        <MainContent />
                    </div>
                )
            }

        </Page>
    )
}

interface SidebarProps {
    username: string;
}

function Sidebar({username}: SidebarProps) {


    return (
        <div className="max-w-[300px] w-full h-full border-4 border-white p-4 flex flex-col gap-y-8 font-orbit font-bold">

            <div className="flex items-center gap-x-4">
                <FaVideo />
                <h4>Upload Video</h4>
            </div>

            <div className="flex items-center gap-x-4">
                <FaAtlas />
                <h4>Manage Videos</h4>
            </div>

            <div className="flex items-center gap-x-4">
                <FaHistory />
                <h4>Dance History</h4>
            </div>

            <div className="mt-auto">
                <h4>{username}</h4>
            </div>

        </div>
    )
}

function MainContent() {

    function handleVideoUpload(e: React.FormEvent) {
        e.preventDefault();
        const fileInput = document.getElementById("supercoolvideo") as HTMLInputElement;
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            alert("Please select a file first.");
            return;
        }
        const file = fileInput.files[0];
        const storageRef = ref(storage, `uploads/${file.name}`);
  
        // Upload the file
        const uploadTask = uploadBytesResumable(storageRef, file);uploadTask.on(
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
            }
          );
        console.log("Video uploaded");
    }

    return (
        <div className="w-full h-full border-4 p-4 border-white">
            <h1 className="text-2xl font-bold mb-4">
                Upload Your Dance Video
            </h1>

            <form className="flex flex-col gap-y-4" onSubmit={handleVideoUpload}>

                <div className="flex flex-col gap-y-1">
                    <label>
                        Video Title
                    </label>
                    <input type="text" className="text-black border-2 border-black rounded-md p-2" />
                </div>

                <div className="flex flex-col gap-y-1">
                    <label>
                        Video File
                    </label>
                    <input type="file" id="supercoolvideo" className="border-2 border-black rounded-md p-2" />
                </div>

                <button type="submit" className="bg-black text-white py-2 rounded-md">
                    Submit
                </button>

            </form>
        </div>
    )
}