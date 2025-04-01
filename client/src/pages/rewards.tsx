import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";

export default function RewardsStore() {
  const { user } = useAuth();
  const { data: rewards } = useQuery({
    queryKey: ["/api/rewards"],
    enabled: !!user,
  });

  const handlePurchase = async (rewardId: number) => {
    try {
      await apiRequest("POST", "/api/rewards/purchase", { rewardId });
    } catch (error) {
      console.error("Failed to purchase reward:", error);
    }
  };

  if (!rewards) return null;

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Rewards Store</h1>
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
                disabled={!user || user.reputation < reward.cost}
              >
                Purchase
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}