import { cn } from "@/lib/utils";
import type { Priority } from "@/lib/constants";
import { PRIORITY_META } from "@/lib/constants";

export function PriorityDot({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-1.5 shrink-0 rounded-full", className)}
      style={{ backgroundColor: PRIORITY_META[priority].dot }}
    />
  );
}

export function PriorityLabel({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", PRIORITY_META[priority].color, className)}>
      <PriorityDot priority={priority} />
      {PRIORITY_META[priority].label}
    </span>
  );
}
