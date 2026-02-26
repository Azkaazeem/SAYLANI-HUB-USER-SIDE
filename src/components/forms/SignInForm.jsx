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
  const navigate = useNavigate(); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Yeh wo main function hai jiske andar saara logic hona chahiye
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

    // 1. Supabase mein login attempt
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Swal.fire({ icon: 'error', title: 'Login Failed', text: error.message, confirmButtonColor: '#0057a8' });
      setLoading(false);
    } else {
      // 2. Profile se role check karna
      const { data: profileData } = await supabase
        .from('smit_hub_profiles') // Agar aapki table ka naam alag hai to yahan change karein
        .select('role')
        .eq('id', data.user.id)
        .single();

      // 3. Admin verify karna (Database role ya hardcoded email se)
      const isAdmin = (profileData && profileData.role === 'admin') || data.user.email === 'admin@gmail.com';

      if (isAdmin) {
        // Admin ke liye success popup aur seedha /admin par redirect
        Swal.fire({
          icon: 'success', 
          title: 'Admin Login', 
          text: 'Welcome to Admin Dashboard',
          confirmButtonColor: '#66b032', 
          timer: 1000, 
          showConfirmButton: false
        }).then(() => {
          navigate('/admin'); 
        });
      } else {
        // Normal user ke liye success popup aur Home (/) par redirect
        Swal.fire({
          icon: 'success', 
          title: 'Login Successful!', 
          text: 'Welcome back!',
          confirmButtonColor: '#66b032', 
          timer: 1000, 
          showConfirmButton: false
        }).then(() => {
          navigate('/'); 
        });
      }
    }
  };

  return (
    <form className="flex flex-col h-full justify-center" onSubmit={handleSignIn}>
      <Logo />
      <FormHeading title="Welcome Back" />

      <div className="space-y-4 mb-4 mt-2">
        <div>
            <Label htmlFor="loginEmail">Email Address</Label>
            <Input id="loginEmail" type="email" placeholder="Enter Your Email" value={email} onChange={(e) => setEmail(e.target.value)} />
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