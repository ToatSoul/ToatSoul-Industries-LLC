
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Lock, Check } from "lucide-react";

export default function RewardsCorner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: rewards } = useQuery({
    queryKey: ["/api/rewards"],
  });

  const handleClaim = async (rewardId: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to claim rewards",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("POST", "/api/rewards/purchase", { rewardId });
      toast({
        title: "Success",
        description: "Reward claimed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error claiming reward",
        description: error.message || "Failed to claim reward",
        variant: "destructive",
      });
    }
  };

  if (!rewards) return null;

  return (
    <main className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Rewards Corner</h1>
        {user && (
          <div className="text-lg">
            Your Reputation: <span className="font-bold text-primary">{user.reputation || 0}</span>
          </div>
        )}
      </div>
      
      {!user && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-yellow-800">Please log in to view and claim rewards</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => {
          const isUnlocked = user && user.reputation >= reward.cost;
          
          return (
            <Card key={reward.id} className={`flex flex-col ${!isUnlocked ? 'opacity-75' : ''}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>{reward.icon}</span>
                  <span>{reward.name}</span>
                  {isUnlocked && <Check className="h-5 w-5 text-green-500" />}
                  {!isUnlocked && <Lock className="h-5 w-5 text-gray-400" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-gray-600">{reward.description}</p>
                <div className="mt-4 h-2 bg-gray-100 rounded-full">
                  <div 
                    className="h-2 bg-primary rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(100, (user?.reputation || 0) / reward.cost * 100)}%`
                    }}
                  />
                </div>
                <p className="text-sm mt-2 text-gray-500">
                  {user ? (
                    `${user.reputation || 0} / ${reward.cost} reputation points`
                  ) : (
                    `${reward.cost} reputation points required`
                  )}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  onClick={() => handleClaim(reward.id)}
                  disabled={!user || !isUnlocked}
                >
                  {!user ? "Login to Claim" : isUnlocked ? "Claim Reward" : "Locked"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
