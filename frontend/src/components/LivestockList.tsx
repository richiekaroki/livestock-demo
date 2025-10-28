import { livestockData } from "../data/livestockData";

export function LivestockList() {
  // Console logs for verification
  console.log("📊 Livestock Data Loaded:", livestockData);
  console.log("🐄 Animal Count:", livestockData.length);

  const healthCounts = livestockData.reduce((acc, animal) => {
    acc[animal.health] = (acc[animal.health] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log("🏥 Health Distribution:", healthCounts);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Livestock Management Dashboard
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 className="font-semibold text-gray-600">Total Animals</h3>
          <p className="text-2xl font-bold">{livestockData.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="font-semibold text-gray-600">Healthy</h3>
          <p className="text-2xl font-bold text-green-600">
            {healthCounts["Healthy"] || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
          <h3 className="font-semibold text-gray-600">Sick</h3>
          <p className="text-2xl font-bold text-red-600">
            {healthCounts["Sick"] || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
          <h3 className="font-semibold text-gray-600">Recovering</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {healthCounts["Recovering"] || 0}
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Breed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Health
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {livestockData.map((animal) => (
                <tr key={animal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {animal.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {animal.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {animal.breed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        animal.health === "Healthy"
                          ? "bg-green-100 text-green-800"
                          : animal.health === "Sick"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {animal.health}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {animal.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {animal.owner}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {animal.registrationDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Debug Section */}
      <details className="mt-8 bg-gray-50 p-4 rounded-lg">
        <summary className="cursor-pointer font-medium text-gray-700">
          🔧 Debug: View Raw Data & Console Logs
        </summary>
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">
            Check browser console for detailed logs (F12 → Console)
          </p>
          <pre className="text-xs bg-white p-4 rounded border overflow-auto max-h-60">
            {JSON.stringify(livestockData, null, 2)}
          </pre>
        </div>
      </details>
    </div>
  );
}
