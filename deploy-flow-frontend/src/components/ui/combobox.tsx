"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  emptyPlaceholder = "No results found.",
  disabled = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between border-border", // Base structure
            // Conditional styling for selected vs. not selected, including their hovers
            value
                ? "bg-zinc-700 text-white hover:!bg-zinc-600 hover:!text-white" // Selected state
                : "bg-background text-foreground hover:!bg-zinc-800 hover:!text-slate-100", // Not selected state
            !value && !disabled && "text-muted-foreground", // Placeholder text color when not selected and not disabled
            disabled && "opacity-50 cursor-not-allowed", // Disabled state
            className // Allow external overrides
          )}
          disabled={disabled}
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-background border border-border">
        <Command className="w-full">
          <CommandInput 
            placeholder={searchPlaceholder} 
            className="text-foreground border-border focus:ring-primary"
          />
          <CommandEmpty className="text-muted-foreground py-6 text-center text-sm">
            {emptyPlaceholder}
          </CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={(currentValue) => {
                  onChange(currentValue === value ? "" : currentValue)
                  setOpen(false)
                }}
                className={cn(
                  "cursor-pointer",
                  value === option.value
                    ? "bg-zinc-700 text-white aria-selected:bg-zinc-700" // Selected item style
                    : "text-foreground hover:!bg-zinc-800 hover:!text-slate-100 focus:!bg-zinc-800 focus:!text-slate-100" // Non-selected item style
                )}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
