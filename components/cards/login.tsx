"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
import { handleLogin, handleRegister, validateEmail } from "@/services/auth";
import { useRouter } from "next/navigation";
import { useToast } from "../ui/use-toast";
import { CheckMarkIcon } from "@/assets/svg/chackmark";


type ProviderComponent = React.ComponentType<{ onLogin: () => void }>;

interface LoginCardProps {
  providers?: {
    [key: string]: ProviderComponent;
  };
}

enum AuthState {
  REGISTER = "register",
  LOGIN = "login",
  BEGIN = "begin"
}


const EmailVerificationCard = ({ email } : { email : string }) => {
  
  const {toast} = useToast()
  const [isDisabled, setIsDisabled] = useState(false);

  const handleResendClick = async () => {
    if(!isDisabled){
      // Disable the button
      setIsDisabled(true);

      // Simulate sending the email
      // You would actually call your API here to resend the email
      const response = await handleRegister(email)
        if (response.success){
          toast({
            description: <div className="flex flex-col"><CheckMarkIcon className="w-5 h-5"/> <div>{`email successfully sent to user`}</div></div>,
          })
        } else {
          toast({
            description: <div className="flex flex-col"> <div>{`failed to send verification email`}</div></div>,
          })
        }

      // Re-enable the button after 10 seconds
      setTimeout(() => {
        setIsDisabled(false);
      }, 10000);
    }
  };

  return (<Card className="w-full max-w-[350px] mx-auto">
    <CardHeader className="items-center">
      <CardTitle>Verify Your Email</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="text-center">
        <p>To continue, click the link sent to</p>
        <p className="font-semibold">{email}</p>
      </div>
    </CardContent>
    <CardFooter className="flex-col space-y-2">
      <p className="text-sm text-muted-foreground">Not seeing the email in your inbox?</p>
      <Button variant="outline" className="w-full" onClick={handleResendClick} disabled={isDisabled}>Try sending again</Button>
    </CardFooter>
  </Card>);
}

export function LoginCard({ providers = {} }: LoginCardProps) {
  
  const {toast} = useToast()

  const handleProviderLogin = (provider: string) => {
    console.log(provider);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const [authState, setAuthState] = useState<AuthState>(AuthState.BEGIN);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter()

  const handleEmailSignIn = async () => {
    setErrorMessage(null);
    if (authState === AuthState.LOGIN) {
      const response = await handleLogin(email, password);
      if (response.success) {
        // Handle successful login (e.g., redirect or update UI)
        router.push("/")
      } else {
        setErrorMessage("Login failed. Please try again.");
      }
    } else if (authState === AuthState.BEGIN) {
      const valid = await validateEmail(email);
      console.log(valid)
      if (valid.data?.success) {
        toast({
          // title: "Email Validated",
          description: <div className="flex flex-col"><CheckMarkIcon className="w-5 h-5"/> <div>{`email provided was valid email`}</div></div>,
        })
        setAuthState(AuthState.LOGIN)
      } else {
        // validate email
        const response = await handleRegister(email)
        if (response.success){
          toast({
            description: <div className="flex flex-col"><CheckMarkIcon className="w-5 h-5"/> <div>{`email successfully sent to user`}</div></div>,
          })
        } else {
          toast({
            description: <div className="flex flex-col"> <div>{`failed to send verification email`}</div></div>,
          })
          setErrorMessage(response.data?.message || "something happened")
          setAuthState(AuthState.BEGIN)
        }
        setAuthState(AuthState.REGISTER)
      }
    }
  }

  return (
    <Card className="w-full max-w-[350px] mx-auto">
    { (authState === AuthState.BEGIN || authState === AuthState.LOGIN) && <>
      <CardHeader className="items-center">
        <CardDescription className="text-sm sm:text-sm">Join the fight, enter the arena today.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
      { authState === AuthState.BEGIN && <>
        {Object.entries(providers).length > 0 && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {Object.entries(providers).map(([name, ProviderComponent]) => (
                <ProviderComponent 
                  key={name} 
                  onLogin={() => handleProviderLogin(name)} 
                />
              ))}
            </div>
          </>
        )}

        <div className="space-y-2">
          <Input id="email" type="email" placeholder="name@yourcompany.com" className="w-full" value={email} onChange={handleEmailChange} />
        </div></>}
        
        {authState === AuthState.LOGIN && <>
          <div className="space-y-2">
          <Input id="password" type="password" placeholder="*************" className="w-full" value={password} onChange={handlePasswordChange} />
        </div>
        </>}
      

      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleEmailSignIn}>
          Continue with email
        </Button>
      </CardFooter>
      {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}
      </>}
      {authState === AuthState.REGISTER && <EmailVerificationCard email={email}/>}

    </Card>
  );
}