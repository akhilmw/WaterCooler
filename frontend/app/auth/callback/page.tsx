"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/auth?error=' + encodeURIComponent(error.message));
          return;
        }

        if (data.session) {
          // Successful authentication - redirect to profile
          router.push('/profile');
        } else {
          // No session found - redirect to auth
          router.push('/auth');
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        router.push('/auth?error=An unexpected error occurred');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="text-gray-600 text-lg">Completing authentication...</div>
      </div>
    </div>
  );
}

