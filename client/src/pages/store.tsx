
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";

// Template data for store items
const hardwareTemplates = [
  {
    id: 1,
    name: "Home Server Starter Kit",
    description: "Perfect for beginners: Includes Raspberry Pi 4 (4GB), case, power supply, and 128GB SD card",
    price: 149.99,
    category: "starter"
  },
  {
    id: 2,
    name: "Smart Home Hub Bundle",
    description: "Complete smart home solution: Hub controller, 4 smart plugs, 2 motion sensors, and bridge",
    price: 299.99,
    category: "smarthome"
  },
  {
    id: 3,
    name: "NAS Storage Solution",
    description: "2-bay NAS enclosure with 2x 4TB NAS drives pre-configured for redundancy",
    price: 599.99,
    category: "storage"
  }
];

const softwareTemplates = [
  {
    id: 1,
    name: "Home Automation Suite",
    description: "Premium software package for managing your smart home devices with advanced automation",
    price: 49.99,
    license: "yearly"
  },
  {
    id: 2,
    name: "Media Server License",
    description: "Self-hosted media server software with streaming capabilities",
    price: 79.99,
    license: "lifetime"
  },
  {
    id: 3,
    name: "Network Monitoring Tool",
    description: "Professional-grade network monitoring and management software",
    price: 29.99,
    license: "monthly"
  }
];

export default function Store() {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">TSI Store</h1>
      </div>
      
      <Tabs defaultValue="hardware" className="space-y-4">
        <TabsList>
          <TabsTrigger value="hardware">Hardware Solutions</TabsTrigger>
          <TabsTrigger value="software">Software Solutions</TabsTrigger>
        </TabsList>

        <TabsContent value="hardware" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hardwareTemplates.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle>{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">${item.price}</span>
                    <Button>Add to Cart</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="software" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {softwareTemplates.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle>{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xl font-bold">${item.price}</span>
                      <span className="text-sm text-muted-foreground">/{item.license}</span>
                    </div>
                    <Button>Purchase License</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
