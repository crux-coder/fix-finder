import { createProfileAction, updateProfileAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/server";
import { encodedRedirect } from "@/utils/utils";

export default async function ProfileEditor(props: {
	searchParams: Promise<Message>;
}) {
	let userHasProfile = false;

	const searchParams = await props.searchParams;
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	const { data, error } = await supabase
		.from("user_profiles")
		.select()
		.eq("id", user?.id);

	if (data && data.length === 1) {
		userHasProfile = true;
	}

	const userProfileData = data && data[0];

	if (error) {
		encodedRedirect("error", "/protected/profile-editor", error.message);
	}

	return (
		<form className="flex flex-col gap-4" encType="multipart/form-data">
			<h1 className="text-2xl font-medium">
				{userHasProfile ? "Edit profile" : "Create profile"}
			</h1>
			<p className="text-sm text-foreground/60">
				Please enter your data below.
			</p>
			<div>
				<Label htmlFor="firstName">First Name</Label>
				<Input
					name="firstName"
					placeholder="First Name"
					required
					defaultValue={
						userHasProfile ? userProfileData?.first_name : ""
					}
				/>
			</div>
			<div>
				<Label htmlFor="lastName">Last Name</Label>
				<Input
					name="lastName"
					placeholder="Last Name"
					required
					defaultValue={
						userHasProfile ? userProfileData?.last_name : ""
					}
				/>
			</div>
			<div>
				<Label htmlFor="phoneNumber">Phone Number</Label>
				<Input
					type="tel"
					pattern="^\+?\d+$"
					name="phoneNumber"
					placeholder="Phone Number"
					required
					defaultValue={
						userHasProfile ? userProfileData?.phone_number : ""
					}
				/>
			</div>
			<div>
				<Label htmlFor="picture">Picture</Label>
				<Input id="picture" type="file" name="picture" />
			</div>
			<SubmitButton
				formAction={
					userHasProfile ? updateProfileAction : createProfileAction
				}
			>
				Submit
			</SubmitButton>
			<FormMessage message={searchParams} />
		</form>
	);
}
