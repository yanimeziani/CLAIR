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
      "flex items-center w-full text-xs sm:text-sm font-medium text-center text-gray-500 dark:text-gray-400 overflow-x-auto pb-2",
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
      "flex w-full items-center min-w-0 relative",
      !isLast && "after:content-[''] after:w-full after:h-0.5 after:bg-gray-200 dark:after:bg-gray-700 after:absolute after:top-1/2 after:-translate-y-1/2 after:left-8 sm:after:left-10 after:z-0",
      className
    )}
    {...props}
  >
    <span
      className={cn(
        "flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full shrink-0 relative z-10 text-xs sm:text-sm font-medium",
        isCompleted && "bg-primary text-primary-foreground",
        isActive && !isCompleted && "bg-primary/20 text-primary border-2 border-primary",
        !isActive && !isCompleted && "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
      )}
    >
      {isCompleted ? (
        <Check className="w-3 h-3 sm:w-4 sm:h-4" />
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
    className={cn("mt-4 sm:mt-6 md:mt-8", className)}
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
    className={cn("mb-4 sm:mb-6 md:mb-8", className)}
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
    className={cn("text-lg sm:text-xl font-semibold leading-tight tracking-tight", className)}
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
    className={cn("text-xs sm:text-sm text-muted-foreground mt-1", className)}
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
    className={cn("flex flex-col-reverse gap-3 sm:flex-row sm:justify-between sm:gap-0 mt-6 sm:mt-8", className)}
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