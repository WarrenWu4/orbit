import Page from "../layouts/Page";
import { FaLongArrowAltRight } from "react-icons/fa";

export default function Landing() {
    return (
        <Page>
            <HeroSection/>
        </Page>
    )
}

function HeroSection() {
    return (
        <div className="w-full flex flex-col md:flex-row justify-center gap-12 items-center">

            <div className="w-3/4 md:w-1/2 order-2 md:order-1">

                <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl text-shadow-orbit mb-8">
                    DANCING MADE EASY
                </h1>

                <p className="font-orbit font-bold text-2xl mb-4">Explore culture worldwide through dance</p>

                <a className="bg-gradient-1 w-fit px-4 py-3 text-xl font-orbit font-bold flex gap-x-4 items-center" href="/">
                    get started
                    <FaLongArrowAltRight />
                </a>
            
            </div>

            <div className="p-12 w-1/2 order-1 md:order-2">
                <img src="/brandbird.png"/>
            </div>
        
        </div>
    )
}