import { Button } from "@/components/ui/button";
import { UserButton } from "@stackframe/stack";
import Image from "next/image";

export default function Home() {
  return (
    <div> 
      <h2>Subscribe to Dev's Project</h2>
      <Button variant={'destructive'}>CLICK ME</Button>
      <UserButton />
    </div>
  );
}
