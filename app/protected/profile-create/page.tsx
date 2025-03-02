import { createProfileAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function ProfileEditor(props: {
	searchParams: Promise<Message>;
}) {
	const searchParams = await props.searchParams;

	return (
		<form className="flex flex-col gap-4" encType="multipart/form-data">
			<h1 className="text-2xl font-medium">Create profile</h1>
			<p className="text-sm text-foreground/60">
				Please enter your data below.
			</p>
			<div>
				<Label htmlFor="firstName">First Name</Label>
				<Input name="firstName" placeholder="First Name" required />
			</div>
			<div>
				<Label htmlFor="lastName">Last Name</Label>
				<Input name="lastName" placeholder="Last Name" required />
			</div>
			<div>
				<Label htmlFor="phoneNumber">Phone Number</Label>
				<Input
					type="tel"
					pattern="^\+?\d+$"
					name="phoneNumber"
					placeholder="Phone Number"
					required
				/>
			</div>
			<div>
				<Label htmlFor="picture">Picture</Label>
				<Input id="picture" type="file" name="picture" />
			</div>
			<SubmitButton formAction={createProfileAction}>Submit</SubmitButton>
			<FormMessage message={searchParams} />
		</form>
	);
}
