"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { submitDueDiligence } from "@/services/api";

export default function DueDiligenceForm() {
  const [data, setData] = useState({
    factory_utilization: "",
    inventory_status: "Normal",
    transparency: "High",
    general_notes: "",
  });

  const handleSubmit = async () => {
    try {
      await submitDueDiligence(data);
      alert("Due diligence submitted successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to submit.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Due Diligence Observation</CardTitle>
        <CardDescription>
          Record qualitative insights from site visits and promoter interviews.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Factory Utilization (%)</label>
            <Input
              type="number"
              placeholder="e.g. 75"
              value={data.factory_utilization}
              onChange={(e) => setData({ ...data, factory_utilization: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Inventory Status</label>
            <Tabs
              defaultValue="Normal"
              className="w-full"
              onValueChange={(v) => setData({ ...data, inventory_status: v })}
            >
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="Normal">Normal</TabsTrigger>
                <TabsTrigger value="Slow">Slow</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Detailed Observations</label>
          <Textarea
            placeholder="Enter credit officer notes here..."
            className="min-h-[100px]"
            value={data.general_notes}
            onChange={(e) => setData({ ...data, general_notes: e.target.value })}
          />
        </div>

        <Button onClick={handleSubmit} className="w-full">
          Save Observations
        </Button>
      </CardContent>
    </Card>
  );
}
