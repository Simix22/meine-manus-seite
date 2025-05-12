export default function SignOutPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Sign Out</h1>
      <div className="p-4 bg-white rounded-lg shadow min-h-[300px] flex flex-col items-center justify-center">
        <p className="text-gray-700 mb-4">You have been signed out.</p>
        {/* This is a placeholder. Actual sign-out logic would be implemented here. */}
        <a href="/" className="text-purple-600 hover:underline">Return to Home</a>
      </div>
    </div>
  );
}

