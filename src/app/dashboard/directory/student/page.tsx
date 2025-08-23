"use client";
// Alias wrapper so singular path redirects/loads plural implementation
import StudentDirectoryPage from "../students/page";
export default function StudentDirectoryAlias() {
  return <StudentDirectoryPage />;
}
