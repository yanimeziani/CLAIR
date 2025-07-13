"use client"

import * as React from "react"
import { Check, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

const Stepper = React.forwardRef<
  HTMLOListElement,
  React.HTMLAttributes<HTMLOListElement>
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      "flex items-center w-full text-sm font-medium text-center text-gray-500 dark:text-gray-400 sm:text-base",
      className
    )}
    {...props}
  />
))
Stepper.displayName = "Stepper"

const StepperItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement> & {
    isActive?: boolean
    isCompleted?: boolean
    isLast?: boolean
  }
>(({ className, isActive, isCompleted, isLast, children, ...props }, ref) => (
  <li
    ref={ref}
    className={cn(
      "flex md:w-full items-center",
      !isLast && "md:after:content-[''] md:after:w-full md:after:h-1 md:after:border-b md:after:border-gray-200 md:after:border-1 md:after:hidden sm:after:inline-block md:after:mx-6 xl:after:mx-10 dark:after:border-gray-700",
      className
    )}
    {...props}
  >
    <span
      className={cn(
        "flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0",
        isCompleted && "bg-primary text-primary-foreground",
        isActive && !isCompleted && "bg-primary/20 text-primary border-2 border-primary",
        !isActive && !isCompleted && "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
      )}
    >
      {isCompleted ? (
        <Check className="w-4 h-4 lg:w-5 lg:h-5" />
      ) : (
        children
      )}
    </span>
  </li>
))
StepperItem.displayName = "StepperItem"

const StepperContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-8", className)}
    {...props}
  />
))
StepperContent.displayName = "StepperContent"

const StepperHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mb-8", className)}
    {...props}
  />
))
StepperHeader.displayName = "StepperHeader"

const StepperTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
StepperTitle.displayName = "StepperTitle"

const StepperDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
StepperDescription.displayName = "StepperDescription"

const StepperNavigation = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex justify-between mt-8", className)}
    {...props}
  />
))
StepperNavigation.displayName = "StepperNavigation"

export {
  Stepper,
  StepperItem,
  StepperContent,
  StepperHeader,
  StepperTitle,
  StepperDescription,
  StepperNavigation,
}