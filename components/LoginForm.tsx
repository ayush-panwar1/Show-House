import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import GoogleOauth from "./GoogleOauth";

type LoginFormInputs = {
  email: string;
  password: string;
};

type LoginFormProps = {
  onSwitch: () => void;
};

export default function LoginForm({ onSwitch }: LoginFormProps) {
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  useEffect(() => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  }, [redirectUrl]);

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const res = await fetch("/api/signin-local", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      if (res.redirected) {
        setRedirectUrl(res.url);
        return;
      }

      const result = await res.json();

      if (!res.ok) {
        alert(result.error || "SignIn failed");
        return;
      }
    } catch (err) {
      console.error("SignIn error:", err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="mb-[10px]">
        <h2
          className="text-[42px] px-4 font-semibold mb-2 text-center bg-[#fafafa] rounded-full"
          style={{ color: "#4fa6be" }}
        >
          Login
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col items-center">
        <input
          {...register("email", { required: "Email required" })}
          placeholder="Email"
          className="bg-white w-full px-3 py-2 border rounded-full mb-3"
        />

        <input
          type="password"
          {...register("password", { required: "Password required" })}
          placeholder="Password"
          className="bg-white w-full px-3 py-2 border rounded-full mb-4"
        />

        <button type="submit" className="custom_pill_box mb-5" style={{ width: "192px" }}>
          Sign In
        </button>
      </form>

      <GoogleOauth />

      <div className="mt-6 flex flex-row gap-2 items-center bg-[#fafafa] rounded-full p-2">
        <p className="text-sm text-gray-500">{'Don\'t have an account?'}</p>
        <button
          onClick={onSwitch}
          className="text-[#48ACC8] font-bold hover:underline cursor-pointer"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}