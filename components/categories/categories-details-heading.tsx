import React from "react";
import { Separator } from "../ui/separator";

interface Props {
  name: string;
  description: string;
}

const CategoryDetailsHeading = ({ description, name }: Props) => {
  return (
    <div className=" my-16">
      <h1 className="text-lg sm:text-3xl font-semibold text-primary font-poppins capitalize">
        {name}
      </h1>
      <p className="text-sm text-gray-600 font-poppins mt-2 ">{description}</p>
      <Separator className=" mt-10" />
    </div>
  );
};

export default CategoryDetailsHeading;
