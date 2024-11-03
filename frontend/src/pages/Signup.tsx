import { useContext, useEffect, useRef, useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Page from "../layouts/Page";
import { AuthContext } from "../context/AuthContext";
import { redirect } from "react-router-dom";
import { addDoc } from "firebase/firestore";

export default function Signup() {

    const user = useContext(AuthContext);

    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const confirmPasswordRef = useRef<HTMLInputElement>(null);
    const [confirmError, setConfirmError] = useState(false);

    useEffect(() => {

        // ! redirect to dashboard if user is already logged in
        if (user !== null) {
            redirect("/dashboard");
        }

    }, [])

    async function handleCreateAccount(event: React.FormEvent) {
        event.preventDefault();

        if (passwordRef.current!.value !== confirmPasswordRef.current!.value) {
            setConfirmError(true);
            console.error("Passwords do not match");
            return;
        }

        setConfirmError(false);

        try {
            await createUserWithEmailAndPassword(
                auth,
                emailRef.current!.value,
                passwordRef.current!.value
            );
            await addDoc(collections(db, "users"), {
                email: emailRef.current!.value,
                displayName: "John Doe",
                photoUrl: ""
            });
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Page>
            <div className="w-full h-full grid place-items-center">

                <form className="p-4 border-4 border-white flex flex-col gap-y-2" onSubmit={handleCreateAccount}>

                    <h1 className="text-white font-bold text-3xl"> Join Orbit</h1>
                    {confirmError && (<div className="text-red-500">
                        *Password does not match
                    </div>)}

                    <input className="p-2 my-2 border-2 border-white text-black" ref={emailRef} type="text" placeholder="Email" />

                    <input className="p-2 my-2 border-2 border-white text-black" ref={passwordRef} type="password" placeholder="Password" />

                    <input className="p-2 my-2 border-2 border-white text-black" ref={confirmPasswordRef} type="password" placeholder="Confirm Password" />

                    <button className="w-full p-2 my-2 bg-blue-500 text-white" type="submit">Sign Up</button>

                    <div className="text-center">
                        <a href="/login" className="text-blue-500">Already have an account? Login</a>
                    </div>
                </form>

            </div>

        </Page>
    )
}

function collections(db: any, arg1: string): any {
    throw new Error("Function not implemented.");
}
