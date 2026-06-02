import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-[hsl(340_80%_70%)] text-[hsl(0_0%_5%)] font-semibold hover:bg-[hsl(38_92%_45%)] shadow-lg shadow-[hsl(340_80%_70%/0.2)]',
        secondary:
          'bg-[hsl(0_0%_14%)] text-[hsl(0_0%_98%)] hover:bg-[hsl(0_0%_18%)] border border-[hsl(0_0%_20%)]',
        outline:
          'border border-[hsl(0_0%_20%)] bg-transparent text-[hsl(0_0%_98%)] hover:bg-[hsl(0_0%_10%)]',
        ghost:
          'bg-transparent text-[hsl(0_0%_70%)] hover:bg-[hsl(0_0%_10%)] hover:text-[hsl(0_0%_98%)]',
        destructive:
          'bg-[hsl(0_84%_60%/0.15)] text-[hsl(0_84%_65%)] border border-[hsl(0_84%_60%/0.3)] hover:bg-[hsl(0_84%_60%/0.25)]',
        link: 'underline-offset-4 hover:underline text-[hsl(340_80%_70%)] p-0 h-auto',
      },
      size: {
        default: 'h-11 px-5 py-2',
        sm: 'h-9 rounded-lg px-4 text-xs',
        lg: 'h-13 px-8 text-base rounded-xl',
        xl: 'h-14 px-10 text-base rounded-2xl',
        icon: 'h-10 w-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
