import { SubmitButton } from "@/components/submit-button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { signInWithMagicLinkAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import React from "react";

export default async function SignInWithMagicLink(props: {
	searchParams: Promise<Message>;
}) {
	const searchParams = await props.searchParams;
	return (
		<form className="flex-1 flex flex-col gap-2 min-w-64">
			<h1>Sign In With Magic Link</h1>
			<div className="py-4">
				<Label htmlFor="email">Email</Label>
				<Input placeholder="you@example.com" name="email" />
			</div>
			<SubmitButton
				pendingText="Sending..."
				formAction={signInWithMagicLinkAction}
			>
				Send Magic Link
			</SubmitButton>
			<FormMessage message={searchParams} />
		</form>
	);
}
