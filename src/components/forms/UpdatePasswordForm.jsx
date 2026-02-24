import React, { useState } from 'react';
import { Logo, FormHeading } from '../Shared';
import Label from '../ui/Label';
import Input from '../ui/Input';
import Button from '../ui/button';
import { supabase } from '../lib/supabaseClient';
import Swal from 'sweetalert2';
import { EyeOff } from 'lucide-react';

const UpdatePasswordForm = ({ onPasswordUpdated }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    // Validations
    if (newPassword.length < 6) {
      Swal.fire({ icon: 'warning', title: 'Weak Password', text: 'Password must be at least 6 characters long.', confirmButtonColor: '#0057a8' });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({ icon: 'warning', title: 'Passwords Do Not Match', text: 'Please make sure both passwords are exactly the same.', confirmButtonColor: '#0057a8' });
      return;
    }

    setLoading(true);

    // Update the password in Supabase
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      Swal.fire({ icon: 'error', title: 'Update Failed', text: error.message, confirmButtonColor: '#0057a8' });
    } else {
      Swal.fire({ 
        icon: 'success', 
        title: 'Password Updated!', 
        text: 'Your password has been changed successfully. You can now sign in.', 
        confirmButtonColor: '#66b032' 
      });
      
      // Sign out the user from the temporary recovery session so they log in normally
      await supabase.auth.signOut();
      onPasswordUpdated(); // Switch view back to Sign In
    }

    setLoading(false);
  };

  return (
    <form className="flex flex-col h-full justify-center" onSubmit={handleUpdatePassword}>
      <Logo />
      <FormHeading title="Create New Password" />
      
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6 transition-colors duration-300">
        Please enter and confirm your new password below.
      </p>

      <div className="space-y-4 mb-6">
        <div>
          <Label htmlFor="newPassword">New Password</Label>
          <Input 
            id="newPassword" 
            type="password" 
            icon={EyeOff}
            placeholder="Enter new password" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input 
            id="confirmPassword" 
            type="password" 
            icon={EyeOff}
            placeholder="Re-enter new password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Updating Password...' : 'Update Password'}
      </Button>
    </form>
  );
};

export default UpdatePasswordForm;