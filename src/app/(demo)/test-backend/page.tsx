"use client";

import { useState } from "react";

interface TestResult {
  endpoint: string;
  status: "loading" | "success" | "error";
  data?: any;
  error?: string;
  responseTime?: number;
}

export default function TestBackendPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const endpoints = [
    {
      name: "Health Check",
      url: "/api/workflow/health",
      method: "GET",
    },
    {
      name: "Workflow State",
      url: "/api/workflow/disputes/550e8400-e29b-41d4-a716-446655440000/workflow",
      method: "GET",
    },
    {
      name: "Analytics",
      url: "/api/workflow/analytics/workflow?disputeId=550e8400-e29b-41d4-a716-446655440000",
      method: "GET",
    },
    {
      name: "Progress",
      url: "/api/workflow/disputes/550e8400-e29b-41d4-a716-446655440000/progress",
      method: "GET",
    },
    {
      name: "Notifications",
      url: "/api/workflow/disputes/550e8400-e29b-41d4-a716-446655440000/notifications",
      method: "GET",
    },
  ];

  const testEndpoint = async (
    endpoint: (typeof endpoints)[0]
  ): Promise<TestResult> => {
    const startTime = Date.now();

    try {
      console.log(`Testing ${endpoint.name}: ${endpoint.url}`);

      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        endpoint: endpoint.name,
        status: "success",
        data,
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        endpoint: endpoint.name,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        responseTime,
      };
    }
  };

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);

    for (const endpoint of endpoints) {
      // Add loading state
      setResults((prev) => [
        ...prev,
        {
          endpoint: endpoint.name,
          status: "loading",
        },
      ]);

      const result = await testEndpoint(endpoint);

      setResults((prev) =>
        prev.map((r) => (r.endpoint === endpoint.name ? result : r))
      );

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setIsRunning(false);
  };

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "loading":
        return "text-yellow-600";
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "loading":
        return "⏳";
      case "success":
        return "✅";
      case "error":
        return "❌";
      default:
        return "❓";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🧪 Backend API Testing
          </h1>

          <div className="mb-6">
            <button
              onClick={runTests}
              disabled={isRunning}
              className={`px-6 py-3 rounded-lg font-semibold ${
                isRunning
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isRunning ? "🔄 Testing..." : "🚀 Run Tests"}
            </button>
          </div>

          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span>{getStatusIcon(result.status)}</span>
                    {result.endpoint}
                  </h3>
                  <span
                    className={`font-medium ${getStatusColor(result.status)}`}
                  >
                    {result.status.toUpperCase()}
                  </span>
                </div>

                {result.responseTime && (
                  <p className="text-sm text-gray-600 mb-2">
                    Response time: {result.responseTime}ms
                  </p>
                )}

                {result.error && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 mb-2">
                    <p className="text-red-800 font-medium">Error:</p>
                    <p className="text-red-700">{result.error}</p>
                  </div>
                )}

                {result.data && (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-green-800 font-medium mb-2">Response:</p>
                    <pre className="text-green-700 text-sm overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}

                {result.status === "loading" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p className="text-yellow-800">Testing endpoint...</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {results.length === 0 && !isRunning && (
            <div className="text-center py-8 text-gray-500">
              <p>Click "Run Tests" to test all backend endpoints</p>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              📋 Test Endpoints:
            </h3>
            <ul className="text-blue-800 space-y-1">
              {endpoints.map((endpoint, index) => (
                <li key={index} className="text-sm">
                  <strong>{endpoint.name}:</strong> {endpoint.url}
                </li>
              ))}
            </ul>
            <p className="text-blue-700 text-sm mt-2">
              <strong>Note:</strong> These URLs are proxied through Next.js to
              http://localhost:4000
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
