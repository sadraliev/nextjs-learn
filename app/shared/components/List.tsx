import Link from "next/link";
import { FC } from "react";

type ListProps = {
  title: string;
};

export const List: FC<ListProps> = ({ title = "Title" }) => {
  return (
    <div className="flex items-center ">
      <Link className="w-4 h-4 mr-4" href="/schedule">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
          />
        </svg>
      </Link>
      <h3 className=" text-3xl my-4 font-bold leading-none tracking-tight">
        {title}
      </h3>
    </div>
  );
};
