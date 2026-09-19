import Image from "next/image";
import { cn } from "@/lib/utils";
import logo from "../../../public/brand/logo.png";

/** The official DisMe wordmark (from the provided logo asset). */
export function Wordmark({
  className,
  priority,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={logo}
      alt="DisMe"
      priority={priority}
      className={cn("h-auto w-auto select-none", className)}
      style={{ height: 28, width: "auto" }}
    />
  );
}
