"use client";

import * as React from "react";
import { InputMask as ReactInputMask, MaskProps } from "@react-input/mask";
import { cn } from "@/lib/utils";

const InputMask = React.forwardRef<HTMLInputElement, MaskProps>(
  ({ className, ...props }, ref) => {
    return (
      <ReactInputMask
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
InputMask.displayName = "InputMask";

export { InputMask };
