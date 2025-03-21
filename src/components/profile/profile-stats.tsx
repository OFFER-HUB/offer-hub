export default function ProfileStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 border-t pt-6">
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-1">
          Completed Projects
        </h3>
        <p className="text-2xl font-bold text-teal-600">8</p>
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-1">
          Active Projects
        </h3>
        <p className="text-2xl font-bold text-teal-600">2</p>
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-1">Total Spent</h3>
        <p className="text-2xl font-bold text-teal-600">$4850</p>
      </div>
    </div>
  );
}
