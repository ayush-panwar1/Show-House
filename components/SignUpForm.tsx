import { useForm } from "react-hook-form";
import GoogleOauth from "./GoogleOauth";

type SignUpFormInputs = {
  email: string;
  password: string;
  confirm_password: string;
};

type SignUpFormProps = {
  onSwitch: () => void;
};

export default function SignUpForm({ onSwitch }: SignUpFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormInputs>();

  const onSubmit = async (data: SignUpFormInputs) => {
    try {
      const res = await fetch("/api/signup-local", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          confirm_password: data.confirm_password,
        }),
      });

      if (res.redirected) {
        window.location.href = res.url;
        return;
      }

      const result = await res.json();

      if (!res.ok) {
        alert(result.error || "Signup failed");
        return;
      }

      alert("Signup successful!");
    } catch (err) {
      console.error("Signup error:", err);
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
          Sign Up
        </h2>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full flex flex-col gap-3 items-center"
      >
        {/* EMAIL */}
        <input
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^\S+@\S+$/i,
              message: "Enter a valid email",
            },
          })}
          placeholder="Email"
          className="bg-white w-full px-3 py-2 border rounded-full mb-1"
        />
        {errors.email && (
          <p className="text-sm mb-2">
            {errors.email.message}
          </p>
        )}

        {/* PASSWORD */}
        <input
          type="password"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
          placeholder="Password"
          className="bg-white w-full px-3 py-2 border rounded-full mb-1"
        />
        {errors.password && (
          <p className="text-sm mb-2">
            {errors.password.message}
          </p>
        )}

        {/* CONFIRM PASSWORD */}
        <input
          type="password"
          {...register("confirm_password", {
            required: "Please confirm your password",
            validate: (value: string) =>
              value === watch("password") || "Passwords do not match",
          })}
          placeholder="Confirm Password"
          className="bg-white w-full px-3 py-2 border rounded-full mb-1"
        />
        {errors.confirm_password && (
          <p className="text-sm mb-3">
            {errors.confirm_password.message}
          </p>
        )}

        <button
          type="submit"
          className="custom_pill_box mb-5"
          style={{ width: "192px" }}
        >
          Join Now
        </button>
      </form>

      <GoogleOauth />

      <div className="mt-6 flex flex-row gap-2 p-2 rounded-full bg-[#fafafa] items-center">
        <p className="text-sm text-gray-500">
          Already have an account?
        </p>
        <button
          onClick={onSwitch}
          className="text-[#48ACC8] font-bold hover:underline cursor-pointer"
        >
          Login
        </button>
      </div>
    </div>
  );
}