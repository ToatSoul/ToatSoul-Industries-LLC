
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Project } from "@shared/schema";

export default function Projects() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", description: "", maxMembers: 5 });

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const createProject = useMutation({
    mutationFn: async (project: typeof newProject) => {
      return apiRequest("POST", "/api/projects", project);
    },
    onSuccess: () => {
      setIsCreateOpen(false);
      toast({
        title: "Project created",
        description: "Your project has been created successfully.",
      });
    },
  });

  const joinProject = useMutation({
    mutationFn: async (projectId: number) => {
      return apiRequest("POST", `/api/projects/${projectId}/join`);
    },
    onSuccess: () => {
      toast({
        title: "Joined project",
        description: "You have successfully joined the project.",
      });
    },
  });

  const handleCreateProject = () => {
    createProject.mutate(newProject);
  };

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Collaborative Projects</h1>
        <Button onClick={() => setIsCreateOpen(true)}>Create Project</Button>
      </div>

      <Tabs defaultValue="open" className="space-y-4">
        <TabsList>
          <TabsTrigger value="open">Open Projects</TabsTrigger>
          <TabsTrigger value="my">My Projects</TabsTrigger>
          <TabsTrigger value="joined">Joined Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects?.filter(p => p.status === "open").map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onJoin={() => joinProject.mutate(project.id)}
            />
          ))}
        </TabsContent>

        <TabsContent value="my" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects?.filter(p => p.ownerId === user?.id).map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              isOwner
            />
          ))}
        </TabsContent>

        <TabsContent value="joined" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects?.filter(p => p.members?.some(m => m.userId === user?.id)).map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              isMember
            />
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Project Title"
              value={newProject.title}
              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
            />
            <Textarea
              placeholder="Project Description"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Max Members"
              value={newProject.maxMembers}
              onChange={(e) => setNewProject({ ...newProject, maxMembers: parseInt(e.target.value) })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateProject}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function ProjectCard({ project, onJoin, isOwner, isMember }: {
  project: Project;
  onJoin?: () => void;
  isOwner?: boolean;
  isMember?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{project.title}</CardTitle>
          <Badge variant={project.status === "open" ? "secondary" : "outline"}>
            {project.status}
          </Badge>
        </div>
        <CardDescription>Created by {project.owner?.username}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{project.description}</p>
        <div className="mt-4 flex items-center gap-2">
          <Badge variant="outline">
            {project.members?.length || 0}/{project.maxMembers} members
          </Badge>
        </div>
      </CardContent>
      <CardFooter>
        {!isOwner && !isMember && project.status === "open" && (
          <Button onClick={onJoin} className="w-full">Join Project</Button>
        )}
        {isOwner && (
          <Button variant="outline" className="w-full">Manage Project</Button>
        )}
        {isMember && (
          <Button variant="outline" className="w-full">View Details</Button>
        )}
      </CardFooter>
    </Card>
  );
}
