import { Check } from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Address' },
  { id: 2, label: 'Payment' },
  { id: 3, label: 'Confirmation' },
]

export default function CheckoutStepper({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  return (
    <nav aria-label="Checkout progress" className="flex items-center justify-center mb-8">
      {STEPS.map((step, i) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors ${
                step.id < currentStep
                  ? 'bg-brand-gold border-brand-gold text-white'
                  : step.id === currentStep
                  ? 'bg-brand-black border-brand-black text-white'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}
              aria-current={step.id === currentStep ? 'step' : undefined}
            >
              {step.id < currentStep ? <Check size={14} aria-hidden="true" /> : step.id}
            </div>
            <span
              className={`text-xs mt-1 ${
                step.id === currentStep ? 'text-brand-black font-medium' : 'text-gray-400'
              }`}
            >
              {step.label} {step.id < currentStep && '(completed)'}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`w-16 md:w-24 h-0.5 mx-2 mb-5 ${
                step.id < currentStep ? 'bg-brand-gold' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </nav>
  )
}
