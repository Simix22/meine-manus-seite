"use client";

import { useState, ChangeEvent, FormEvent, useEffect, useCallback } from 'react'; // Added useEffect, useCallback
import { useRouter } from 'next/navigation';
import { UserPlus, Mail, Lock, User as UserIcon, Camera, UploadCloud, CheckCircle, XCircle, Loader2 } from 'lucide-react'; // Added CheckCircle, XCircle, Loader2
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

// Debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => ReturnType<F>;
}

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [isUsernameChecking, setIsUsernameChecking] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);

  // Username validation rules (example)
  const MIN_USERNAME_LENGTH = 3;
  const MAX_USERNAME_LENGTH = 20;
  const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/; // Alphanumeric and underscores

  const checkUsernameAvailability = useCallback(async (currentUsername: string) => {
    if (!currentUsername || currentUsername.length < MIN_USERNAME_LENGTH) {
      setIsUsernameAvailable(null);
      setUsernameError(`Username must be at least ${MIN_USERNAME_LENGTH} characters.`);
      setIsUsernameChecking(false);
      return;
    }
    if (currentUsername.length > MAX_USERNAME_LENGTH) {
        setIsUsernameAvailable(false);
        setUsernameError(`Username must be no more than ${MAX_USERNAME_LENGTH} characters.`);
        setIsUsernameChecking(false);
        return;
    }
    if (!USERNAME_REGEX.test(currentUsername)) {
        setIsUsernameAvailable(false);
        setUsernameError('Username can only contain letters, numbers, and underscores.');
        setIsUsernameChecking(false);
        return;
    }

    setIsUsernameChecking(true);
    setUsernameError(null);
    setIsUsernameAvailable(null);

    try {
      const { data, error: dbError } = await supabase
        .from('profiles') // Assuming 'profiles' table
        .select('username')
        .eq('username', currentUsername)
        .single();

      if (dbError && dbError.code !== 'PGRST116') { // PGRST116: no rows found, which is good here
        setUsernameError('Error checking username. Please try again.');
        setIsUsernameAvailable(null);
      } else if (data) {
        setUsernameError('Username already taken.');
        setIsUsernameAvailable(false);
      } else {
        setUsernameError(null); // Clear previous error if any
        setIsUsernameAvailable(true);
      }
    } catch (e) {
      setUsernameError('Error checking username. Please try again.');
      setIsUsernameAvailable(null);
    }
    setIsUsernameChecking(false);
  }, [supabase]);

  const debouncedCheckUsername = useCallback(debounce(checkUsernameAvailability, 500), [checkUsernameAvailability]);

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    if (newUsername.trim() === '') {
        setUsernameError(null);
        setIsUsernameAvailable(null);
        setIsUsernameChecking(false);
        if (debouncedCheckUsername) {
            // Clear any pending debounce timeouts if username is cleared
            // This requires a more complex debounce that can be cancelled.
            // For simplicity, we rely on the check itself handling empty strings.
        }
        return;
    }
    debouncedCheckUsername(newUsername);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) { // Max 2MB
        setError('Profile picture must be less than 2MB.');
        setProfilePicture(null);
        setProfilePicturePreview(null);
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (PNG, JPG, GIF).');
        setProfilePicture(null);
        setProfilePicturePreview(null);
        return;
      }
      setProfilePicture(file);
      setProfilePicturePreview(URL.createObjectURL(file));
      setError(null); // Clear general form error
    }
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    
    if (!email || !password || !username) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!USERNAME_REGEX.test(username) || username.length < MIN_USERNAME_LENGTH || username.length > MAX_USERNAME_LENGTH) {
        setError('Please enter a valid username (3-20 characters, alphanumeric and underscores).');
        return;
    }
    if (isUsernameChecking) {
        setError('Please wait for username check to complete.');
        return;
    }
    if (isUsernameAvailable === false) {
        setError(usernameError || 'Username is not available.'); // Use specific username error if available
        return;
    }

    setLoading(true);

    // Final check for username availability before sign-up
    try {
        const { data: existingUser, error: dbError } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username)
          .single();
  
        if (dbError && dbError.code !== 'PGRST116') {
          setError(`Error confirming username: ${dbError.message}`);
          setLoading(false);
          return;
        }
        if (existingUser) {
          setError('This username has just been taken. Please choose another.');
          setIsUsernameAvailable(false); // Update state based on final check
          setUsernameError('Username already taken.');
          setLoading(false);
          return;
        }
      } catch (e) {
        setError('Error confirming username. Please try again.');
        setLoading(false);
        return;
      }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (!signUpData.user) {
        setError("Registration failed: No user data returned. Please try again.");
        setLoading(false);
        return;
    }

    let profilePictureUrl = null;
    if (profilePicture && signUpData.user) {
      const fileExt = profilePicture.name.split('.').pop();
      const fileName = `${signUpData.user.id}-${Date.now()}.${fileExt}`; // Add timestamp for uniqueness
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, profilePicture, { upsert: false }); // upsert: false to avoid overwriting by mistake here

      if (uploadError) {
        console.warn("Error uploading profile picture:", uploadError.message);
        // Not setting form error here, as registration itself was successful
      } else {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        profilePictureUrl = urlData.publicUrl;
      }
    }
    
    if (signUpData.user) {
        const { error: profileError } = await supabase
            .from('profiles') 
            .insert({
                id: signUpData.user.id, 
                username: username, 
                avatar_url: profilePictureUrl,
                email: signUpData.user.email // Store email for easier access if needed, though it's in auth.users
            });

        if (profileError) {
            console.warn("Error creating profile:", profileError.message);
            // If profile creation fails (e.g. username unique constraint), this is a critical issue.
            // Ideally, you'd want to inform the user more directly or even attempt to clean up the auth user.
            // For now, we proceed with the verification message, but this needs robust handling in production.
            // One common issue is if the RLS for profiles table doesn't allow insert for new users yet.
            setError(`Registration succeeded, but profile creation failed: ${profileError.message}. Please contact support.`);
            setLoading(false);
            return; // Stop here if profile creation fails critically
        }
    }

    setMessage('Registration successful! Please check your email to verify your account. You will be redirected to login shortly.');
    setLoading(false);
    
    setTimeout(() => {
      router.push('/login?message=verification_sent'); 
    }, 4000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-lg">
        <div>
          <UserPlus className="mx-auto h-12 w-auto text-purple-600" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
          {message && <p className="text-sm text-green-600 bg-green-100 p-3 rounded-md">{message}</p>}
          
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                className={`appearance-none block w-full px-3 py-3 pl-10 border rounded-md placeholder-gray-400 focus:outline-none sm:text-sm 
                            ${usernameError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                : isUsernameAvailable === true ? 'border-green-500 focus:ring-green-500 focus:border-green-500' 
                                : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'}`}
                placeholder="Choose a unique username"
                value={username}
                onChange={handleUsernameChange}
                disabled={loading}
                aria-describedby="username-status"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {isUsernameChecking && <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />}
                {!isUsernameChecking && isUsernameAvailable === true && <CheckCircle className="h-5 w-5 text-green-500" />}
                {!isUsernameChecking && isUsernameAvailable === false && username.length >= MIN_USERNAME_LENGTH && <XCircle className="h-5 w-5 text-red-500" />}
              </div>
            </div>
            {usernameError && <p id="username-status" className="mt-1 text-xs text-red-600">{usernameError}</p>}
            {!usernameError && isUsernameAvailable === true && <p id="username-status" className="mt-1 text-xs text-green-600">Username available!</p>}
             <p className="mt-1 text-xs text-gray-500">3-20 characters, letters, numbers, and underscores only.</p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none block w-full px-3 py-3 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none block w-full px-3 py-3 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters long.</p>
          </div>

          <div>
            <label htmlFor="profile-picture" className="block text-sm font-medium text-gray-700 mb-1">
              Profile Picture (Optional)
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <span className="inline-block h-16 w-16 rounded-full overflow-hidden bg-gray-100 border border-gray-300 flex items-center justify-center">
                {profilePicturePreview ? (
                  <img src={profilePicturePreview} alt="Profile preview" className="h-full w-full object-cover" />
                ) : (
                  <Camera className="h-8 w-8 text-gray-400" />
                )}
              </span>
              <label
                htmlFor="profile-picture-upload"
                className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center"
              >
                <UploadCloud size={18} className="mr-2 text-gray-500"/>
                <span>{profilePicture ? 'Change picture' : 'Upload picture'}</span>
                <input id="profile-picture-upload" name="profile-picture-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/gif" disabled={loading} />
              </label>
            </div>
            {profilePicture && <p className="mt-1 text-xs text-gray-500">Selected: {profilePicture.name}</p>}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || isUsernameChecking || isUsernameAvailable === false}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>
        <div className="mt-6">
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-purple-600 hover:text-purple-500">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

