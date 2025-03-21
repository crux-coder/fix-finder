import { SubmitButton } from "@/components/submit-button";
import FormInput from "./components/FormInput";
import { signUpJourneyAction } from "@/app/actions";
import { createClient } from "@/utils/supabase/server";
import { FormMessage, Message } from "@/components/form-message";
import { encodedRedirect } from "@/utils/utils";
import { redirect } from "next/navigation";

export default async function SignUpJourney(props: {
	searchParams: Promise<Message>;
}) {
	const searchParams = await props.searchParams;
	const supabase = await createClient();
	const { data: authData, error: authError } = await supabase.auth.getUser();
	const user = authData.user ? authData.user : null;

	if (!user) {
		return encodedRedirect("error", "/sign-in", "Please sign in");
	}

	const hasPassword =
		user.user_metadata.login_method === "magic_link" ? false : true;

	const { data: userData, error: userDataError } = await supabase
		.from("user_profiles")
		.select()
		.eq("id", user.id);

	if (userData) {
		return redirect("/protected");
	}

	return (
		<form className="flex flex-col w-full max-w-md p-4 gap-2 ">
			<h1 className="text-2xl font-medium">Sign up Journey</h1>
			<p className="text-sm text-foreground/60">
				Please enter your data below.
			</p>
			{!hasPassword && (
				<>
					<FormInput
						name="Password"
						inputProps={{
							name: "password",
							type: "password",
							required: true,
						}}
						labelProps={{ htmlFor: "password" }}
					/>
					<FormInput
						name="Confirm Password"
						inputProps={{
							name: "confirmPassword",
							type: "password",
							required: true,
						}}
						labelProps={{ htmlFor: "confirmPassword" }}
					/>
				</>
			)}
			<FormInput
				name="First Name"
				inputProps={{ name: "firstName", required: true }}
				labelProps={{ htmlFor: "firstName" }}
			/>
			<FormInput
				name="Last Name"
				inputProps={{ name: "lastName", required: true }}
				labelProps={{ htmlFor: "lastName" }}
			/>
			<FormInput
				name="Organization name"
				inputProps={{ name: "organizationName" }}
				labelProps={{ htmlFor: "organizationName" }}
			/>
			<FormInput
				name="Profile picture"
				inputProps={{ name: "profilePicture", type: "file" }}
				labelProps={{ htmlFor: "profilePicture" }}
			/>

			<SubmitButton formAction={signUpJourneyAction}>Submit</SubmitButton>
			<FormMessage message={searchParams} />
		</form>
	);
}
