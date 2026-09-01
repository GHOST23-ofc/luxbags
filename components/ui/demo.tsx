"use client";

import { cn } from "@/lib/utils";
import { DotPattern } from "@/components/ui/dot-pattern";

export function DotPatternDemo() {
  return (
    <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-[#08090d] md:shadow-2xl">
      <p className="z-10 whitespace-pre-wrap text-center text-5xl font-extrabold tracking-tighter text-white">
        LUXBAGS <span className="text-[#e3c274]">MLS</span>
      </p>
      <p className="z-10 mt-2 text-sm font-medium tracking-wide text-neutral-400">
        Bolsa Mayorista de Bolsos & Carteras de Lujo • Colombia
      </p>
      <DotPattern
        width={20}
        height={20}
        cx={2}
        cy={2}
        cr={1.2}
        className={cn(
          "fill-[#e3c274]/40 [mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
        )}
      />
    </div>
  );
}
