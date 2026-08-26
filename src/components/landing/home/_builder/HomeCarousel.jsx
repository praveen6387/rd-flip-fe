"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const SLIDES = [
  { src: "/carousel/Cros1.png", alt: "Flipbook sample 1" },
  { src: "/carousel/Cros-2.png", alt: "Flipbook sample 2" },
  { src: "/carousel/Cors3.png", alt: "Flipbook sample 3" },
  { src: "/carousel/Cors4.png", alt: "Flipbook sample 4" },
];

export default function HomeCarousel() {
  const [api, setApi] = useState(null);

  useEffect(() => {
    if (!api) return;
    const interval = setInterval(() => {
      api.scrollNext();
    }, 3000);
    return () => clearInterval(interval);
  }, [api]);

  return (
    <Carousel setApi={setApi} opts={{ loop: true }} className="h-full w-full">
      <CarouselContent className="ml-0 h-[calc(100vh-5rem)]">
        {SLIDES.map((slide) => (
          <CarouselItem key={slide.src} className="pl-0">
            <div className="relative h-full w-full overflow-hidden">
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-linear-to-r from-white/85 via-white/55 to-transparent" />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-3 border-white/40 bg-white/20 text-slate-800 backdrop-blur-sm hover:bg-white hover:text-slate-900 sm:left-6" />
      <CarouselNext className="right-3 border-white/40 bg-white/20 text-slate-800 backdrop-blur-sm hover:bg-white hover:text-slate-900 sm:right-6" />
    </Carousel>
  );
}
