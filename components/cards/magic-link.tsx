"use client";
import React, { useState, FormEvent } from 'react';
import { Card, CardFooter, CardHeader, CardDescription, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from '../ui/button';
import { Label } from "../ui/label";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { registerUser } from '@/services/auth';
import { useRouter } from 'next/navigation';

interface LoginResult {
  access_token: string;
  // Add other properties if the result contains more
}

export default function MagicCard({magic_token} : {magic_token : string}): JSX.Element {
  const router = useRouter()
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      // Note: We're using the handleLogin function here, which expects an email.
      // You might need to modify this to work with a username instead, or pass the email from the URL.
      const result = await registerUser(username, password, magic_token);
      console.log(result)
      if (result.success) {
        setSuccess('Account created successfully!');
        router.push("/")
        // You might want to redirect the user or update the UI here
      } else {
        setError('Failed to create account');
      }
    } catch (err) {
      setError((err as Error).message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-[350px] mx-auto text-white">
      <CardHeader className="items-center text-center">
        <CardDescription className="text-sm">Complete your registration to start fighting.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="default">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="0xNone"
              className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-2 focus:ring-white"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-2 focus:ring-white"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-2 focus:ring-white"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-white text-indigo-600 hover:bg-white/90 transition-colors"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}