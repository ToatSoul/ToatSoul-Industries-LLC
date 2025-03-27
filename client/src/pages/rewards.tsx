
import { Card, CardContent } from "@/components/ui/card";

export default function RewardsStore() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold text-foreground text-center">Rewards Store</h1>
          <p className="mt-4 text-lg text-muted-foreground text-center">
            Earn points by participating in discussions and redeem them for exclusive rewards!
          </p>
          <p className="mt-2 text-sm text-muted-foreground text-center">
            Coming Soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
