export default function GalleryPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Gallery</h1>
        {/* Placeholder for filter dropdowns */}
        <div className="flex space-x-2">
          <select className="p-2 border rounded-md bg-white shadow-sm">
            <option>All Media</option>
          </select>
          <select className="p-2 border rounded-md bg-white shadow-sm">
            <option>Newest</option>
          </select>
        </div>
      </div>
      {/* Placeholder for Gallery content */}
      <div className="p-4 bg-white rounded-lg shadow min-h-[300px] flex items-center justify-center">
        <p className="text-gray-500">You have not purchased any media yet.</p>
        {/* Image grid will be implemented here later */}
      </div>
    </div>
  );
}

