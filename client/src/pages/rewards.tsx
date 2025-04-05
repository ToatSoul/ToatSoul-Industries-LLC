
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function RewardsStore() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: rewards } = useQuery({
    queryKey: ["/api/rewards"],
  });

  const handlePurchase = async (rewardId: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to purchase rewards",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("POST", "/api/rewards/purchase", { rewardId });
      toast({
        title: "Success",
        description: "Reward purchased successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error purchasing reward",
        description: error.message || "Failed to purchase reward",
        variant: "destructive",
      });
    }
  };

  if (!rewards) return null;

  return (
    <main className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Rewards Store</h1>
        {user && (
          <div className="text-lg">
            Available Points: <span className="font-bold text-primary">{user.reputation || 0}</span>
          </div>
        )}
      </div>
      {!user && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-yellow-800">Please log in to purchase rewards</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => (
          <Card key={reward.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>{reward.icon}</span>
                <span>{reward.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-gray-600">{reward.description}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <div className="text-sm font-semibold">{reward.cost} points</div>
              <Button
                onClick={() => handlePurchase(reward.id)}
                disabled={!user || (user && user.reputation < reward.cost)}
              >
                {!user ? "Login to Purchase" : "Purchase"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
