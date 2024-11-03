import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function Navbar() {

    const user = useContext(AuthContext)

    async function handleLogOut() {
        try {
            await signOut(auth);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="mt-4 w-full flex justify-between items-center">

            <a href="/" className="flex gap-x-2 items-center">
                <img src="/globe.png" className="w-10 h-10"/>
                <p className="font-bold text-2xl">Orbit</p>
            </a>
            
            <div className="flex gap-x-4 items-center font-bold">
                <a href="/">Home</a>
                <a href="/dashboard">Dashboard</a>
                <a href="/explore">Explore</a>
                {
                    (user !== null) ? (
                        <button type="button" className="rounded-full" onClick={handleLogOut}>
                            <img src={user.photoURL!} width={32}/>
                        </button>
                    ):(
                        <a href="/login" className="px-4 py-3 bg-black text-white font-bold">Login</a>
                    )
                }
            </div>

        </div>
    )
}