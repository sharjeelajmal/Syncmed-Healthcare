"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
    className={cn(
      "group/select flex h-12 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-4 py-2 text-sm shadow-sm transition-colors data-[state=open]:border-[#67BA2E] focus:outline-none focus:ring-2 focus:ring-[#67BA2E] focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        {/* Rotates while the list is open (Radix sets data-state on the trigger). */}
        <ChevronDownIcon className="pointer-events-none size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out group-data-[state=open]/select:rotate-180 motion-reduce:transition-none" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

/**
 * Opens as an anchored popover below the trigger ("popper"). Radix flips it
 * above only when there is more room there, and caps its height to the space
 * available so the list scrolls instead of being clipped.
 */
function SelectContent({
  className,
  children,
  position = "popper",
  side = "bottom",
  align = "start",
  sideOffset = 6,
  collisionPadding = 12,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  const isPopper = position === "popper"

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        data-align-trigger={position === "item-aligned"}
        className={cn(
          "relative z-50 min-w-36 origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10",
          isPopper
            ? "max-h-[min(var(--radix-select-content-available-height),18rem)]"
            : "max-h-(--radix-select-content-available-height) data-[align-trigger=true]:animate-none",
          // Open: fade + slight scale + slide away from the trigger. Close: reverse, a bit faster.
          "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-open:duration-200 data-open:ease-out",
          "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:duration-150 data-closed:ease-in",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          "motion-reduce:animate-none",
          className
        )}
        position={position}
        {...(isPopper ? { side, align, sideOffset, collisionPadding } : { align })}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          data-position={position}
          className={cn(
            // In popper mode the list is exactly as wide as the trigger.
            "p-1 data-[position=popper]:w-full data-[position=popper]:min-w-(--radix-select-trigger-width)"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("px-1.5 py-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-2.5 text-sm outline-hidden select-none transition-colors duration-150 focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="pointer-events-none" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "z-10 flex cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronUpIcon
      />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "z-10 flex cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronDownIcon
      />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
