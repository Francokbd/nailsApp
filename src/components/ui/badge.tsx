import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-[hsl(340_80%_70%/0.3)] bg-[hsl(340_80%_70%/0.1)] text-[hsl(340_80%_76%)]',
        secondary: 'border-[hsl(0_0%_20%)] bg-[hsl(0_0%_12%)] text-[hsl(0_0%_70%)]',
        pending: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
        confirmed: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
        completed: 'border-green-500/30 bg-green-500/10 text-green-400',
        cancelled: 'border-red-500/30 bg-red-500/10 text-red-400',
        destructive: 'border-red-500/30 bg-red-500/10 text-red-400',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
