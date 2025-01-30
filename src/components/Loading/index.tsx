
export const LoadingScreen = ({ message = 'Loading...' }) => (
  <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex flex-col items-center justify-center">
    <div className="w-16 h-16 border-4 border-[#033F6A] border-t-transparent rounded-full animate-spin mb-4" />
    <p className="text-lg text-gray-700 font-medium">{message}</p>
  </div>
);

export default LoadingScreen;