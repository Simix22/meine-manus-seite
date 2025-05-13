"use client";

import { redirect } from "next/navigation";
import { useEffect, useState, ChangeEvent, FormEvent, useCallback } from "react";
import { ChevronDown, ChevronUp, Edit3, Lock, Image as ImageIcon, CreditCard, LogOut, User, Camera, Loader2, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

// Debounce function (copied from register page for username check)
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

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-4 bg-white shadow rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left font-semibold text-gray-700 hover:bg-gray-50 rounded-t-lg focus:outline-none"
      >
        <div className="flex items-center">
          {Icon && <Icon size={20} className="mr-3 text-purple-600" />}
          {title}
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};

export default function ProfilePage() {
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<{ username: string; avatar_url: string | null; email: string; id: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [isUsernameChecking, setIsUsernameChecking] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);

  const MIN_USERNAME_LENGTH = 3;
  const MAX_USERNAME_LENGTH = 20;
  const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

  const fetchUserProfile = useCallback(async (currentUser: SupabaseUser) => {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, email")
      .eq("id", currentUser.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      setFeedbackMessage({ type: "error", message: `Error fetching profile: ${profileError.message}` });
      setProfile(null);
    } else if (profileData) {
      setProfile(profileData as any);
      setNewUsername(profileData.username || "");
      setNewEmail(currentUser.email || ""); // Auth email is source of truth for display
      setProfilePicturePreview(profileData.avatar_url || null);
    } else {
        // Profile might not exist yet if registration flow was interrupted or if it's a new user
        // For now, we'll use the auth email and allow setting a username
        setNewEmail(currentUser.email || "");
        setFeedbackMessage({type: "info", message: "Complete your profile by setting a username."} as any)
    }
  }, [supabase]);

  useEffect(() => {
    const getSessionAndProfile = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        redirect("/login");
        return;
      }
      setUser(session.user);
      await fetchUserProfile(session.user);
      setLoading(false);
    };
    getSessionAndProfile();
  }, [supabase, fetchUserProfile]);

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
        setUsernameError("Username can only contain letters, numbers, and underscores.");
        setIsUsernameChecking(false);
        return;
    }
    // If username is the same as the current user's profile username, it's technically "available" for them
    if (profile && currentUsername === profile.username) {
        setIsUsernameAvailable(true);
        setUsernameError(null);
        setIsUsernameChecking(false);
        return;
    }

    setIsUsernameChecking(true);
    setUsernameError(null);
    setIsUsernameAvailable(null);
    try {
      const { data, error: dbError } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", currentUsername)
        .neq("id", user?.id) // Exclude current user's own username from check if it's different
        .single();
      if (dbError && dbError.code !== "PGRST116") {
        setUsernameError("Error checking username.");
        setIsUsernameAvailable(null);
      } else if (data) {
        setUsernameError("Username already taken.");
        setIsUsernameAvailable(false);
      } else {
        setIsUsernameAvailable(true);
        setUsernameError(null);
      }
    } catch (e) {
      setUsernameError("Error checking username.");
      setIsUsernameAvailable(null);
    }
    setIsUsernameChecking(false);
  }, [supabase, user?.id, profile]);

  const debouncedCheckUsername = useCallback(debounce(checkUsernameAvailability, 500), [checkUsernameAvailability]);

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const updatedUsername = e.target.value;
    setNewUsername(updatedUsername);
    if (updatedUsername.trim() === "") {
      setUsernameError(null);
      setIsUsernameAvailable(null);
      setIsUsernameChecking(false);
      return;
    }
    debouncedCheckUsername(updatedUsername);
  };

  const handleLogout = async () => {
    setFormLoading(true);
    await supabase.auth.signOut();
    setFormLoading(false);
    redirect("/login");
  };

  const handleProfileUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedbackMessage(null);
    setFormLoading(true);

    if (!user) {
      setFeedbackMessage({ type: "error", message: "User not found. Please log in again." });
      setFormLoading(false);
      return;
    }

    if (newUsername !== profile?.username) {
        if (!USERNAME_REGEX.test(newUsername) || newUsername.length < MIN_USERNAME_LENGTH || newUsername.length > MAX_USERNAME_LENGTH) {
            setFeedbackMessage({ type: "error", message: "Invalid username format or length." });
            setFormLoading(false);
            return;
        }
        if (isUsernameChecking) {
            setFeedbackMessage({ type: "error", message: "Please wait for username check to complete." });
            setFormLoading(false);
            return;
        }
        if (isUsernameAvailable === false && newUsername !== profile?.username) {
            setFeedbackMessage({ type: "error", message: usernameError || "Username is not available." });
            setFormLoading(false);
            return;
        }
    }

    // Update username in profiles table
    if (newUsername !== profile?.username || !profile) { // Update if changed or if profile didn't exist
        const { error: profileUpdateError } = await supabase
            .from("profiles")
            .upsert({ id: user.id, username: newUsername, email: user.email }, { onConflict: 'id' }); // Use upsert
        if (profileUpdateError) {
            setFeedbackMessage({ type: "error", message: `Failed to update username: ${profileUpdateError.message}` });
            setFormLoading(false);
            return;
        }
    }

    // Update email in Supabase Auth (triggers verification email)
    if (newEmail !== user.email) {
      const { error: emailUpdateError } = await supabase.auth.updateUser({ email: newEmail });
      if (emailUpdateError) {
        setFeedbackMessage({ type: "error", message: `Failed to update email: ${emailUpdateError.message}` });
        setFormLoading(false);
        return;
      }
      setFeedbackMessage({ type: "success", message: "Profile details updated. Please check your new email address for a verification link." });
    } else {
      setFeedbackMessage({ type: "success", message: "Profile details updated successfully!" });
    }
    
    await fetchUserProfile(user); // Refresh profile data
    setFormLoading(false);
  };

  const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedbackMessage(null);
    setFormLoading(true);

    if (!user || !user.email) {
      setFeedbackMessage({ type: "error", message: "User not found or email is missing. Please log in again." });
      setFormLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setFeedbackMessage({ type: "error", message: "New passwords do not match." });
      setFormLoading(false);
      return;
    }
    if (!currentPassword || !newPassword) {
        setFeedbackMessage({ type: "error", message: "All password fields are required." });
        setFormLoading(false);
        return;
    }
    if (newPassword.length < 6) {
        setFeedbackMessage({ type: "error", message: "New password must be at least 6 characters long." });
        setFormLoading(false);
        return;
    }

    // Step 1: Verify current password by trying to sign in with it
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email, // Use the current user's email
      password: currentPassword,
    });

    if (signInError) {
      setFeedbackMessage({ type: "error", message: "Incorrect current password. Please try again." });
      setFormLoading(false);
      return;
    }

    // Step 2: If current password is correct, update to the new password
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    
    setFormLoading(false);
    if (updateError) {
      setFeedbackMessage({ type: "error", message: `Failed to change password: ${updateError.message}` });
    } else {
      setFeedbackMessage({ type: "success", message: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
  };

  const handleProfilePictureFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) { // Max 2MB
        setFeedbackMessage({type: "error", message: "Profile picture must be less than 2MB."});
        setProfilePictureFile(null);
        setProfilePicturePreview(profile?.avatar_url || null); // Revert to old preview
        return;
      }
      if (!file.type.startsWith("image/")){
        setFeedbackMessage({type: "error", message: "Please select an image file."});
        setProfilePictureFile(null);
        setProfilePicturePreview(profile?.avatar_url || null); // Revert to old preview
        return;
      }
      setProfilePictureFile(file);
      setProfilePicturePreview(URL.createObjectURL(file));
      setFeedbackMessage(null);
    }
  };

  const handleProfilePictureUpload = async () => {
    if (!profilePictureFile || !user) {
      setFeedbackMessage({ type: "error", message: "Please select a picture first." });
      return;
    }
    setFeedbackMessage(null);
    setFormLoading(true);

    const fileExt = profilePictureFile.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, profilePictureFile, { upsert: true }); // Upsert to replace if exists for this user

    if (uploadError) {
      setFeedbackMessage({ type: "error", message: `Failed to upload picture: ${uploadError.message}` });
      setFormLoading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const newAvatarUrl = urlData.publicUrl;

    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({ avatar_url: newAvatarUrl })
      .eq("id", user.id);

    setFormLoading(false);
    if (profileUpdateError) {
      setFeedbackMessage({ type: "error", message: `Failed to update profile with new picture: ${profileUpdateError.message}` });
    } else {
      setFeedbackMessage({ type: "success", message: "Profile picture updated!" });
      setProfilePicturePreview(newAvatarUrl);
      setProfilePictureFile(null); // Clear the file input state
      if (profile) setProfile({...profile, avatar_url: newAvatarUrl});
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><Loader2 className="h-12 w-12 animate-spin text-purple-600" /> <p className="ml-4 text-lg">Loading profile...</p></div>;
  }

  if (!user || !profile) { // If profile is null after loading, it might be an error or new user state handled by fetchUserProfile
      if (!loading && !user) redirect("/login"); // Should be caught by middleware, but as a fallback
      // If user exists but profile is null and not loading, it means fetchUserProfile might have an issue or it's a new user without a profile row yet.
      // The form should still render to allow creating/setting username.
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 sm:py-12 pb-24 sm:pb-12">
      <div className="container mx-auto max-w-lg px-4">
        <div className="text-center mb-8">
          <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-purple-500 bg-gray-200 flex items-center justify-center group">
            {profilePicturePreview ? (
              <Image src={profilePicturePreview} alt="Profile" width={128} height={128} className="w-full h-full object-cover" unoptimized={profilePicturePreview.startsWith("blob:")}/>
            ) : (
              <ImageIcon size={64} className="text-gray-400" />
            )}
            <label htmlFor="profilePictureInput" className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera size={32} />
            </label>
          </div>
          <input type="file" id="profilePictureInput" accept="image/*" onChange={handleProfilePictureFileChange} className="hidden" disabled={formLoading} />
          {profilePictureFile && (
            <button onClick={handleProfilePictureUpload} className="mt-2 text-sm bg-purple-500 text-white py-1.5 px-4 rounded-md hover:bg-purple-600 disabled:bg-gray-400" disabled={formLoading || !profilePictureFile}>
              {formLoading && profilePictureFile ? <Loader2 className="animate-spin h-4 w-4 mr-2 inline" /> : null} Upload New Picture
            </button>
          )}
          <h1 className="text-3xl font-bold text-gray-800 mt-2">{profile?.username || user?.email || "User"}</h1>
          <p className="text-gray-600">{user?.email}</p>
        </div>

        {feedbackMessage && (
          <div className={`p-3 mb-4 rounded-md text-sm ${feedbackMessage.type === "success" ? "bg-green-100 text-green-700" : feedbackMessage.type === "error" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
            {feedbackMessage.message}
          </div>
        )}

        <CollapsibleSection title="Edit Profile Details" icon={Edit3} defaultOpen={true}>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div>
              <label htmlFor="usernameEdit" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input type="text" name="usernameEdit" id="usernameEdit" value={newUsername} onChange={handleUsernameChange} 
                  className={`w-full p-3 border rounded-md shadow-sm focus:outline-none sm:text-sm 
                              ${usernameError && newUsername !== profile?.username ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
                                  : isUsernameAvailable === true && newUsername !== profile?.username ? "border-green-500 focus:ring-green-500 focus:border-green-500" 
                                  : "border-gray-300 focus:ring-purple-500 focus:border-purple-500"}`}
                  placeholder="Enter your username" disabled={formLoading} aria-describedby="username-edit-status" />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {isUsernameChecking && <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />}
                  {!isUsernameChecking && isUsernameAvailable === true && newUsername !== profile?.username && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {!isUsernameChecking && isUsernameAvailable === false && newUsername !== profile?.username && newUsername.length >= MIN_USERNAME_LENGTH && <XCircle className="h-5 w-5 text-red-500" />}
                </div>
              </div>
              {usernameError && newUsername !== profile?.username && <p id="username-edit-status" className="mt-1 text-xs text-red-600">{usernameError}</p>}
              {!usernameError && isUsernameAvailable === true && newUsername !== profile?.username && <p id="username-edit-status" className="mt-1 text-xs text-green-600">Username available!</p>}
              <p className="mt-1 text-xs text-gray-500">3-20 characters, letters, numbers, and underscores only.</p>
            </div>
            <div>
              <label htmlFor="emailEdit" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" name="emailEdit" id="emailEdit" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500" placeholder="Enter your email" disabled={formLoading} />
              <p className="mt-1 text-xs text-gray-500">Changing email will require re-verification.</p>
            </div>
            <button type="submit" className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 font-semibold disabled:bg-gray-400" disabled={formLoading || isUsernameChecking || (isUsernameAvailable === false && newUsername !== profile?.username)}>
              {formLoading ? <Loader2 className="animate-spin h-5 w-5 mr-2 inline" /> : null} Save Profile Details
            </button>
          </form>
        </CollapsibleSection>

        <CollapsibleSection title="Change Password" icon={Lock}>
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <label htmlFor="currentPassword">Current Password</label>
              <input type="password" name="currentPassword" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md shadow-sm mt-1 focus:ring-purple-500 focus:border-purple-500" placeholder="Current Password" required disabled={formLoading}/>
            </div>
            <div>
              <label htmlFor="newPassword">New Password</label>
              <input type="password" name="newPassword" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md shadow-sm mt-1 focus:ring-purple-500 focus:border-purple-500" placeholder="New Password (min. 6 characters)" required disabled={formLoading} minLength={6}/>
            </div>
            <div>
              <label htmlFor="confirmNewPassword">Confirm New Password</label>
              <input type="password" name="confirmNewPassword" id="confirmNewPassword" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md shadow-sm mt-1 focus:ring-purple-500 focus:border-purple-500" placeholder="Confirm New Password" required disabled={formLoading} minLength={6}/>
            </div>
            <button type="submit" className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 font-semibold disabled:bg-gray-400" disabled={formLoading}>
             {formLoading ? <Loader2 className="animate-spin h-5 w-5 mr-2 inline" /> : null} Change Password
            </button>
          </form>
        </CollapsibleSection>
        
        <CollapsibleSection title="Account Information" icon={User}>
          <div className="space-y-4">
            <div>
              <h3 className="text-md font-semibold text-gray-700 mb-1">Credit Balance</h3>
              {/* Placeholder for credit balance - to be fetched from Supabase later */}
              <p className="text-lg text-gray-800">You have 120 Credits (placeholder)</p>
            </div>
            <div>
              <h3 className="text-md font-semibold text-gray-700 mb-1">Billing</h3>
              <a href="https://billing.stripe.com/p/test_12345" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 font-semibold">
                <CreditCard size={20} className="mr-2" /> Manage Billing & Payment
              </a>
            </div>
          </div>
        </CollapsibleSection>

        <div className="mt-8">
          <button onClick={handleLogout} className="w-full flex items-center justify-center bg-red-500 text-white py-3 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 font-semibold disabled:bg-gray-400" disabled={formLoading}>
            {formLoading ? <Loader2 className="animate-spin h-5 w-5 mr-2 inline" /> : null} <LogOut size={20} className="mr-2" /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}
