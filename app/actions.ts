"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signUpAction = async (formData: FormData) => {
	const email = formData.get("email")?.toString();
	const password = formData.get("password")?.toString();
	const supabase = await createClient();
	const origin = (await headers()).get("origin");

	if (!email || !password) {
		return encodedRedirect(
			"error",
			"/sign-up",
			"Email and password are required"
		);
	}

	const { error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			emailRedirectTo: `${origin}/auth/callback`,
		},
	});

	if (error) {
		console.error(`${error.code} ${error.message}`);
		return encodedRedirect("error", "/sign-up", error.message);
	} else {
		return encodedRedirect(
			"success",
			"/sign-up",
			"Thanks for signing up! Please check your email for a verification link."
		);
	}
};

export const signInAction = async (formData: FormData) => {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;
	const supabase = await createClient();

	const { error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		return encodedRedirect("error", "/sign-in", error.message);
	}

	return redirect("/protected");
};

export const signInWithMagicLinkAction = async (formData: FormData) => {
	const email = formData.get("email") as string;
	const supabase = await createClient();
	const origin = (await headers()).get("origin");
	const { error } = await supabase.auth.signInWithOtp({
		email: email,
		options: {
			emailRedirectTo: `${origin}/auth/callback?redirect_to=/protected`,
		},
	});

	if (error) {
		return encodedRedirect(
			"error",
			"/sign-in-with-magic-link",
			error.message
		);
	}

	return encodedRedirect(
		"success",
		"/sign-in-with-magic-link",
		"Check your email for a magic link"
	);
};

export const forgotPasswordAction = async (formData: FormData) => {
	const email = formData.get("email")?.toString();
	const supabase = await createClient();
	const origin = (await headers()).get("origin");
	const callbackUrl = formData.get("callbackUrl")?.toString();

	if (!email) {
		return encodedRedirect(
			"error",
			"/forgot-password",
			"Email is required"
		);
	}

	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
	});

	if (error) {
		console.error(error.message);
		return encodedRedirect(
			"error",
			"/forgot-password",
			"Could not reset password"
		);
	}

	if (callbackUrl) {
		return redirect(callbackUrl);
	}

	return encodedRedirect(
		"success",
		"/forgot-password",
		"Check your email for a link to reset your password."
	);
};

export const resetPasswordAction = async (formData: FormData) => {
	const supabase = await createClient();

	const password = formData.get("password") as string;
	const confirmPassword = formData.get("confirmPassword") as string;

	if (!password || !confirmPassword) {
		encodedRedirect(
			"error",
			"/protected/reset-password",
			"Password and confirm password are required"
		);
	}

	if (password !== confirmPassword) {
		encodedRedirect(
			"error",
			"/protected/reset-password",
			"Passwords do not match"
		);
	}

	const { error } = await supabase.auth.updateUser({
		password: password,
	});

	if (error) {
		encodedRedirect(
			"error",
			"/protected/reset-password",
			`Password update failed. ${error.message}`
		);
	}

	encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
	const supabase = await createClient();
	await supabase.auth.signOut();
	return redirect("/sign-in");
};

export const createProfileAction = async (formData: FormData) => {
	const supabase = await createClient();
	const firstName = formData.get("firstName");
	const lastName = formData.get("lastName");
	const phoneNumber = formData.get("phoneNumber");

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return encodedRedirect("error", "/sign-in", "You are not singed in");
	}

	if (!firstName || !lastName || !phoneNumber) {
		return encodedRedirect(
			"error",
			"/protected/profile-create",
			"First name, last name and phone number are required"
		);
	}

	const { error } = await supabase.from("user_profiles").insert({
		id: user.id,
		first_name: firstName,
		last_name: lastName,
		phone_number: phoneNumber,
	});

	if (error?.code === "23505") {
		return encodedRedirect(
			"error",
			"/protected/profile-update",
			"User has already been created, please edit the profile"
		);
	}

	if (error) {
		return encodedRedirect(
			"error",
			"/protected/profile-create",
			error.message
		);
	}

	return redirect("/protected");
};

export const updateProfileAction = async (formData: FormData) => {
	const supabase = await createClient();
	const firstName = formData.get("firstName");
	const lastName = formData.get("lastName");
	const phoneNumber = formData.get("phoneNumber");

	if (!firstName || !lastName || !phoneNumber) {
		return encodedRedirect(
			"error",
			"/protected/profile-create",
			"First name, last name and phone number are required"
		);
	}

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return encodedRedirect("error", "/sign-in", "You are not singed in");
	}

	const { error } = await supabase
		.from("user_profiles")
		.update({
			first_name: firstName,
			last_name: lastName,
			phone_number: phoneNumber,
		})
		.eq("id", user.id);

	if (error) {
		return encodedRedirect(
			"error",
			"/protected/profile-update",
			error.message
		);
	}

	return encodedRedirect(
		"success",
		"/protected/profile-update",
		"Profile updated"
	);
};
