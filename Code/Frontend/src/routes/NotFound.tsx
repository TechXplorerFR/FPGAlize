import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-6">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-xl text-gray-500 mt-4">Page Not Found</p>
      <p className="text-md text-gray-400 mt-2">The page you are looking for doesn't exist or has been moved.</p>
      <Button className="mt-6" onClick={() => navigate("/")}>Go Home</Button>
    </div>
  );
}