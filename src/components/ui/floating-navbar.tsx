"use client";
import React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: JSX.Element;
  }[];
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex w-full mx-auto border border-transparent dark:border-white/[0.2] rounded-full dark:bg-black bg-white shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] pr-2 pl-4 py-2 items-center justify-between",
        className
      )}
    >
      <div className="flex items-center space-x-2">
        {navItems.map((navItem: any, idx: number) => (
          <Link
            key={`link-${idx}`}
            href={navItem.link}
            className={cn(
              "relative dark:text-neutral-50 items-center flex space-x-1 text-neutral-600 dark:hover:text-neutral-300 hover:text-neutral-500 text-xs"
            )}
          >
            <span className="block">{navItem.icon}</span>
            <span className="hidden sm:block">{navItem.name}</span>
          </Link>
        ))}
      </div>
      {/* <button className="border text-xs font-medium relative border-neutral-200 dark:border-white/[0.2] text-black dark:text-white px-2 py-1 rounded-full">
        <span>Login</span>
        <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px" />
      </button> */}
    </div>
  );
};