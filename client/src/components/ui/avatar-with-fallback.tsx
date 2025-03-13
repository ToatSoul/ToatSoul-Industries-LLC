import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@shared/schema";

function getUserInitials(user?: Partial<User>): string {
  if (!user) return "?";
  
  if (user.name) {
    // Get initials from name
    return user.name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }
  
  if (user.username) {
    // Use first 2 characters from username if no name
    return user.username.substring(0, 2).toUpperCase();
  }
  
  return "?";
}

interface AvatarWithFallbackProps {
  user?: Partial<User>;
  className?: string;
}

export function AvatarWithFallback({ user, className }: AvatarWithFallbackProps) {
  const initials = getUserInitials(user);
  
  return (
    <Avatar className={className}>
      {user?.avatarUrl && (
        <AvatarImage src={user.avatarUrl} alt={user?.name || user?.username || "User"} />
      )}
      <AvatarFallback className="bg-primary-100 text-primary-800">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
