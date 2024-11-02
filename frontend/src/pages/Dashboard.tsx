import { useContext, useEffect } from "react"
import { AuthContext } from "../context/AuthContext"
import { redirect } from "react-router-dom";
import Page from "../layouts/Page";

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
                    <div>
                        
                    </div>
                )
            }

        </Page>
    )
}