import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

interface SectionHeaderProps {
  title: string;
  subtitle: string;
}

const SectionHeader = ({ subtitle, title }: SectionHeaderProps) => {
  return (
    <div className="flex flex-col items-center sm:space-y-1">
      <h1 className="text-lg sm:text-3xl font-semibold text-primary ">
        {title}
      </h1>
      <p className="text-xs sm:text-lg text-zinc-600">{subtitle}</p>
      <Link
        href="/categories"
        className="text-xs sm:text-lg text-primary hover:underline flex items-center space-x-1 group"
      >
        View all
        <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-2 transition-all duration-200 ease-in-out" />
      </Link>
    </div>
  );
};

export default SectionHeader;
