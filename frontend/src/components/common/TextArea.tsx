import { TextareaHTMLAttributes, forwardRef } from 'react'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
    error?: string
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={`
            w-full px-4 py-3.5 rounded-xl border-2 border-neutral-200 bg-white
            focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500
            hover:border-neutral-300
            disabled:bg-neutral-100 disabled:cursor-not-allowed
            transition-all duration-300 resize-none shadow-sm hover:shadow-md focus:shadow-lg
            ${error ? 'border-red-400 focus:ring-red-400 focus:border-red-500' : ''}
            ${className}
          `}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
            </div>
        )
    }
)

TextArea.displayName = 'TextArea'

export default TextArea
