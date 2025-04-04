import { useState } from "react";
import { UserIntroduction } from "@/components/onboarding/user-introduction";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/auth";
import { Separator } from "@/components/ui/separator";

const signupSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  username: z.string().min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and privacy policy"
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSuccess?: () => void;
  onToggleMode?: () => void;
}

export function SignupForm({ onSuccess, onToggleMode }: SignupFormProps) {
  const { register: authRegister } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });
  
  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    
    try {
      await authRegister({
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
      });
      
      toast({
        title: "Account created",
        description: "Welcome to ToastSoul Industries!",
        variant: "default",
      });
      
      setShowIntro(true);
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "There was an error creating your account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      {showIntro && (
        <UserIntroduction
          onComplete={() => {
            setShowIntro(false);
            if (onSuccess) {
              onSuccess();
            }
          }}
        />
      )}
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                  autoComplete="name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Choose a username"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="Enter your email"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder="Create a password"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="acceptTerms"
          render={({ field }) => (
            <FormItem className="flex items-start space-x-2 mt-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="terms"
                  disabled={isLoading}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  I agree to the{" "}
                  <a href="/terms" className="text-primary-600 hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-primary-600 hover:underline">
                    Privacy Policy
                  </a>
                </label>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full mt-6" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Sign up"}
        </Button>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="outline" type="button" disabled={isLoading} className="h-10">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064 5.963 5.963 0 014.123 1.632l2.917-2.917a10.027 10.027 0 100 14.634l-2.917-2.917a5.963 5.963 0 01-4.123 1.632 6.03 6.03 0 01-5.782-4.356h-2.242v3.821h2.242a10.036 10.036 0 1010.036-10.036z"
                fill="currentColor"
              />
            </svg>
            Google
          </Button>
          <Button variant="outline" type="button" disabled={isLoading} className="h-10">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                fill="currentColor"
              />
            </svg>
            GitHub
          </Button>
        </div>
      </div>
      
      {onToggleMode && (
        <div className="mt-6 text-center">
          <span className="text-sm text-gray-600">Already have an account?</span>
          <Button
            variant="link"
            onClick={onToggleMode}
            className="text-sm font-medium text-primary-600 ml-1 p-0 h-auto"
          >
            Log in
          </Button>
        </div>
      )}
    </Form>
    </>
  );
}
