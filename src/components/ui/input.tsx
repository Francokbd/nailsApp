import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-xl border border-[hsl(0_0%_18%)] bg-[hsl(0_0%_8%)] px-4 py-2 text-sm text-[hsl(0_0%_98%)] placeholder:text-[hsl(0_0%_45%)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(340_80%_70%)] focus-visible:border-[hsl(340_80%_70%/0.5)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
