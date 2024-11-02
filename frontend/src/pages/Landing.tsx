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
                    Explore culture worldwide through dance
                </h1>
                <a className="w-fit box-shadow-orbit border-4 border-black px-4 py-2 text-xl font-bold flex gap-x-2 items-center" href="/">
                    get started
                    <FaLongArrowAltRight />
                </a>
            </div>
            <div className="w-1/2 order-1 md:order-2">
                <img src="/3d-rendering-earth-map.png"/>
            </div>
        </div>
    )
}