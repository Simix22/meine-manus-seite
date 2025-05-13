// app/profile/page.tsx
"use client";

import { redirect } from 'next/navigation';
import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { ChevronDown, ChevronUp, Edit3, Mail, Lock, Image as ImageIcon, CreditCard, LogOut, User, Camera } from 'lucide-react';

// Mock function to simulate checking Supabase session
const getMockSessionClient = async () => {
  await new Promise(resolve => setTimeout(resolve, 50));
  const sessionData = typeof window !== "undefined" ? localStorage.getItem("mockSession") : null;
  if (sessionData) return JSON.parse(sessionData);
  // Default to logged in for easier testing during development of this page
  const defaultSession = { user: { id: '123', email: 'user@example.com', username: 'TestUser', profile_picture_url: null } }; 
  if (typeof window !== "undefined") localStorage.setItem("mockSession", JSON.stringify(defaultSession));
  return defaultSession;
};

// Mock function to simulate Supabase sign out
const mockSignOut = async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
  if (typeof window !== "undefined") localStorage.removeItem("mockSession");
  return { error: null };
};

// Mock function to simulate updating user attributes
const mockUpdateUser = async (attributes: any) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log("Mock updateUser called with:", attributes);
  const currentSession = await getMockSessionClient();
  if (currentSession?.user) {
    const updatedUser = { ...currentSession.user, ...attributes };
    if (typeof window !== "undefined") localStorage.setItem("mockSession", JSON.stringify({ user: updatedUser }));
    return { data: { user: updatedUser }, error: null };
  }
  return { data: null, error: { message: "User not found" } };
};

// Mock function to simulate changing password
const mockUpdatePassword = async (newPassword: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log("Mock updatePassword called. New password (not stored):", newPassword);
  // In a real app, you'd also need currentPassword for verification
  return { error: null }; 
};

// Mock function to simulate uploading to Supabase Storage
const mockUploadProfilePicture = async (file: File) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const mockUrl = URL.createObjectURL(file); // Simulate a URL from storage
  console.log("Mock uploadProfilePicture. File:", file.name, "Mock URL:", mockUrl);
  // Update the user's profile_picture_url in the mock session
  const currentSession = await getMockSessionClient();
  if (currentSession?.user) {
    const updatedUser = { ...currentSession.user, profile_picture_url: mockUrl };
    if (typeof window !== "undefined") localStorage.setItem("mockSession", JSON.stringify({ user: updatedUser }));
    return { data: { path: mockUrl }, error: null }; // Simulate path to be stored
  }
  return { data: null, error: { message: "Upload failed"}};
};

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
  const [sessionLoading, setSessionLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{type: "success" | "error", message: string} | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const currentSession = await getMockSessionClient();
      if (!currentSession?.user) {
        redirect("/login");
      } else {
        setSession(currentSession);
        setUsername(currentSession.user.username || "");
        setEmail(currentSession.user.email || "");
        setProfilePicturePreview(currentSession.user.profile_picture_url || null);
      }
      setSessionLoading(false);
    };
    checkSession();
  }, []);

  const handleLogout = async () => {
    await mockSignOut();
    setSession(null);
    redirect("/login");
  };

  const handleProfileUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedbackMessage(null);
    const { data, error } = await mockUpdateUser({ username, email });
    if (error) {
      setFeedbackMessage({ type: "error", message: `Failed to update profile: ${error.message}` });
    } else {
      setFeedbackMessage({ type: "success", message: "Profile updated successfully!" });
      if (data?.user) setSession({ ...session, user: data.user }); // Update local session display
    }
  };

  const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedbackMessage(null);
    if (newPassword !== confirmNewPassword) {
      setFeedbackMessage({ type: "error", message: "New passwords do not match." });
      return;
    }
    if (!currentPassword || !newPassword) {
        setFeedbackMessage({ type: "error", message: "All password fields are required." });
        return;
    }
    // Add mock current password check if desired
    const { error } = await mockUpdatePassword(newPassword);
    if (error) {
      setFeedbackMessage({ type: "error", message: `Failed to change password: ${error.message}` });
    } else {
      setFeedbackMessage({ type: "success", message: "Password changed successfully! (mocked)" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
  };

  const handleProfilePictureChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Simple validation for image type (can be expanded)
      if (!file.type.startsWith("image/")){
        setFeedbackMessage({type: "error", message: "Please select an image file."}) 
        return;
      }
      setProfilePictureFile(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  const handleProfilePictureUpload = async () => {
    if (!profilePictureFile) {
      setFeedbackMessage({ type: "error", message: "Please select a picture first." });
      return;
    }
    setFeedbackMessage(null);
    const { data, error } = await mockUploadProfilePicture(profilePictureFile);
    if (error) {
      setFeedbackMessage({ type: "error", message: `Failed to upload picture: ${error.message}` });
    } else {
      setFeedbackMessage({ type: "success", message: "Profile picture updated! (mocked)" });
      if (data?.path) {
        // Update session with new URL if backend confirms it
        const currentSession = await getMockSessionClient(); // Re-fetch to be sure
        if(currentSession?.user) {
            const updatedUser = { ...currentSession.user, profile_picture_url: data.path };
            if (typeof window !== "undefined") localStorage.setItem("mockSession", JSON.stringify({ user: updatedUser }));
            setSession({user: updatedUser});
            setProfilePicturePreview(data.path);
        }
      }
    }
  };

  if (sessionLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p>Loading profile...</p></div>;
  }

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-6 sm:py-12">
      <div className="container mx-auto max-w-lg px-4">
        <div className="text-center mb-8">
          <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-purple-500 bg-gray-200 flex items-center justify-center group">
            {profilePicturePreview ? (
              <img src={profilePicturePreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon size={64} className="text-gray-400" />
            )}
            <label htmlFor="profilePictureInput" className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera size={32} />
            </label>
          </div>
          <input type="file" id="profilePictureInput" accept="image/*" onChange={handleProfilePictureChange} className="hidden" />
          {profilePictureFile && (
            <button onClick={handleProfilePictureUpload} className="mt-2 text-sm bg-purple-500 text-white py-1 px-3 rounded-md hover:bg-purple-600">
              Upload New Picture
            </button>
          )}
          <h1 className="text-3xl font-bold text-gray-800 mt-2">{session.user.username || "User"}</h1>
          <p className="text-gray-600">{session.user.email}</p>
        </div>

        {feedbackMessage && (
          <div className={`p-3 mb-4 rounded-md text-sm ${feedbackMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {feedbackMessage.message}
          </div>
        )}

        <CollapsibleSection title="Edit Profile Details" icon={Edit3} defaultOpen={true}>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input type="text" name="username" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500" placeholder="Enter your username" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500" placeholder="Enter your email" />
              <p className="mt-1 text-xs text-gray-500">Email changes will require verification (mock).</p>
            </div>
            <button type="submit" className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 font-semibold">
              Save Profile Details
            </button>
          </form>
        </CollapsibleSection>

        <CollapsibleSection title="Change Password" icon={Lock}>
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <label htmlFor="currentPassword">Current Password</label>
              <input type="password" name="currentPassword" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md shadow-sm mt-1 focus:ring-purple-500 focus:border-purple-500" placeholder="Current Password" />
            </div>
            <div>
              <label htmlFor="newPassword">New Password</label>
              <input type="password" name="newPassword" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md shadow-sm mt-1 focus:ring-purple-500 focus:border-purple-500" placeholder="New Password" />
            </div>
            <div>
              <label htmlFor="confirmNewPassword">Confirm New Password</label>
              <input type="password" name="confirmNewPassword" id="confirmNewPassword" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md shadow-sm mt-1 focus:ring-purple-500 focus:border-purple-500" placeholder="Confirm New Password" />
            </div>
            <button type="submit" className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 font-semibold">
              Change Password
            </button>
          </form>
        </CollapsibleSection>
        
        <CollapsibleSection title="Account Information" icon={User}>
          <div className="space-y-4">
            <div>
              <h3 className="text-md font-semibold text-gray-700 mb-1">Credit Balance</h3>
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
          <button onClick={handleLogout} className="w-full flex items-center justify-center bg-red-500 text-white py-3 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 font-semibold">
            <LogOut size={20} className="mr-2" /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}

