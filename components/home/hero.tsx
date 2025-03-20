"use client";

import {
  useMotionValue,
  useSpring,
  useTransform,
  motion,
  AnimatePresence,
} from "framer-motion";
import { useState, useEffect } from "react";
import { BlurFade } from "../magic-ui/blur-fade";
import { DotPattern } from "../magic-ui/dot-pattern";
import { Button } from "../ui/button";
import { AvatarCircles } from "./avatar-circles";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  // Avatar URLs
  const avatarUrls = [
    "https://avatars.githubusercontent.com/u/16860528",
    "https://avatars.githubusercontent.com/u/20110627",
    "https://avatars.githubusercontent.com/u/106103625",
    "https://avatars.githubusercontent.com/u/105497106",
  ];

  // States
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Mouse parallax setup
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 75 };
  const mouseX = useSpring(x, springConfig);
  const mouseY = useSpring(y, springConfig);

  const transformX = useTransform(mouseX, [-1, 1], [-10, 10]);
  const transformY = useTransform(mouseY, [-1, 1], [-10, 10]);

  // Hero Images
  const heroImages = [
    "https://images.unsplash.com/photo-1544568100-847a948585b9",
    "https://images.unsplash.com/photo-1450778869180-41d0601e046e",
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb",
    "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e",
    "https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48",
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba",
    "https://images.unsplash.com/photo-1573865526739-10659fec78a5",
    "https://images.unsplash.com/photo-1472491235688-bdc81a63246e",
    "https://images.unsplash.com/photo-1538099130811-745e64318258",
    "https://images.unsplash.com/photo-1495360010541-f48722b34f7d",
    "https://images.unsplash.com/photo-1592194996308-7b43878e84a6",
    "https://images.unsplash.com/photo-1556866261-8763a7662333",
    "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55",
    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b",
    "https://images.unsplash.com/photo-1567752881298-894bb81f9379",
    "https://images.unsplash.com/photo-1575859431774-2e57ed632664",
    "https://images.unsplash.com/photo-1583337130417-3346a1be7dee",
    "https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc",
    "https://images.unsplash.com/photo-1519052537078-e6302a4968d4",
    "https://images.unsplash.com/photo-1549291981-56d443d5e2a2",
    "https://images.unsplash.com/photo-1518288774672-b94e808873ff",
  ];
  //Banner Images
  const bannerImages = [
    "/images/launching_soon.png",
  ];
  // Image rotation interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(timer);
    // eslint-disable-next-line
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentImageIndex((prev) =>
          prev === 0 ? heroImages.length - 1 : prev - 1
        );
      } else if (e.key === "ArrowRight") {
        setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    //eslint-disable-next-line
  }, []);

  // Mouse move handler for parallax
  const handleMouseMove = (event: React.MouseEvent) => {
    const { currentTarget, clientX, clientY } = event;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();

    const xPos = (clientX - left) / width - 0.5;
    const yPos = (clientY - top) / height - 0.5;

    x.set(xPos);
    y.set(yPos);
  };

  // Swipe handling
  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  return (
    <section className="relative w-full bg-gradient-to-t from-primary/10 to-white">
      {/* Background Pattern - Adjusted for mobile */}
      <DotPattern
        className="absolute inset-0 opacity-20 md:opacity-40 [mask-image:radial-gradient(900px_circle_at_center,white,transparent)]"
        width={32}
        height={32}
        cx={16}
        cy={16}
        cr={1}
      />

      {/* Main Content */}
      <div className="max-w-screen-xl px-4 mx-auto sm:px-6 lg:px-8">
        {/* Banner Image */}
        <div className="w-full mb-8">
          <Image
            src={bannerImages[0]}
            alt="Launching Soon"
            width={1280}
            height={300}
            className="w-full object-cover rounded-lg"
            priority
          />
        </div>
        {/* Content Wrapper - Reduced height for mobile */}
        <div className="relative py-8 md:min-h-[80vh] md:py-16 lg:py-20">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left Column - Content */}
            <div className="flex flex-col justify-center space-y-4 md:space-y-6">
              <div className="space-y-6 md:space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex justify-center lg:justify-start"
                >
                  <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs md:px-4 md:py-1.5 md:text-sm font-medium text-primary">
                    Your Trusted Pet Care Partner
                  </span>
                </motion.div>

                <BlurFade delay={0.2} inView>
                  <h1 className="text-2xl font-bold tracking-tight text-center md:text-3xl sm:text-4xl lg:text-left lg:text-5xl xl:text-6xl">
                    Everything Your
                    <span className="text-primary"> Pet Needs</span>
                  </h1>
                </BlurFade>

                <BlurFade delay={0.3} inView>
                  <p className="max-w-xl mx-auto mt-2 text-sm text-center md:text-base text-muted-foreground sm:text-lg lg:text-left">
                    Find premium medicines, supplies, and care products for your
                    beloved pets. Trusted by thousands of pet parents across
                    India.
                  </p>
                </BlurFade>

                {/* Buttons - Adjusted for mobile */}
                <motion.div
                  className="flex justify-center gap-2 pt-3 md:gap-4 md:pt-4 sm:flex-row lg:justify-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    size="default"
                    className="w-full gap-2 sm:w-auto md:size-lg"
                    asChild
                  >
                    <Link href="/store">
                      Shop Now
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        →
                      </motion.span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="default"
                    className="w-full sm:w-auto md:size-lg"
                  >
                    View Categories
                  </Button>
                </motion.div>
              </div>

              {/* Social Proof - Adjusted for mobile */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-3 md:gap-4 lg:justify-start"
              >
                <AvatarCircles
                  avatarUrls={avatarUrls}
                  numPeople={2.5}
                  className="scale-75 md:scale-90"
                />
                <div className="text-xs md:text-sm">
                  <p className="font-medium">Trusted by 2500+ Pet Parents</p>
                  <p className="text-muted-foreground">Across 100+ cities</p>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Image */}
            <div className="relative flex items-center justify-center mt-8 lg:mt-0 lg:justify-end max-sm:hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative aspect-square w-full max-w-[320px] rounded-full bg-primary/10 sm:max-w-[400px] lg:max-w-[500px]"
                onMouseMove={handleMouseMove}
                style={{
                  x: transformX,
                  y: transformY,
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);
                  if (swipe < -swipeConfidenceThreshold) {
                    setCurrentImageIndex(
                      (prev) => (prev + 1) % heroImages.length
                    );
                  } else if (swipe > swipeConfidenceThreshold) {
                    setCurrentImageIndex((prev) =>
                      prev === 0 ? heroImages.length - 1 : prev - 1
                    );
                  }
                }}
              >
                <div className="absolute inset-0 overflow-hidden rounded-full">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentImageIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1 }}
                      className="relative w-full h-full"
                    >
                      <Image
                        src={`${heroImages[currentImageIndex]}?auto=format&fit=crop&w=1200&q=80`}
                        alt="Happy pets"
                        fill
                        priority
                        className={`object-cover transition-opacity duration-500 ${
                          isLoading ? "opacity-0" : "opacity-100"
                        }`}
                        onLoad={() => setIsLoading(false)}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Image Indicators */}
                <div className="absolute flex gap-2 -translate-x-1/2 bottom-4 left-1/2">
                  {heroImages.map((_, index) => (
                    <motion.button
                      key={index}
                      className={`h-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        currentImageIndex === index ? "bg-white" : "bg-white/50"
                      }`}
                      animate={{
                        width: currentImageIndex === index ? 16 : 6,
                        opacity: currentImageIndex === index ? 1 : 0.5,
                      }}
                      transition={{ duration: 0.3 }}
                      onClick={() => setCurrentImageIndex(index)}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Floating Elements */}
                <motion.div
                  className="absolute w-16 h-16 p-2 overflow-hidden bg-white rounded-lg shadow-lg -right-4 top-1/4 sm:h-20 sm:w-20 sm:p-3"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7"
                      alt="Pet medicine"
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                </motion.div>

                <motion.div
                  className="absolute w-16 h-16 p-2 overflow-hidden bg-white rounded-lg shadow-lg -left-4 bottom-1/4 sm:h-20 sm:w-20 sm:p-3"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee"
                      alt="Pet supplies"
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
