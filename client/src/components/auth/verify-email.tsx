
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        if (!token) {
          setStatus('error');
          return;
        }
        
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        if (response.ok) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (error) {
        setStatus('error');
      }
    };
    
    verifyEmail();
  }, [searchParams]);
  
  return (
    <div className="container max-w-md mx-auto mt-12 p-4">
      {status === 'loading' && (
        <Alert>
          <AlertTitle>Verifying your email</AlertTitle>
          <AlertDescription>Please wait while we verify your email address...</AlertDescription>
        </Alert>
      )}
      
      {status === 'success' && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Email verified!</AlertTitle>
          <AlertDescription>
            Your email has been verified successfully.
            <Button variant="link" onClick={() => navigate('/')} className="pl-0">
              Return to homepage
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {status === 'error' && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Verification failed</AlertTitle>
          <AlertDescription>
            The verification link is invalid or has expired.
            <Button variant="link" onClick={() => navigate('/')} className="pl-0">
              Return to homepage
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
