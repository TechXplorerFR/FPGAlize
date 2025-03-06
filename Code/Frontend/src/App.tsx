import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function App() {
  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <Tabs defaultValue="student" className="w-[25vw]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="student">Student</TabsTrigger>
          <TabsTrigger value="teacher">Teacher</TabsTrigger>
        </TabsList>
        <TabsContent value="student">
          <Card>
            <CardHeader>
              <CardTitle>Student</CardTitle>
              <CardDescription>
                Please fill in the following fields to join your room:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name">Room ID:</Label>
                <Input id="name" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="username">Name:</Label>
                <Input id="username" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password:</Label>
                <Input id="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Join Room</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="teacher">
          <Card>
            <CardHeader>
              <CardTitle>Teacher</CardTitle>
              <CardDescription>
                Fill in the follwing fields to create your room
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="current">Room Name:</Label>
                <Input id="current" type="password" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new">Password (optional):</Label>
                <Input id="new" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Create Room</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default App;
