interface ImageCardProps {
  imageUrl: string;
  title?: string;
  creator?: string;
  price?: string;
}

const ImageCard: React.FC<ImageCardProps> = ({ imageUrl, title, creator, price }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="w-full h-48 bg-gray-200">
        <img src={imageUrl} alt={title || 'Gallery Image'} className="w-full h-full object-cover" />
      </div>
      {(title || creator || price) && (
        <div className="p-4">
          {title && <h3 className="text-lg font-semibold text-gray-800 truncate">{title}</h3>}
          {creator && <p className="text-sm text-gray-600">By @{creator}</p>}
          {price && <p className="text-lg font-bold text-purple-600 mt-2">{price}</p>}
          {/* Placeholder for buy/unlock button */}
        </div>
      )}
    </div>
  );
};

export default ImageCard;

