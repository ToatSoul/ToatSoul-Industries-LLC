
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RewardItem, User } from "@shared/schema";
import { useUser } from "@/hooks/use-user";
import { toast } from "sonner";

export default function RewardsStore() {
  const { user } = useUser();
  const [rewardItems, setRewardItems] = useState<RewardItem[]>([]);

  useEffect(() => {
    fetch('/api/rewards')
      .then(res => res.json())
      .then(setRewardItems)
      .catch(() => toast.error("Failed to load rewards"));
  }, []);

  const purchaseReward = async (rewardId: number, cost: number) => {
    if (!user) {
      toast.error("Please log in to purchase rewards");
      return;
    }

    if (user.reputation < cost) {
      toast.error("Not enough reputation points");
      return;
    }

    try {
      const res = await fetch('/api/rewards/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId })
      });

      if (!res.ok) throw new Error();
      
      toast.success("Reward purchased successfully!");
    } catch {
      toast.error("Failed to purchase reward");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Rewards Store</h1>
        {user && (
          <div className="text-lg">
            Available Points: <span className="font-bold text-primary">{user.reputation}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewardItems.map(reward => (
          <Card key={reward.id}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                {reward.icon && (
                  <div className="text-3xl">{reward.icon}</div>
                )}
                <div>
                  <h3 className="text-xl font-semibold">{reward.name}</h3>
                  <p className="text-sm text-muted-foreground">{reward.type}</p>
                </div>
              </div>
              <p className="mb-4 text-muted-foreground">{reward.description}</p>
              <div className="flex justify-between items-center">
                <div className="text-lg font-semibold">{reward.cost} points</div>
                <Button 
                  onClick={() => purchaseReward(reward.id, reward.cost)}
                  disabled={!user || user.reputation < reward.cost}
                >
                  Purchase
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
