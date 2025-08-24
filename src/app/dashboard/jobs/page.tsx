import { redirect } from "next/navigation";

export default function JobsIndexRedirect() {
  redirect("/dashboard/jobs/uploaded");
}
