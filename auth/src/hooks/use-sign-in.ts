import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { signInSchema, SignInValues } from "@/lib/validation/auth-form";

export function useSignIn() {
  const router = useRouter();
  const [globalError, setGlobalError] = useState<string>("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Initialize React Hook Form
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleEmailSignIn = async (values: SignInValues) => {
    setGlobalError(""); // Clear previous errors

    try {
      const { error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: "http://localhost:3000",
      });

      if (error) {
        if (error.message?.includes("verified")) {
          setGlobalError("Please verify your email before signing in.");
        } else {
          setGlobalError("Invalid email or password.");
        }
        return;
      }

      router.push("http://localhost:3000");
    } catch (err) {
      setGlobalError("An unexpected error occurred. Please try again.");
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setGlobalError("");

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "http://localhost:3000",
      });

      if (error) {
        setGlobalError("Google sign-in failed.");
        setIsGoogleLoading(false);
      }
      // If success, redirect happens automatically by Better Auth
    } catch (err) {
      setGlobalError("Google sign-in failed. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  return {
    form,
    globalError,
    isGoogleLoading,
    handleEmailSignIn: form.handleSubmit(handleEmailSignIn), // Wrap it automatically
    handleGoogleSignIn,
  };
}
