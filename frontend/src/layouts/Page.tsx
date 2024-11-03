import Navbar from "../components/Navbar";

interface PageProps {
    children: React.ReactNode | React.ReactNode[] | string | number | boolean;
}

export default function Page({ children }: PageProps) {
    return (
        <div className="w-full h-full max-w-screen-xl px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-6 flex flex-col gap-y-8">
            <Navbar/>
            {children}
        </div>
    )
}