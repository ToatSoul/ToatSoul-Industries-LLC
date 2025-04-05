
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
import { Label } from "@/components/ui/label";
import type { Project, ProjectInvitation } from "@shared/schema";

export default function Projects() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({ title: "", description: "", maxMembers: 5 });
  const [inviteEmail, setInviteEmail] = useState("");

  const { data: projects, isLoading, refetch } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: invitations } = useQuery<ProjectInvitation[]>({
    queryKey: ["/api/projects/invitations"],
  });

  const createProject = useMutation({
    mutationFn: async (project: typeof newProject) => {
      return apiRequest("POST", "/api/projects", project);
    },
    onSuccess: () => {
      setIsCreateOpen(false);
      refetch();
      toast({
        title: "Project created",
        description: "Your project has been created successfully.",
      });
    },
  });

  const inviteToProject = useMutation({
    mutationFn: async ({ projectId, email }: { projectId: number; email: string }) => {
      return apiRequest("POST", `/api/projects/${projectId}/invite`, { email });
    },
    onSuccess: () => {
      setIsInviteOpen(false);
      setInviteEmail("");
      toast({
        title: "Invitation sent",
        description: "Project invitation has been sent successfully.",
      });
    },
  });

  const handleCreateProject = () => {
    createProject.mutate(newProject);
  };

  const handleInvite = () => {
    if (selectedProject && inviteEmail) {
      inviteToProject.mutate({ projectId: selectedProject.id, email: inviteEmail });
    }
  };

  const openInviteDialog = (project: Project) => {
    setSelectedProject(project);
    setIsInviteOpen(true);
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
          <TabsTrigger value="invites">Invitations</TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects?.filter(p => p.status === "open").map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onInvite={() => openInviteDialog(project)}
              isOwner={project.ownerId === user?.id}
            />
          ))}
        </TabsContent>

        <TabsContent value="my" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects?.filter(p => p.ownerId === user?.id).map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onInvite={() => openInviteDialog(project)}
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

        <TabsContent value="invites" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {invitations?.map(invitation => (
            <InvitationCard
              key={invitation.id}
              invitation={invitation}
              onAccept={() => {/* Implement accept */}}
              onReject={() => {/* Implement reject */}}
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
            <div>
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                placeholder="Project Title"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Project Description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="maxMembers">Max Members</Label>
              <Input
                id="maxMembers"
                type="number"
                min={2}
                max={10}
                value={newProject.maxMembers}
                onChange={(e) => setNewProject({ ...newProject, maxMembers: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateProject}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite to Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
            <Button onClick={handleInvite}>Send Invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function ProjectCard({ project, onInvite, isOwner, isMember }: {
  project: Project;
  onInvite?: () => void;
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
        {isOwner && (
          <div className="flex gap-2 w-full">
            <Button onClick={onInvite} className="flex-1">Invite Members</Button>
            <Button variant="outline" className="flex-1">Manage Project</Button>
          </div>
        )}
        {!isOwner && !isMember && project.status === "open" && (
          <Button className="w-full">Request to Join</Button>
        )}
        {isMember && (
          <Button variant="outline" className="w-full">View Details</Button>
        )}
      </CardFooter>
    </Card>
  );
}

function InvitationCard({ invitation, onAccept, onReject }: {
  invitation: ProjectInvitation;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Invitation</CardTitle>
        <CardDescription>You've been invited to join a project</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Invited by: {invitation.invitedBy?.username}
        </p>
        <p className="text-sm text-muted-foreground">
          Project: {invitation.project?.title}
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button onClick={onAccept} className="flex-1">Accept</Button>
        <Button variant="outline" onClick={onReject} className="flex-1">Decline</Button>
      </CardFooter>
    </Card>
  );
}
