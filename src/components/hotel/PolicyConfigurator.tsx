import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PolicyField {
  name: string;
  code: string;
  category: string;
  inputType: "boolean" | "number" | "time" | "percentage" | "rule";
  unit?: string;
}

interface RuleRow {
  id: string;
  operator: string;
  condition_value: string;
  charge_type: string;
  charge_value: number;
}

// Mock policy list
const POLICY_LIST = [
  { id: "pol_1", name: "Pet Allowed" },
  { id: "pol_2", name: "Pet Charge" },
  { id: "pol_3", name: "Check-out Time" },
  { id: "pol_4", name: "Late Check-out Fee" },
  { id: "pol_5", name: "Cancellation Policy" },
];

// Mock API responses per policy id
const MOCK_API_RESPONSES: Record<string, PolicyField> = {
  pol_1: { name: "Pet Allowed", code: "PET_ALLOWED", category: "pet", inputType: "boolean" },
  pol_2: { name: "Pet Charge", code: "PET_CHARGE", category: "pet", inputType: "number", unit: "amount" },
  pol_3: { name: "Check-out Time", code: "CHECKOUT_TIME", category: "checkin", inputType: "time" },
  pol_4: { name: "Late Check-out Fee", code: "LATE_CHECKOUT_FEE", category: "checkin", inputType: "percentage" },
  pol_5: { name: "Cancellation Policy", code: "CANCELLATION_POLICY", category: "cancellation", inputType: "rule" },
};

const OPERATORS = [
  { value: "<=", label: "<= (Less than or equal)" },
  { value: ">=", label: ">= (Greater than or equal)" },
  { value: "==", label: "== (Equal)" },
  { value: "<", label: "< (Less than)" },
  { value: ">", label: "> (Greater than)" },
];

export const PolicyConfigurator: React.FC = () => {
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [policyField, setPolicyField] = useState<PolicyField | null>(null);

  // Field values
  const [booleanValue, setBooleanValue] = useState(false);
  const [chargeValue, setChargeValue] = useState("");
  const [chargeType, setChargeType] = useState("fixed");
  const [timeValue, setTimeValue] = useState("");
  const [percentageValue, setPercentageValue] = useState("");
  const [rules, setRules] = useState<RuleRow[]>([
    { id: crypto.randomUUID(), operator: "<=", condition_value: "48", charge_type: "percentage", charge_value: 0 },
    { id: crypto.randomUUID(), operator: "<=", condition_value: "24", charge_type: "percentage", charge_value: 50 },
    { id: crypto.randomUUID(), operator: "<=", condition_value: "0", charge_type: "percentage", charge_value: 100 },
  ]);

  const handlePolicySelect = async (policyId: string) => {
    setSelectedPolicyId(policyId);
    setLoading(true);
    setPolicyField(null);

    // Simulate API call
    await new Promise((r) => setTimeout(r, 600));
    const response = MOCK_API_RESPONSES[policyId];
    setPolicyField(response || null);
    setLoading(false);
  };

  const addRule = () => {
    setRules((prev) => [
      ...prev,
      { id: crypto.randomUUID(), operator: "<=", condition_value: "", charge_type: "percentage", charge_value: 0 },
    ]);
  };

  const removeRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRule = (id: string, field: keyof RuleRow, value: string | number) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleSave = () => {
    if (!policyField) return;
    let payload: Record<string, any> = { code: policyField.code };

    switch (policyField.inputType) {
      case "boolean":
        payload.value = booleanValue;
        break;
      case "number":
        payload.charge_value = chargeValue;
        payload.charge_type = chargeType;
        break;
      case "time":
        payload.value = timeValue;
        break;
      case "percentage":
        payload.value = percentageValue;
        break;
      case "rule":
        payload.rules = rules.map(({ id, ...rest }) => rest);
        break;
    }
    console.log("Save payload:", payload);
    alert("Saved! Check console for payload.");
  };

  const renderField = () => {
    if (!policyField) return null;

    switch (policyField.inputType) {
      case "boolean":
        return (
          <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card">
            <Checkbox
              id={policyField.code}
              checked={booleanValue}
              onCheckedChange={(v) => setBooleanValue(!!v)}
            />
            <Label htmlFor={policyField.code} className="text-sm font-medium cursor-pointer">
              {policyField.name}
            </Label>
          </div>
        );

      case "number":
        return (
          <div className="space-y-4 p-4 rounded-lg border border-border bg-card">
            <Label className="text-sm font-medium">{policyField.name}</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Charge Value</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={chargeValue}
                  onChange={(e) => setChargeValue(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Charge Type</Label>
                <Select value={chargeType} onValueChange={setChargeType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case "time":
        return (
          <div className="space-y-1.5 p-4 rounded-lg border border-border bg-card">
            <Label className="text-sm font-medium">{policyField.name}</Label>
            <Input
              type="time"
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
              className="max-w-[200px]"
            />
          </div>
        );

      case "percentage":
        return (
          <div className="space-y-1.5 p-4 rounded-lg border border-border bg-card">
            <Label className="text-sm font-medium">{policyField.name}</Label>
            <div className="relative max-w-[200px]">
              <Input
                type="number"
                placeholder="Enter %"
                value={percentageValue}
                onChange={(e) => setPercentageValue(e.target.value)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
            </div>
          </div>
        );

      case "rule":
        return (
          <div className="space-y-3 p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{policyField.name}</Label>
              <Button variant="outline" size="sm" onClick={addRule} className="gap-1">
                <Plus className="h-3.5 w-3.5" /> Add Rule
              </Button>
            </div>
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[140px]">Operator</TableHead>
                    <TableHead className="w-[140px]">Hours Before</TableHead>
                    <TableHead className="w-[150px]">Charge Type</TableHead>
                    <TableHead className="w-[130px]">Value</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No rules added. Click "+ Add Rule" to begin.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="p-2">
                          <Select value={rule.operator} onValueChange={(v) => updateRule(rule.id, "operator", v)}>
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {OPERATORS.map((op) => (
                                <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            type="number"
                            className="h-9"
                            value={rule.condition_value}
                            onChange={(e) => updateRule(rule.id, "condition_value", e.target.value)}
                            placeholder="Hours"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Select value={rule.charge_type} onValueChange={(v) => updateRule(rule.id, "charge_type", v)}>
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fixed">Fixed</SelectItem>
                              <SelectItem value="percentage">Percentage (%)</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            type="number"
                            className="h-9"
                            value={rule.charge_value}
                            onChange={(e) => updateRule(rule.id, "charge_value", Number(e.target.value))}
                            placeholder="Value"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeRule(rule.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <X className="h-5 w-5 text-destructive" />
          Policy Configurator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Policy selector */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Select Policy</Label>
          <Select value={selectedPolicyId} onValueChange={handlePolicySelect}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a policy..." />
            </SelectTrigger>
            <SelectContent>
              {POLICY_LIST.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center gap-2 py-6 justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading policy fields...
          </div>
        )}

        {/* Dynamic field */}
        {!loading && policyField && (
          <>
            <Badge variant="secondary" className="text-xs">
              {policyField.category} · {policyField.inputType}
            </Badge>
            {renderField()}
            <Button onClick={handleSave} className="w-full sm:w-auto">Save Policy</Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
