"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminUsersApi } from "@/hooks/api-connections/use-admin-users-api";
import { AlertCircle, Loader2 } from "lucide-react";

interface AdminAuthProps {
  onAuthenticated: () => void;
}

export function AdminAuth({ onAuthenticated }: AdminAuthProps) {
  const [token, setToken] = useState("");
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const { createAdminUser, setAuthToken, loading, error } = useAdminUsersApi();

  const handleTokenSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (token.trim()) {
      setAuthToken(token.trim());
      onAuthenticated();
    }
  };

  const handleCreateAdmin = async () => {
    const success = await createAdminUser();
    if (success) {
      onAuthenticated();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Admin Authentication</CardTitle>
          <CardDescription className="text-center">
            Enter your admin token or create a test admin user
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {!showCreateAdmin ? (
            <>
              <form onSubmit={handleTokenSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="token">Admin Token</Label>
                  <Input
                    id="token"
                    type="password"
                    placeholder="Enter your admin JWT token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!token.trim()}
                >
                  Authenticate
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowCreateAdmin(true)}
              >
                Create Test Admin User
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-medium text-blue-900 mb-2">
                  Create Test Admin User
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  This will create a test admin user and automatically
                  authenticate you. This is for development/testing purposes
                  only.
                </p>
                <div className="text-xs text-blue-600 space-y-1">
                  <p>
                    <strong>Username:</strong> admin_user
                  </p>
                  <p>
                    <strong>Email:</strong> admin@offerhub.com
                  </p>
                  <p>
                    <strong>Wallet:</strong>{" "}
                    0xadmin123456789abcdef123456789abcdef123456
                  </p>
                </div>
              </div>

              <Button
                onClick={handleCreateAdmin}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Admin User...
                  </>
                ) : (
                  "Create & Authenticate"
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowCreateAdmin(false)}
                disabled={loading}
              >
                Back to Token Input
              </Button>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium text-gray-900 mb-2">
              For Production Use:
            </h4>
            <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
              <li>Get an admin JWT token from your authentication system</li>
              <li>Enter the token in the field above</li>
              <li>The token should have admin role permissions</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
