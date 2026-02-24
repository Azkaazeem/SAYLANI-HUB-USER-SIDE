import React, { useState } from 'react';
import { Logo, FormHeading, AuthLinkText, SocialLoginGroup } from '../Shared';
import Label from '../ui/Label';
import Input from '../ui/Input';
import Button from '../ui/button';
import Checkbox from '../ui/Checkbox';
import Divider from '../ui/Divider';
import { EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const SignInForm = ({ onToggleMode, onForgotPassword }) => {
  // 1. Hook moved inside the component
  const navigate = useNavigate(); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      Swal.fire({ icon: 'warning', title: 'Missing Email', text: 'Please enter your email address.', confirmButtonColor: '#0057a8' });
      return;
    }
    if (!password) {
      Swal.fire({ icon: 'warning', title: 'Missing Password', text: 'Please enter your password.', confirmButtonColor: '#0057a8' });
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Swal.fire({ icon: 'error', title: 'Login Failed', text: error.message, confirmButtonColor: '#0057a8' });
    } else {
      Swal.fire({
        icon: 'success', 
        title: 'Login Successful!', 
        text: 'Welcome back to your account.',
        confirmButtonColor: '#66b032', 
        timer: 2000, 
        showConfirmButton: false
      });
      
      // 2. Fixed the typo here
      navigate('/'); 
    }
    
    setLoading(false);
  };

  return (
    <form className="flex flex-col h-full justify-center" onSubmit={handleSignIn}>
      <Logo />
      <FormHeading title="Welcome Back" />

      <div className="space-y-4 mb-4 mt-2">
        <div>
            <Label htmlFor="loginEmail">Email Address</Label>
            <Input id="loginEmail" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
            <Label htmlFor="loginPassword">Password</Label>
            <Input id="loginPassword" type="password" icon={EyeOff} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
      </div>

      <div className="flex items-center justify-between mb-5">
        <Checkbox id="rememberMe" label="Remember Me" />
        <button 
            type="button" 
            onClick={onForgotPassword}
            className="text-xs font-semibold text-primary-green hover:text-primary-blue dark:hover:text-white transition-colors"
        >
            Forgot Password?
        </button>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Signing In...' : 'Sign In'}
      </Button>
      
      <Divider />
      <SocialLoginGroup />

      <AuthLinkText text="Don't have an account?" linkText="Sign Up" onClick={onToggleMode} />
    </form>
  );
};

export default SignInForm;