import Page from "../layouts/Page";
import { TiArrowRightOutline } from "react-icons/ti";

export default function Landing() {
  return (
    <Page>
      <HeroSection />
    </Page>
  );
}

function HeroSection() {
  return (
    <div className="-mt-6 w-full h-full flex flex-col justify-center items-center gap-6">

        <div className="flex flex-col gap-y-4 items-center">
          <img className="w-fit" src="/text/dancing.png"/>
          <img className="w-fit" src="/text/made_easy.png"/>
        </div>        


        <p className="font-bold text-2xl mb-2 text-center">
          Explore culture worldwide<br/>through the medium of{" "}
          <span className="underline text-bold">dance!</span>
        </p>

        <a
          href="/explore"
          className="bg-gradient-1 w-fit px-4 py-4 text-xl font-orbit font-bold flex gap-x-4 items-center"
        >
          Get Started
          <TiArrowRightOutline className="text-2xl" />
        </a>

    </div>
  );
}
