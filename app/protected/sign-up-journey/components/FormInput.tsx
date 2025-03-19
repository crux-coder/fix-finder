import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type InputProps = {
	inputProps: React.ComponentProps<typeof Input>;
};

export default function FormInput({
	inputProps,
	labelProps,
	name,
}: {
	inputProps: React.ComponentProps<typeof Input>;
	labelProps: React.ComponentProps<typeof Label>;
	name: string;
}) {
	return (
		<div>
            
			<Label {...labelProps}>{name}</Label>
			<Input {...inputProps} placeholder={name} />
		</div>
	);
}
