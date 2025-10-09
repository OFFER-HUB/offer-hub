const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center inset-0  w-full fixed bg-black/70 z-[100]">
    <div className="h-20 w-20 rounded-full border-4 border-teal-600 border-t-transparent animate-spin">
      <span className="sr-only">Loading...</span>{" "}
    </div>
  </div>
);

export default LoadingSpinner;
