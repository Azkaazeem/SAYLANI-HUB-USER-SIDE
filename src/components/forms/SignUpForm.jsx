import React, { useState } from 'react';
import { Logo, FormHeading, AuthLinkText, SocialLoginGroup } from '../Shared';
import Label from '../ui/Label';
import Input from '../ui/Input';
import FileUpload from '../ui/FileUpload';
import Button from '../ui/button';
import Divider from '../ui/Divider';
import { EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const SignUpForm = ({ onToggleMode }) => {
  // 1. Hook moved inside the component
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', dob: '', address: '', password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Immediate Image Upload Logic
  const handleImmediateUpload = async (file) => {
      const fileExt = file.name.split('.').pop();
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `profile-pics/${uniqueFileName}`;

      const { data, error } = await supabase.storage
          .from('smit-hub-avatars') 
          .upload(filePath, file);

      if (error) {
          Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: error.message,
            confirmButtonColor: '#0057a8'
          });
          return;
      }

      const { data: urlData } = supabase.storage
          .from('smit-hub-avatars')
          .getPublicUrl(filePath);

      setUploadedImageUrl(urlData.publicUrl);
      
      Swal.fire({
        icon: 'success',
        title: 'Image Uploaded!',
        text: 'Your profile picture looks great.',
        timer: 2000,
        showConfirmButton: false
      });
  };
  
  // Sign Up and Database Insert Logic
  const handleSignUp = async (e) => {
      e.preventDefault();

      // Form Validation using SweetAlert
      if (!uploadedImageUrl) {
        Swal.fire({ icon: 'warning', title: 'Missing Profile Picture', text: 'Please upload a profile picture before signing up.', confirmButtonColor: '#0057a8' });
        return;
      }
      if (!formData.fullName.trim()) {
        Swal.fire({ icon: 'warning', title: 'Missing Full Name', text: 'Please enter your full name.', confirmButtonColor: '#0057a8' });
        return;
      }
      if (!formData.email.trim()) {
        Swal.fire({ icon: 'warning', title: 'Missing Email', text: 'Please enter your email address.', confirmButtonColor: '#0057a8' });
        return;
      }
      if (!formData.phone.trim()) {
        Swal.fire({ icon: 'warning', title: 'Missing Phone Number', text: 'Please enter your phone number.', confirmButtonColor: '#0057a8' });
        return;
      }
      if (!formData.dob) {
        Swal.fire({ icon: 'warning', title: 'Missing Date of Birth', text: 'Please select your date of birth.', confirmButtonColor: '#0057a8' });
        return;
      }
      if (!formData.address.trim()) {
        Swal.fire({ icon: 'warning', title: 'Missing Address', text: 'Please enter your full address.', confirmButtonColor: '#0057a8' });
        return;
      }
      if (!formData.password || formData.password.length < 6) {
        Swal.fire({ icon: 'warning', title: 'Invalid Password', text: 'Your password must be at least 6 characters long.', confirmButtonColor: '#0057a8' });
        return;
      }

      setLoading(true);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        Swal.fire({ icon: 'error', title: 'Sign Up Failed', text: authError.message, confirmButtonColor: '#0057a8' });
        setLoading(false);
        return;
      }

      const userId = authData.user.id;

      const { error: dbError } = await supabase
        .from('smit_hub_profiles')
        .insert([
            {
                id: userId,
                full_name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                dob: formData.dob || null, 
                address: formData.address,
                profile_image_url: uploadedImageUrl 
            }
        ]);

      if (dbError) {
        Swal.fire({ icon: 'warning', title: 'Partial Success', text: "Account created, but failed to save profile data: " + dbError.message, confirmButtonColor: '#0057a8' });
      } else {
        Swal.fire({
            icon: 'success',
            title: 'Account Created!',
            text: 'Welcome to the community.',
            confirmButtonColor: '#66b032',
            timer: 2000,
            showConfirmButton: false
        });
        
        setFormData({ fullName: '', email: '', phone: '', dob: '', address: '', password: '' });
        setUploadedImageUrl(null);
        
        // 2. Redirect user to the home page after successful sign up
        navigate('/');
      }
      
      setLoading(false);
  };

  return (
    <form className="h-full flex flex-col justify-center" onSubmit={handleSignUp}>
      <Logo />
      <FormHeading title="Join Our Community" />

      <FileUpload 
        label="Click to upload picture" 
        onUploadComplete={handleImmediateUpload} 
        previewUrl={uploadedImageUrl} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" placeholder="John Doe" value={formData.fullName} onChange={handleChange} />
        </div>
        <div>
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} />
        </div>
        <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" placeholder="+1 234 567 890" value={formData.phone} onChange={handleChange} />
        </div>
        <div>
            <Label htmlFor="dob">Date of Birth</Label>
            <Input id="dob" type="date" value={formData.dob} onChange={handleChange} />
        </div>
      </div>

      <div className="mb-3">
        <Label htmlFor="address">Address</Label>
        <Input id="address" placeholder="Your full address" value={formData.address} onChange={handleChange} />
      </div>

      <div className="mb-4">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" icon={EyeOff} placeholder="Create a password" value={formData.password} onChange={handleChange} />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>
      
      <Divider />
      <SocialLoginGroup />

      <AuthLinkText text="Already have an account?" linkText="Sign In" onClick={onToggleMode} />
    </form>
  );
};

export default SignUpForm;