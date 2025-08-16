"use client";

import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

export default function AlumniDashboard() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute requireAuth={true} allowedRoles={["alumni"]}>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Alumni Portal
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Welcome, {user?.email}</span>
                <button
                  onClick={logout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Alumni Dashboard
              </h2>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Complete Profile
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Update your professional profile and mentoring preferences
                  </p>
                  <Link
                    href="/profile/alumni"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                  >
                    Update Profile
                  </Link>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Mentor Students
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Connect with students and provide guidance
                  </p>
                  <Link
                    href="/mentoring"
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
                  >
                    View Requests
                  </Link>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Post Jobs
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Share job opportunities and provide referrals
                  </p>
                  <Link
                    href="/jobs/post"
                    className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700"
                  >
                    Post Job
                  </Link>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow text-center">
                  <div className="text-3xl font-bold text-blue-600">0</div>
                  <div className="text-gray-600">Students Mentored</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow text-center">
                  <div className="text-3xl font-bold text-green-600">0</div>
                  <div className="text-gray-600">Referrals Provided</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow text-center">
                  <div className="text-3xl font-bold text-purple-600">0</div>
                  <div className="text-gray-600">Jobs Posted</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Recent Activity
                  </h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-500">No recent activity to show.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
