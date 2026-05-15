import * as React from "react"
 
 import { cn } from "@/lib/utils"
 
 function Input({ className, type, ...props }: React.ComponentProps<"input">) {
   return (
     <input
       type={type}
       data-slot="input"
       className={cn(
         "flex h-12 w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#67BA2E] focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
         className
       )}
       {...props}
     />
   )
 }
 
 export { Input }
