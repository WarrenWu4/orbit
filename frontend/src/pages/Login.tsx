import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import Page from "../layouts/Page";
import { auth, db } from "../firebase";
import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { redirect } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";

export default function Login() {

    const user = useContext(AuthContext);

    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    useEffect(() => {

        // ! redirect to dashboard if user is already logged in
        if (user !== null) {
            redirect("/dashboard");
        }

    }, [])

    async function handleLogin() {
        try {
            await signInWithEmailAndPassword(
                auth,
                emailRef.current!.value,
                passwordRef.current!.value
            );
        } catch (error) {
            console.error(error)
        }
    }

    async function handleGoogleLogin() {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider)
            const userData = result.user;
            // store user in the database as a document
            await setDoc(doc(db, "users", userData.uid), {
                email: userData.email,
                displayName: userData.displayName,
                photoUrl: userData.photoURL
            });
            // redirect to dashboard
            redirect("/dashboard");
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <Page>
            
            <div className="w-full h-full grid place-items-center">

                <form className="p-4 border-4 border-white flex flex-col gap-y-2" onSubmit={handleLogin}>
                    
                    <h1 className="text-white font-bold text-3xl"> Login to Orbit</h1>
                    
                    <input className="p-2 my-2 border-2 border-white" type="text" placeholder="Username" />

                    <input className="p-2 my-2 border-2 border-white" type="password" placeholder="Password" />
                    
                    <button className="w-full p-2 my-2 bg-blue-500 text-white" type="submit">Login</button>

                    <div className="text-center">
                        <a href="/signup" className="text-blue-500">Don't have an account? Register</a>
                    </div>

                    <div className="w-full h-2 bg-black"></div>

                    <button type="button" onClick={handleGoogleLogin}>
                        Continue with Google
                    </button>

                </form>

            </div>

        </Page>
    )
}
