import Image from "next/image";
import SugUpPage from "./auth/signUp/page";
import LandingPage from "@/page";

export default function Home() {
  return (
    
    <div className="flex w-full min-h-screen bg-gray-100 items-center justify-center p-4">
      <LandingPage/>

    </div>
  );
}
