import React, { useState } from 'react';
import { Logo, FormHeading } from '../Shared';
import Label from '../ui/Label';
import Input from '../ui/Input';
import Button from '../ui/button';
import { supabase } from '../lib/supabaseClient';
import Swal from 'sweetalert2';
import { ArrowLeft } from 'lucide-react';

const ForgotPasswordForm = ({ onBackToSignIn }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Email',
        text: 'Please enter your email address to reset your password.',
        confirmButtonColor: '#0057a8'
      });
      return;
    }

    setLoading(true);

    // Send reset password email via Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin, // Redirects back to your app after they click the link
    });

    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Send',
        text: error.message,
        confirmButtonColor: '#0057a8'
      });
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Email Sent!',
        text: 'Check your inbox for the password reset link.',
        confirmButtonColor: '#66b032'
      });
      setEmail('');
    }

    setLoading(false);
  };

  return (
    <form className="flex flex-col h-full justify-center" onSubmit={handleResetPassword}>
      <Logo />
      <FormHeading title="Reset Password" />
      
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6 transition-colors duration-300">
        Enter your email address and we will send you a link to reset your password.
      </p>

      <div className="mb-6">
        <Label htmlFor="resetEmail">Email Address</Label>
        <Input 
          id="resetEmail" 
          type="email" 
          placeholder="john@example.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Sending Link...' : 'Send Reset Link'}
      </Button>

      <div className="mt-6 flex justify-center">
        <button 
          type="button" 
          onClick={onBackToSignIn}
          className="flex items-center text-sm font-semibold text-primary-green hover:text-primary-blue dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Sign In
        </button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;