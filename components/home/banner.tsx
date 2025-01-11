"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Banner() {
  return (
    <section className="relative h-[600px] w-full bg-[url('/banner.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative h-full w-full">
        <div className="mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-8 text-center">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Find Your Perfect Pet
          </h1>
          <p className="mt-6 max-w-3xl text-lg text-gray-300 sm:text-xl">
            Discover your new best friend from our wide selection of pets. We
            connect loving homes with adorable companions.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button
              size="lg"
              asChild
              className="bg-primary text-white hover:bg-primary/90"
            >
              <Link href="/pets">Browse Pets</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white text-white hover:bg-white hover:text-black"
            >
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
