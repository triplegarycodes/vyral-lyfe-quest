import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
const SignInScreen = ({ onSignIn }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!signInData.email || !signInData.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Welcome back to Vyral!");
        onSignIn();
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!signUpData.name || !signUpData.email || !signUpData.password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (signUpData.password !== signUpData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (signUpData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: signUpData.name,
            username: signUpData.email.split("@")[0]
          }
        }
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created! Check your email to verify your account.");
        onSignIn();
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsx("div", { className: "text-center mb-8", children: /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-3 mb-4", children: [
      /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-gradient-to-r from-primary to-primary-glow rounded-xl flex items-center justify-center", children: /* @__PURE__ */ jsx(Zap, { className: "w-7 h-7 text-white" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold vyral-text-glow", children: "Vyral" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Level up in life, make it vyral" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Card, { className: "vyral-card", children: /* @__PURE__ */ jsxs(Tabs, { defaultValue: "signin", className: "w-full", children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "grid w-full grid-cols-2 mb-6", children: [
        /* @__PURE__ */ jsx(TabsTrigger, { value: "signin", children: "Sign In" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "signup", children: "Sign Up" })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "signin", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSignIn, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "signin-email", children: "Email" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "signin-email",
              type: "email",
              placeholder: "Enter your email",
              value: signInData.email,
              onChange: (e) => setSignInData((prev) => ({ ...prev, email: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "signin-password", children: "Password" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "signin-password",
                type: showPassword ? "text" : "password",
                placeholder: "Enter your password",
                value: signInData.password,
                onChange: (e) => setSignInData((prev) => ({ ...prev, password: e.target.value }))
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "button",
                variant: "ghost",
                size: "sm",
                className: "absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0",
                onClick: () => setShowPassword(!showPassword),
                children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full vyral-button-primary", disabled: loading, children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }),
          "Signing In..."
        ] }) : "Sign In" })
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "signup", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSignUp, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "signup-name", children: "Full Name" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "signup-name",
              type: "text",
              placeholder: "Enter your full name",
              value: signUpData.name,
              onChange: (e) => setSignUpData((prev) => ({ ...prev, name: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "signup-email", children: "Email" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "signup-email",
              type: "email",
              placeholder: "Enter your email",
              value: signUpData.email,
              onChange: (e) => setSignUpData((prev) => ({ ...prev, email: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "signup-password", children: "Password" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "signup-password",
              type: showPassword ? "text" : "password",
              placeholder: "Create a password",
              value: signUpData.password,
              onChange: (e) => setSignUpData((prev) => ({ ...prev, password: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "confirm-password", children: "Confirm Password" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "confirm-password",
                type: showPassword ? "text" : "password",
                placeholder: "Confirm your password",
                value: signUpData.confirmPassword,
                onChange: (e) => setSignUpData((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "button",
                variant: "ghost",
                size: "sm",
                className: "absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0",
                onClick: () => setShowPassword(!showPassword),
                children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full vyral-button-primary", disabled: loading, children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }),
          "Creating Account..."
        ] }) : "Create Account" })
      ] }) })
    ] }) })
  ] }) });
};
var SignInScreen_default = SignInScreen;
export {
  SignInScreen_default as default
};
