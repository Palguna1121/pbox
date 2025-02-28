import React from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { Button } from "./ui/button";
const SignInNavButton = () => {
  const handleSignIn = () => {
    window.location.href = "/login";
  };
  const { data: session } = useSession();
  return (
    <>
      {session?.user ? (
        <Button onClick={() => confirm("Anda yakin ingin keluar?") && signOut()} variant={"destructive"}>
          Logout
        </Button>
      ) : (
        <Button onClick={handleSignIn} variant="outline">
          Sign in
        </Button>
      )}
    </>
  );
};

export default SignInNavButton;
