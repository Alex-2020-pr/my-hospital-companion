import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Brain, ShieldAlert, Heart, Calculator } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlasgowCalculator } from "@/components/calculators/GlasgowCalculator";
import { BradenCalculator } from "@/components/calculators/BradenCalculator";
import { CHA2DS2VAScCalculator } from "@/components/calculators/CHA2DS2VAScCalculator";

export default function MedicalCalculators() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("glasgow");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            <h1 className="text-xl font-bold">Calculadoras Médicas</h1>
          </div>
        </div>
      </header>

      <div className="p-4 pb-24">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="glasgow" className="flex items-center gap-1 text-xs">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Glasgow</span>
            </TabsTrigger>
            <TabsTrigger value="braden" className="flex items-center gap-1 text-xs">
              <ShieldAlert className="h-4 w-4" />
              <span className="hidden sm:inline">Braden</span>
            </TabsTrigger>
            <TabsTrigger value="cha2ds2" className="flex items-center gap-1 text-xs">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">CHA₂DS₂</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="glasgow">
            <GlasgowCalculator />
          </TabsContent>

          <TabsContent value="braden">
            <BradenCalculator />
          </TabsContent>

          <TabsContent value="cha2ds2">
            <CHA2DS2VAScCalculator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
