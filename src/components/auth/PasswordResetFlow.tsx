import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ChevronLeft, AlertCircle, CheckCircle, Info, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-8d51d9e2`;

interface PasswordResetFlowProps {
  onBack: () => void;
}

export function PasswordResetFlow({ onBack }: PasswordResetFlowProps) {
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('🔍 Checking if email exists:', email);
      
      // Check if email exists
      const response = await fetch(`${SERVER_URL}/auth/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check email');
      }

      if (!data.exists) {
        throw new Error('No account found with this email address. Please check your email or register for a new account.');
      }

      // Email exists, move to password step
      console.log('✅ Email verified, proceeding to password reset');
      setStep('password');
    } catch (err: any) {
      console.error('❌ Email check error:', err);
      setError(err.message || 'Failed to verify email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔑 Updating password for:', email);
      
      // Update password directly
      const response = await fetch(`${SERVER_URL}/auth/update-password-direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      console.log('✅ Password reset successful');
      setSuccess(true);
    } catch (err: any) {
      console.error('❌ Password reset error:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              {step === 'email' 
                ? 'Enter your email address to reset your password'
                : 'Create a new password for your account'
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!success ? (
              <>
                {step === 'email' ? (
                  <form onSubmit={handleCheckEmail} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-900 text-sm">
                        <strong>Quick Password Reset</strong>
                        <p className="mt-1">
                          No email required! Enter your email to reset your password instantly.
                        </p>
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email Address</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        autoComplete="email"
                        autoFocus
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                        className="flex items-center gap-2"
                        disabled={isLoading}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                      </Button>

                      <Button
                        type="submit"
                        disabled={!email || isLoading}
                        className="flex-1"
                      >
                        {isLoading ? 'Checking...' : 'Continue'}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-900 text-sm">
                        <strong>Email Verified: {email}</strong>
                        <p className="mt-1">Now create a new password for your account.</p>
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                        autoFocus
                        required
                        disabled={isLoading}
                        minLength={6}
                      />
                      <p className="text-xs text-muted-foreground">
                        Password must be at least 6 characters
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                        required
                        disabled={isLoading}
                        minLength={6}
                      />
                    </div>

                    <Alert className="bg-amber-50 border-amber-200">
                      <Shield className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-900 text-xs">
                        <strong>Security Note:</strong> After resetting your password, you'll need to log in with your new credentials.
                      </AlertDescription>
                    </Alert>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setStep('email');
                          setNewPassword('');
                          setConfirmPassword('');
                          setError('');
                        }}
                        className="flex items-center gap-2"
                        disabled={isLoading}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                      </Button>

                      <Button
                        type="submit"
                        disabled={!newPassword || !confirmPassword || isLoading}
                        className="flex-1"
                      >
                        {isLoading ? 'Updating...' : 'Reset Password'}
                      </Button>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-900">
                    <strong>Password Reset Successfully!</strong>
                    <p className="mt-2">
                      Your password has been updated. You can now log in with your new password.
                    </p>
                  </AlertDescription>
                </Alert>

                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="text-sm space-y-2">
                    <p><strong>Next Steps:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 ml-1">
                      <li>Click "Back to Login" below</li>
                      <li>Enter your email: <strong>{email}</strong></li>
                      <li>Use your new password to log in</li>
                    </ol>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={onBack}
                    className="flex-1"
                  >
                    Back to Login
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Help */}
        {!success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Remember your password?{' '}
              <button
                onClick={onBack}
                className="text-primary hover:underline font-medium"
              >
                Back to Login
              </button>
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
