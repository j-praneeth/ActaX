import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { Info } from "lucide-react"
import { useEffect } from "react"

function ToastItem({ id, title, description, action, ...props }: any) {
  const { dismiss } = useToast()

  useEffect(() => {
    // Auto-dismiss after 3 seconds (matching progress bar animation)
    const timer = setTimeout(() => {
      dismiss(id)
    }, 3000)

    return () => clearTimeout(timer)
  }, [id, dismiss])

  return (
    <Toast {...props}>
      <div className="flex items-start space-x-3 w-full">
        {/* Blue circular icon with white i */}
        <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <Info className="w-4 h-4 text-white" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && <ToastTitle>{title}</ToastTitle>}
          {description && (
            <ToastDescription className="text-gray-600">{description}</ToastDescription>
          )}
        </div>
        
        {/* Close button */}
        <ToastClose />
      </div>
      
      {/* Blue progress bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
        <div className="h-full bg-blue-500 rounded-b-lg animate-progress" />
      </div>
      
      {action}
    </Toast>
  )
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <ToastItem 
            key={id} 
            id={id}
            title={title}
            description={description}
            action={action}
            {...props} 
          />
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
