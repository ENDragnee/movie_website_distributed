import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { signUpSchema, SignUpValues } from "@/lib/validation/auth-form";

export function useSignUp() {
  const router = useRouter();
  const [globalError, setGlobalError] = useState<string>("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleEmailSignUp = async (values: SignUpValues) => {
    setGlobalError("");

    try {
      const { error } = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
      });

      if (error) {
        if (error.message?.includes("already exists")) {
          setGlobalError("An account with this email already exists.");
        } else {
          setGlobalError(error.message || "Registration failed.");
        }
        return;
      }

      // Show success UI
      setIsSuccess(true);

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push("http://auth.dracula.com/sign-in");
      }, 3000);
    } catch (err) {
      setGlobalError("An unexpected error occurred. Please try again.");
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setGlobalError("");

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "http://dracula.com",
      });

      if (error) {
        setGlobalError("Google sign-up failed.");
        setIsGoogleLoading(false);
      }
    } catch (err) {
      setGlobalError("Google sign-up failed. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  return {
    form,
    globalError,
    isGoogleLoading,
    isSuccess,
    handleEmailSignUp: form.handleSubmit(handleEmailSignUp),
    handleGoogleSignUp,
  };
}

