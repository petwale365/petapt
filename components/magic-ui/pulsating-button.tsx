"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import React from "react";

interface PulsatingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pulseColor?: string;
  duration?: string;
  href?: string;
}

export function PulsatingButton({
  className,
  children,
  pulseColor = "#a3e635",
  duration = "2.5s",
  ...props
}: PulsatingButtonProps) {
  const router = useRouter();
  return (
    <button
      className={cn(
        "relative text-center cursor-pointer flex justify-center items-center rounded-lg text-white dark:text-black bg-primary dark:bg-blue-500 px-4 py-2",
        className
      )}
      onClick={() => {
        if (props.href) {
          router.push(props.href);
        }
      }}
      style={
        {
          "--pulse-color": pulseColor,
          "--duration": duration,
        } as React.CSSProperties
      }
      {...props}
    >
      <div className="relative z-10">{children}</div>
      <div className="absolute -translate-x-1/2 -translate-y-1/2 rounded-lg top-1/2 left-1/2 size-full bg-inherit animate-pulse" />
    </button>
  );
}
