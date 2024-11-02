import { useContext, useEffect, useRef } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Page from "../layouts/Page";
import { AuthContext } from "../context/AuthContext";
import { redirect } from "react-router-dom";

export default function Signup() {

    const user = useContext(AuthContext);

    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    useEffect(() => {

        // ! redirect to dashboard if user is already logged in
        if (user !== null) {
            redirect("/dashboard");
        }

    }, [])

    async function handleCreateAccount() {
        try {
            await createUserWithEmailAndPassword(
                auth,
                emailRef.current!.value,
                passwordRef.current!.value
            );
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Page>

            <div>

                

            </div>

        </Page>
    )
}