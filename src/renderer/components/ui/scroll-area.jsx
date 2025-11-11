import * as React from "react";
import { cn } from "../../lib/utils";

const ScrollArea = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn("relative w-full h-full", className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ScrollArea.displayName = "ScrollArea";

export { ScrollArea };
