// "use client";

// import { useAuth } from "@/contexts/AuthContext";
// import ProtectedRoute from "@/components/ProtectedRoute";
// import { useEffect, useState } from "react";
// import { apiClient } from "@/lib/api";
// import {
//   Users,
//   GraduationCap,
//   Briefcase,
//   TrendingUp,
//   Clock,
//   CheckCircle,
//   XCircle,
//   Eye,
//   Search,
//   Filter,
//   MoreVertical,
//   Bell,
//   Settings,
//   Activity,
//   Award,
//   DollarSign,
//   Calendar,
// } from "lucide-react";

// interface DashboardStats {
//   total_users: number;
//   total_students: number;
//   total_alumni: number;
//   pending_role_requests: number;
//   approved_this_month: number;
//   rejected_this_month: number;
//   new_users_this_week: number;
//   ai_summaries_generated: number;
// }

// interface RoleRequest {
//   id: number;
//   user: {
//     id: number;
//     email: string;
//     name: string;
//   };
//   requested_role: string;
//   current_role: string;
//   status: string;
//   created_at: string;
//   profile_data: any;
// }

// interface RecentActivity {
//   id: number;
//   action: string;
//   user: string;
//   timestamp: string;
//   details: string;
// }

// export default function AdminDashboard() {
//   const { user, logout } = useAuth();
//   const [stats, setStats] = useState<DashboardStats>({
//     total_users: 0,
//     total_students: 0,
//     total_alumni: 0,
//     pending_role_requests: 0,
//     approved_this_month: 0,
//     rejected_this_month: 0,
//     new_users_this_week: 0,
//     ai_summaries_generated: 0,
//   });
//   const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([]);
//   const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
      
//       // Fetch dashboard statistics
//       const statsResponse = await apiClient.get("/userprofile/admin/dashboard/stats/");
//       if (statsResponse.data.success) {
//         setStats(statsResponse.data.stats);
//       }

//       // Fetch role requests
//       const requestsResponse = await apiClient.get("/userprofile/admin/role-requests/");
//       if (requestsResponse.data.success) {
//         setRoleRequests(requestsResponse.data.requests);
//       }

//       // Mock recent activity data (you can replace with real API)
//       setRecentActivity([
//         {
//           id: 1,
//           action: "Role Request Approved",
//           user: "John Doe",
//           timestamp: "2 minutes ago",
//           details: "Student → Alumni",
//         },
//         {
//           id: 2,
//           action: "New User Registration",
//           user: "Jane Smith",
//           timestamp: "15 minutes ago",
//           details: "Student account created",
//         },
//         {
//           id: 3,
//           action: "Profile Updated",
//           user: "Mike Johnson",
//           timestamp: "1 hour ago",
//           details: "Alumni profile enhanced",
//         },
//         {
//           id: 4,
//           action: "AI Summary Generated",
//           user: "Sarah Wilson",
//           timestamp: "2 hours ago",
//           details: "Profile summary created",
//         },
//       ]);
//     } catch (error) {
//       console.error("Failed to fetch dashboard data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleApproveRequest = async (requestId: number) => {
//     try {
//       const response = await apiClient.patch(`/userprofile/admin/role-requests/${requestId}/`, {
//         action: "approve",
//         admin_notes: "Approved via dashboard",
//       });
      
//       if (response.data.success) {
//         fetchDashboardData(); // Refresh data
//       }
//     } catch (error) {
//       console.error("Failed to approve request:", error);
//     }
//   };

//   const handleRejectRequest = async (requestId: number) => {
//     try {
//       const response = await apiClient.patch(`/userprofile/admin/role-requests/${requestId}/`, {
//         action: "reject",
//         admin_notes: "Rejected via dashboard - needs more information",
//       });
      
//       if (response.data.success) {
//         fetchDashboardData(); // Refresh data
//       }
//     } catch (error) {
//       console.error("Failed to reject request:", error);
//     }
//   };

//   const filteredRequests = roleRequests.filter((request) => {
//     const matchesSearch = request.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          request.user.email.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesFilter = statusFilter === "all" || request.status === statusFilter;
//     return matchesSearch && matchesFilter;
//   });

//   if (loading) {
//     return (
//       <ProtectedRoute requireAuth={true} allowedRoles={["admin"]}>
//         <div className="min-h-screen flex items-center justify-center bg-black">
//           <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
//         </div>
//       </ProtectedRoute>
//     );
//   }

//   return (
//     <ProtectedRoute requireAuth={true} allowedRoles={["admin"]}>
//       <div className="min-h-screen bg-black text-white">
//         {/* Background Pattern */}
//         <div className="fixed inset-0 pointer-events-none">
//           <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
//           <div className="absolute inset-0 bg-repeat opacity-5" style={{
//             backgroundImage: "repeating-linear-gradient(45deg, transparent 0 14px, rgba(255, 255, 255, 0.04) 14px 28px)"
//           }}></div>
//         </div>

//         <div className="flex h-screen overflow-hidden relative">
//           {/* Sidebar */}
//           <aside className="w-64 bg-gray-900/90 backdrop-blur border-r border-gray-800 flex flex-col">
//             <div className="p-4 border-b border-gray-800">
//               <h1 className="text-xl font-bold text-white">Alumni Admin</h1>
//               <p className="text-xs text-gray-400">Dashboard</p>
//             </div>
            
//             <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-sm">
//               <a className="flex items-center gap-2 px-3 py-2 rounded-md bg-yellow-400 text-black shadow" href="#">
//                 <Activity className="w-4 h-4" />
//                 Dashboard
//               </a>
//               <a className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-800 text-gray-300 hover:text-white" href="#users">
//                 <Users className="w-4 h-4" />
//                 Users
//               </a>
//               <a className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-800 text-gray-300 hover:text-white" href="#requests">
//                 <Clock className="w-4 h-4" />
//                 Role Requests
//               </a>
//               <a className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-800 text-gray-300 hover:text-white" href="#directory">
//                 <GraduationCap className="w-4 h-4" />
//                 Directory
//               </a>
//               <a className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-800 text-gray-300 hover:text-white" href="#ai">
//                 <Award className="w-4 h-4" />
//                 AI Services
//               </a>
//               <a className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-800 text-gray-300 hover:text-white" href="#activity">
//                 <Bell className="w-4 h-4" />
//                 Activity Logs
//               </a>
//               <a className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-800 text-gray-300 hover:text-white" href="#settings">
//                 <Settings className="w-4 h-4" />
//                 Settings
//               </a>
//             </nav>
            
//             <div className="p-4 border-t border-gray-800 text-xs text-gray-400">
//               <button 
//                 onClick={logout}
//                 className="w-full rounded bg-red-600 hover:bg-red-700 text-white py-2 text-xs font-semibold mb-2"
//               >
//                 Logout
//               </button>
//               <p>Logged in as {user?.email}</p>
//             </div>
//           </aside>

//           {/* Main Content */}
//           <main className="flex-1 overflow-y-auto">
//             {/* Top Bar */}
//             <header className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur border-b border-gray-800 px-6 py-4 flex flex-wrap gap-4 items-center">
//               <div className="flex items-center gap-2 text-white font-semibold text-lg">
//                 Dashboard Overview
//               </div>
              
//               <div className="flex-1 min-w-[200px]">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                   <input
//                     type="text"
//                     placeholder="Search users, requests..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
//                   />
//                 </div>
//               </div>
              
//               <div className="flex items-center gap-4">
//                 <div className="hidden md:flex gap-3 text-xs">
//                   <span className="px-2 py-1 rounded bg-green-900/30 text-green-300 border border-green-700">
//                     API OK
//                   </span>
//                   <span className="px-2 py-1 rounded bg-yellow-900/30 text-yellow-300 border border-yellow-700">
//                     {stats.pending_role_requests} pending
//                   </span>
//                 </div>
                
//                 <div className="flex items-center gap-2">
//                   <div className="h-9 w-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black text-sm font-bold">
//                     {user?.email?.charAt(0).toUpperCase()}
//                   </div>
//                   <div className="text-xs leading-tight">
//                     <p className="font-semibold text-white">{user?.email}</p>
//                     <p className="text-gray-400">Admin</p>
//                   </div>
//                 </div>
//               </div>
//             </header>

//             {/* Metrics Cards */}
//             <section className="p-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
//               <div className="bg-gray-900 rounded-xl p-4 shadow-lg border border-gray-800 flex flex-col gap-3">
//                 <div className="flex justify-between items-start">
//                   <div className="flex items-center gap-2">
//                     <Users className="w-5 h-5 text-yellow-400" />
//                     <h3 className="text-sm font-semibold text-white">Total Users</h3>
//                   </div>
//                   <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-400 border border-yellow-400/40">
//                     +{stats.new_users_this_week}
//                   </span>
//                 </div>
//                 <p className="text-3xl font-bold tracking-tight text-white">{stats.total_users}</p>
//                 <p className="text-xs text-gray-400">Students {stats.total_students} • Alumni {stats.total_alumni}</p>
//                 <div className="mt-2 h-1.5 rounded-full bg-gray-800">
//                   <div 
//                     className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
//                     style={{ width: `${(stats.total_alumni / stats.total_users) * 100}%` }}
//                   ></div>
//                 </div>
//               </div>

//               <div className="bg-gray-900 rounded-xl p-4 shadow-lg border border-gray-800 flex flex-col gap-3">
//                 <div className="flex justify-between items-start">
//                   <div className="flex items-center gap-2">
//                     <Clock className="w-5 h-5 text-orange-400" />
//                     <h3 className="text-sm font-semibold text-white">Pending Requests</h3>
//                   </div>
//                   <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-400/20 text-orange-400 border border-orange-400/40">
//                     NEW
//                   </span>
//                 </div>
//                 <p className="text-3xl font-bold tracking-tight text-white">{stats.pending_role_requests}</p>
//                 <p className="text-xs text-gray-400">Approved: {stats.approved_this_month} • Rejected: {stats.rejected_this_month}</p>
//                 <div className="mt-2 h-1.5 rounded-full bg-gray-800">
//                   <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-orange-400 to-red-500"></div>
//                 </div>
//               </div>

//               <div className="bg-gray-900 rounded-xl p-4 shadow-lg border border-gray-800 flex flex-col gap-3">
//                 <div className="flex justify-between items-start">
//                   <div className="flex items-center gap-2">
//                     <Award className="w-5 h-5 text-yellow-400" />
//                     <h3 className="text-sm font-semibold text-white">AI Summaries</h3>
//                   </div>
//                   <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-400 border border-yellow-400/40">
//                     AUTO
//                   </span>
//                 </div>
//                 <p className="text-3xl font-bold tracking-tight text-white">{stats.ai_summaries_generated}</p>
//                 <p className="text-xs text-gray-400">Generated this month</p>
//                 <div className="mt-2 h-1.5 rounded-full bg-gray-800">
//                   <div className="h-full w-[85%] rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500"></div>
//                 </div>
//               </div>

//               <div className="bg-gray-900 rounded-xl p-4 shadow-lg border border-gray-800 flex flex-col gap-3">
//                 <div className="flex justify-between items-start">
//                   <div className="flex items-center gap-2">
//                     <TrendingUp className="w-5 h-5 text-green-400" />
//                     <h3 className="text-sm font-semibold text-white">Success Rate</h3>
//                   </div>
//                   <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-400/20 text-green-400 border border-green-400/40">
//                     +12%
//                   </span>
//                 </div>
//                 <p className="text-3xl font-bold tracking-tight text-white">94%</p>
//                 <p className="text-xs text-gray-400">Role request approval rate</p>
//                 <div className="mt-2 h-1.5 rounded-full bg-gray-800">
//                   <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-green-400 to-emerald-500"></div>
//                 </div>
//               </div>
//             </section>

//             {/* Two Column Layout */}
//             <section className="px-6 pb-6 grid xl:grid-cols-3 gap-6">
//               {/* Left Column - Role Requests */}
//               <div className="space-y-6 xl:col-span-2">
//                 <div className="bg-gray-900 rounded-xl border border-gray-800 p-5" id="requests">
//                   <div className="flex items-center justify-between mb-4">
//                     <h3 className="font-semibold text-white">Role Requests</h3>
//                     <div className="flex gap-2">
//                       <select
//                         value={statusFilter}
//                         onChange={(e) => setStatusFilter(e.target.value)}
//                         className="text-xs bg-gray-800 border border-gray-700 text-white rounded px-2 py-1"
//                       >
//                         <option value="all">All Status</option>
//                         <option value="pending">Pending</option>
//                         <option value="approved">Approved</option>
//                         <option value="rejected">Rejected</option>
//                       </select>
//                     </div>
//                   </div>
                  
//                   <div className="overflow-x-auto">
//                     <table className="w-full text-sm">
//                       <thead>
//                         <tr className="border-b border-gray-800">
//                           <th className="text-left py-2 text-gray-400">User</th>
//                           <th className="text-left py-2 text-gray-400">Role Change</th>
//                           <th className="text-left py-2 text-gray-400">Status</th>
//                           <th className="text-left py-2 text-gray-400">Date</th>
//                           <th className="text-left py-2 text-gray-400">Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {filteredRequests.slice(0, 8).map((request) => (
//                           <tr key={request.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
//                             <td className="py-3">
//                               <div>
//                                 <p className="font-medium text-white">{request.user.name}</p>
//                                 <p className="text-xs text-gray-400">{request.user.email}</p>
//                               </div>
//                             </td>
//                             <td className="py-3 text-gray-300">
//                               {request.current_role} → {request.requested_role}
//                             </td>
//                             <td className="py-3">
//                               <span className={`text-xs px-2 py-1 rounded-full border ${
//                                 request.status === 'pending' 
//                                   ? 'bg-yellow-400/20 text-yellow-400 border-yellow-400/40' 
//                                   : request.status === 'approved'
//                                   ? 'bg-green-400/20 text-green-400 border-green-400/40'
//                                   : 'bg-red-400/20 text-red-400 border-red-400/40'
//                               }`}>
//                                 {request.status}
//                               </span>
//                             </td>
//                             <td className="py-3 text-gray-400 text-xs">
//                               {new Date(request.created_at).toLocaleDateString()}
//                             </td>
//                             <td className="py-3">
//                               {request.status === 'pending' && (
//                                 <div className="flex gap-1">
//                                   <button
//                                     onClick={() => handleApproveRequest(request.id)}
//                                     className="p-1 text-green-400 hover:bg-green-400/20 rounded"
//                                     title="Approve"
//                                   >
//                                     <CheckCircle className="w-4 h-4" />
//                                   </button>
//                                   <button
//                                     onClick={() => handleRejectRequest(request.id)}
//                                     className="p-1 text-red-400 hover:bg-red-400/20 rounded"
//                                     title="Reject"
//                                   >
//                                     <XCircle className="w-4 h-4" />
//                                   </button>
//                                   <button className="p-1 text-gray-400 hover:bg-gray-700 rounded" title="View Details">
//                                     <Eye className="w-4 h-4" />
//                                   </button>
//                                 </div>
//                               )}
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               </div>

//               {/* Right Column - Recent Activity */}
//               <div className="space-y-6">
//                 <div className="bg-gray-900 rounded-xl border border-gray-800 p-5" id="activity">
//                   <div className="flex items-center justify-between mb-4">
//                     <h3 className="font-semibold text-white">Recent Activity</h3>
//                     <button className="text-xs text-gray-400 hover:text-yellow-400">Refresh</button>
//                   </div>
                  
//                   <div className="space-y-4">
//                     {recentActivity.map((activity) => (
//                       <div key={activity.id} className="flex gap-3">
//                         <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
//                         <div className="flex-1">
//                           <p className="text-sm text-white font-medium">{activity.action}</p>
//                           <p className="text-xs text-gray-400">{activity.user} • {activity.details}</p>
//                           <p className="text-xs text-gray-500">{activity.timestamp}</p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Quick Stats */}
//                 <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
//                   <h3 className="font-semibold text-white mb-4">Quick Stats</h3>
//                   <div className="space-y-3">
//                     <div className="flex justify-between items-center">
//                       <span className="text-sm text-gray-400">This Week</span>
//                       <span className="text-sm text-white font-medium">+{stats.new_users_this_week} users</span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-sm text-gray-400">Approval Rate</span>
//                       <span className="text-sm text-green-400 font-medium">94%</span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-sm text-gray-400">AI Generated</span>
//                       <span className="text-sm text-yellow-400 font-medium">{stats.ai_summaries_generated}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </section>

//             <footer className="px-6 py-8 text-center text-xs text-gray-500 border-t border-gray-800">
//               © 2025 Alumni Portal Admin Dashboard • Built with Next.js & Tailwind CSS
//             </footer>
//           </main>
//         </div>
//       </div>
//     </ProtectedRoute>
//   );
// }
//         </div>
//       </ProtectedRoute>
//     );
//   }

//   return (
//     <ProtectedRoute requireAuth={true} allowedRoles={["admin"]}>
//       <div className="min-h-screen bg-gray-50">
//         {/* Header */}
//         <header className="bg-white shadow-sm border-b">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="flex justify-between items-center py-6">
//               <div>
//                 <h1 className="text-3xl font-bold text-gray-900">
//                   Admin Dashboard
//                 </h1>
//                 <p className="text-gray-600">Welcome back, {user?.email}</p>
//               </div>
//               <button
//                 onClick={logout}
//                 className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
//               >
//                 Logout
//               </button>
//             </div>
//           </div>
//         </header>

//         {/* Main Content */}
//         <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           {/* Stats Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//             <div className="bg-white p-6 rounded-lg shadow-sm border">
//               <div className="flex items-center">
//                 <div className="flex-shrink-0">
//                   <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
//                     <svg
//                       className="w-5 h-5 text-blue-600"
//                       fill="currentColor"
//                       viewBox="0 0 20 20"
//                     >
//                       <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                   </div>
//                 </div>
//                 <div className="ml-4">
//                   <h3 className="text-lg font-medium text-gray-900">
//                     Total Students
//                   </h3>
//                   <p className="text-3xl font-bold text-blue-600">
//                     {stats.totalStudents}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white p-6 rounded-lg shadow-sm border">
//               <div className="flex items-center">
//                 <div className="flex-shrink-0">
//                   <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
//                     <svg
//                       className="w-5 h-5 text-green-600"
//                       fill="currentColor"
//                       viewBox="0 0 20 20"
//                     >
//                       <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
//                     </svg>
//                   </div>
//                 </div>
//                 <div className="ml-4">
//                   <h3 className="text-lg font-medium text-gray-900">
//                     Total Alumni
//                   </h3>
//                   <p className="text-3xl font-bold text-green-600">
//                     {stats.totalAlumni}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white p-6 rounded-lg shadow-sm border">
//               <div className="flex items-center">
//                 <div className="flex-shrink-0">
//                   <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
//                     <svg
//                       className="w-5 h-5 text-yellow-600"
//                       fill="currentColor"
//                       viewBox="0 0 20 20"
//                     >
//                       <path
//                         fillRule="evenodd"
//                         d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
//                         clipRule="evenodd"
//                       />
//                     </svg>
//                   </div>
//                 </div>
//                 <div className="ml-4">
//                   <h3 className="text-lg font-medium text-gray-900">
//                     Pending Verifications
//                   </h3>
//                   <p className="text-3xl font-bold text-yellow-600">
//                     {stats.pendingVerifications}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white p-6 rounded-lg shadow-sm border">
//               <div className="flex items-center">
//                 <div className="flex-shrink-0">
//                   <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
//                     <svg
//                       className="w-5 h-5 text-purple-600"
//                       fill="currentColor"
//                       viewBox="0 0 20 20"
//                     >
//                       <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
//                     </svg>
//                   </div>
//                 </div>
//                 <div className="ml-4">
//                   <h3 className="text-lg font-medium text-gray-900">
//                     Recent Registrations
//                   </h3>
//                   <p className="text-3xl font-bold text-purple-600">
//                     {stats.recentRegistrations}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Quick Actions */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             <div className="bg-white p-6 rounded-lg shadow-sm border">
//               <h3 className="text-lg font-medium text-gray-900 mb-4">
//                 Quick Actions
//               </h3>
//               <div className="space-y-3">
//                 <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
//                   <div className="flex items-center">
//                     <svg
//                       className="w-5 h-5 text-blue-600 mr-3"
//                       fill="currentColor"
//                       viewBox="0 0 20 20"
//                     >
//                       <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
//                     </svg>
//                     <span>Manage User Accounts</span>
//                   </div>
//                 </button>
//                 <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
//                   <div className="flex items-center">
//                     <svg
//                       className="w-5 h-5 text-green-600 mr-3"
//                       fill="currentColor"
//                       viewBox="0 0 20 20"
//                     >
//                       <path
//                         fillRule="evenodd"
//                         d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
//                         clipRule="evenodd"
//                       />
//                     </svg>
//                     <span>Review Alumni Verifications</span>
//                   </div>
//                 </button>
//                 <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
//                   <div className="flex items-center">
//                     <svg
//                       className="w-5 h-5 text-purple-600 mr-3"
//                       fill="currentColor"
//                       viewBox="0 0 20 20"
//                     >
//                       <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
//                       <path
//                         fillRule="evenodd"
//                         d="M4 5a2 2 0 012-2v1a2 2 0 002 2h2a2 2 0 002-2V3a2 2 0 012 2v6h-3a2 2 0 00-2 2v3H6a2 2 0 01-2-2V5zM14 17a1 1 0 102 0v-3a1 1 0 00-1-1h-1v4z"
//                         clipRule="evenodd"
//                       />
//                     </svg>
//                     <span>Generate Reports</span>
//                   </div>
//                 </button>
//                 <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
//                   <div className="flex items-center">
//                     <svg
//                       className="w-5 h-5 text-red-600 mr-3"
//                       fill="currentColor"
//                       viewBox="0 0 20 20"
//                     >
//                       <path
//                         fillRule="evenodd"
//                         d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
//                         clipRule="evenodd"
//                       />
//                     </svg>
//                     <span>System Settings</span>
//                   </div>
//                 </button>
//               </div>
//             </div>

//             <div className="bg-white p-6 rounded-lg shadow-sm border">
//               <h3 className="text-lg font-medium text-gray-900 mb-4">
//                 Recent Activity
//               </h3>
//               <div className="space-y-4">
//                 <div className="border-l-4 border-blue-500 pl-4">
//                   <p className="text-sm text-gray-600">
//                     New student registration
//                   </p>
//                   <p className="text-xs text-gray-500">2 hours ago</p>
//                 </div>
//                 <div className="border-l-4 border-green-500 pl-4">
//                   <p className="text-sm text-gray-600">
//                     Alumni verification approved
//                   </p>
//                   <p className="text-xs text-gray-500">4 hours ago</p>
//                 </div>
//                 <div className="border-l-4 border-yellow-500 pl-4">
//                   <p className="text-sm text-gray-600">
//                     Verification pending review
//                   </p>
//                   <p className="text-xs text-gray-500">6 hours ago</p>
//                 </div>
//                 <div className="border-l-4 border-purple-500 pl-4">
//                   <p className="text-sm text-gray-600">
//                     New job posting created
//                   </p>
//                   <p className="text-xs text-gray-500">1 day ago</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     </ProtectedRoute>
//   );
// }
