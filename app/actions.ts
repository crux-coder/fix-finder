"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UserProfile } from "@/utils/types/UserProfile";

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
	const createdUserProfile: UserProfile = {
		first_name: firstName ? firstName.toString() : null,
		last_name: lastName ? lastName.toString() : null,
		phone_number: phoneNumber ? phoneNumber.toString() : null,
	};
	const file = formData.get("picture") as File | null;

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return encodedRedirect("error", "/sign-in", "You are not singed in");
	}

	createdUserProfile.id = user.id;

	if (!firstName || !lastName || !phoneNumber) {
		return encodedRedirect(
			"error",
			"/protected/profile-editor",
			"First name, last name and phone number are required"
		);
	}

	if (file) {
		const filePath = `${Date.now()}-${file.name}`;
		const { data: profilePictureData, error: profilePictureUploadError } =
			await supabase.storage
				.from("user-profile-pictures")
				.upload(filePath, file);

		if (profilePictureUploadError) {
			return encodedRedirect(
				"error",
				"/protected/profile-editor",
				profilePictureUploadError.message
			);
		}

		const profilePictureURL = supabase.storage
			.from("user-profile-pictures")
			.getPublicUrl(filePath).data.publicUrl;
		createdUserProfile.profile_picture_url = profilePictureURL;
		createdUserProfile.profile_picture_filepath = filePath;
	}

	const { error } = await supabase
		.from("user_profiles")
		.insert(createdUserProfile);

	if (error?.code === "23505") {
		return encodedRedirect(
			"error",
			"/protected/profile-editor",
			"User has already been created, please edit the profile"
		);
	}

	if (error) {
		return encodedRedirect(
			"error",
			"/protected/profile-editor",
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
	const file = formData.get("picture") as File | null;
	const updatedUserProfile: UserProfile = {
		first_name: firstName ? firstName.toString() : null,
		last_name: lastName ? lastName.toString() : null,
		phone_number: phoneNumber ? phoneNumber.toString() : null,
	};

	if (!firstName || !lastName || !phoneNumber) {
		return encodedRedirect(
			"error",
			"/protected/profile-editor",
			"First name, last name and phone number are required"
		);
	}

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return encodedRedirect("error", "/sign-in", "You are not singed in");
	}

	if (file) {
		const filePath = `${Date.now()}-${file.name}`;
		const { data: userProfileData, error: userProfileError } =
			await supabase.from("user_profiles").select().eq("id", user.id);
		const userProfile = userProfileData && userProfileData[0];

		if (userProfileError) {
			return encodedRedirect(
				"error",
				"/protected/profile-editor",
				userProfileError.message
			);
		}

		const { data: profilePictureData, error: profilePictureUploadError } =
			await supabase.storage
				.from("user-profile-pictures")
				.upload(filePath, file);

		if (profilePictureUploadError) {
			return encodedRedirect(
				"error",
				"/protected/profile-editor",
				profilePictureUploadError.message
			);
		}

		const profilePictureURL = supabase.storage
			.from("user-profile-pictures")
			.getPublicUrl(filePath).data.publicUrl;
		updatedUserProfile.profile_picture_url = profilePictureURL;
		updatedUserProfile.profile_picture_filepath = filePath;

		if (userProfile?.profile_picture_filepath) {
			const { error: profilePictureDeleteError } = await supabase.storage
				.from("user-profile-pictures")
				.remove([userProfile.profile_picture_filepath]);
			if (profilePictureDeleteError) {
				return encodedRedirect(
					"error",
					"/protected/profile-editor",
					profilePictureDeleteError.message
				);
			}
		}
	}

	const { error } = await supabase
		.from("user_profiles")
		.update(updatedUserProfile)
		.eq("id", user.id);

	if (error) {
		return encodedRedirect(
			"error",
			"/protected/profile-editor",
			error.message
		);
	}

	return encodedRedirect(
		"success",
		"/protected/profile-editor",
		"Profile updated"
	);
};
