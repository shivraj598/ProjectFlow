import { cn, avatarColor, initials } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  src?: string | null;
  className?: string;
  seed?: string;
}

export function UserAvatar({ name, src, className, seed }: UserAvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("size-6 shrink-0 rounded-full object-cover ring-1 ring-border", className)}
      />
    );
  }
  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ring-1 ring-black/10 select-none",
        avatarColor(seed ?? name),
        className
      )}
    >
      {initials(name)}
    </span>
  );
}
