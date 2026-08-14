const STEPS = [
	"Dados do Aluno",
	"Filiação e Contacto",
	"Saúde e Deficiências",
	"Responsável Legal",
];

interface StepperProps {
	currentStep: number;
}

export function Stepper({ currentStep }: StepperProps) {
	return (
		<div className="w-full mb-8">
			<div className="flex items-center justify-between">
				{STEPS.map((label, i) => (
					<div
						key={label}
						className="flex-1 flex flex-col items-center relative"
					>
						<div
							className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
								i < currentStep
									? "bg-brand-green text-white"
									: i === currentStep
										? "bg-brand-orange text-white"
										: "bg-gray-200 text-gray-500"
							}`}
						>
							{i < currentStep ? "✓" : i + 1}
						</div>
						<span
							className={`mt-1 text-xs text-center hidden sm:block ${
								i <= currentStep
									? "text-brand-green-dark font-medium"
									: "text-gray-400"
							}`}
						>
							{label}
						</span>
						{i < STEPS.length - 1 && (
							<div
								className={`absolute top-4 left-1/2 w-full h-0.5 ${
									i < currentStep ? "bg-brand-green" : "bg-gray-200"
								}`}
								style={{ zIndex: -1 }}
							/>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
