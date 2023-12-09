import clsx from "clsx";
import Image from "next/image";
import React from "react";

type ListItemProps = {
  fullName: string;
  age: number;
  imageSrc: string;
  isPresent?: boolean;
};
const ListItem: React.FC<ListItemProps> = ({
  fullName,
  age,
  imageSrc,
  isPresent = false,
}) => {
  return (
    <div className="flex items-center">
      <span className="relative flex shrink-0 overflow-hidden rounded-full h-9 w-9">
        <Image
          className="aspect-square h-full w-full"
          fill
          alt={`image of ${fullName}`}
          src={imageSrc}
        />
      </span>
      <div className="ml-4 space-y-1">
        <p className="text-sm font-medium leading-none">{fullName}</p>
        <p className="text-sm text-muted-foreground">{age}</p>
      </div>
      <form className="ml-auto hover:bg-muted/50 p-2" action="">
        <input
          type="checkbox"
          role="checkbox"
          aria-checked="false"
          checked={isPresent}
          className={clsx(
            "peer h-4 w-4 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 translate-y-[2px]",
            isPresent ? "bg-primary" : ""
          )}
          aria-label="Select row"
        />
      </form>
    </div>
  );
};

export default ListItem;
