"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Users, GraduationCap, UserCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DirectoryIndexPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Directory Management
          </h1>
          <p className="text-muted-foreground">
            Access and manage alumni and student directories
          </p>
        </div>

        {/* Directory Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Alumni Directory */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-8 w-8 text-blue-600" />
                <CardTitle className="text-xl">Alumni Directory</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Browse and manage alumni profiles, mentors, and referral
                providers.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-2" />
                  View all alumni profiles
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Filter by graduation year, industry, location
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Find mentors and referral providers
                </div>
              </div>
              <div className="pt-4">
                <Link href="/dashboard/admin/directory/alumni">
                  <Button className="w-full">
                    Access Alumni Directory
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Student Directory */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-8 w-8 text-green-600" />
                <CardTitle className="text-xl">Student Directory</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Browse and manage current student profiles and their academic
                progress.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-2" />
                  View all student profiles
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Filter by program, year, and GPA
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Track internship and mentorship needs
                </div>
              </div>
              <div className="pt-4">
                <Link href="/dashboard/admin/directory/students">
                  <Button className="w-full" variant="outline">
                    Access Student Directory
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Link href="/dashboard/admin/directory/alumni">
                <Button variant="outline" size="sm">
                  <UserCheck className="mr-2 h-4 w-4" />
                  View Alumni
                </Button>
              </Link>
              <Link href="/dashboard/admin/directory/students">
                <Button variant="outline" size="sm">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  View Students
                </Button>
              </Link>
              <Button variant="outline" size="sm" disabled>
                <Users className="mr-2 h-4 w-4" />
                Export All Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
