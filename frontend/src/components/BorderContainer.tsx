import { twMerge } from "tailwind-merge";

interface BorderContainerProps {
    children: React.ReactNode | React.ReactNode[] | string | number | boolean;
    className?: string;
}

export default function BorderContainer({children, className}: BorderContainerProps) {



    return (
        <div className={twMerge("relative", className)}>
            {children}
            <div className="absolute left-0 top-[5px] border-x-size bg-white"/>
            <div className="absolute top-0 left-[5px] border-y-size bg-white"/>
            <div className="absolute bottom-0 left-[5px] border-y-size bg-white"/>
            <div className="absolute right-0 top-[5px] border-x-size bg-white"/>
        </div>
    )
}