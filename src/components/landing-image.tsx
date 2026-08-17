"use client";

import Image from "next/image";
import { useState } from "react";
import { Guitar } from "lucide-react";

interface LandingImageProps {
  src: string;
  alt: string;
  label?: string;
}

export default function LandingImage({ src, alt, label = "Hình ảnh — sẽ cập nhật sau" }: LandingImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative h-full w-full">
      {!failed && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      )}
      {failed && (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2">
          <Guitar className="h-10 w-10 text-neutral-300 dark:text-neutral-700" />
          <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500">{label}</p>
        </div>
      )}
    </div>
  );
}
