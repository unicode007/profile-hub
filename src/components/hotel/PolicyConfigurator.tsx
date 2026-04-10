import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X, Plus, Trash2, Loader2, Settings2 } from "lucide-react";
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

interface ActivePolicy {
  policyId: string;
  field: PolicyField;
  booleanValue: boolean;
  chargeValue: string;
  chargeType: string;
  timeValue: string;
  percentageValue: string;
  rules: RuleRow[];
}

const POLICY_LIST = [
  { id: "pol_1", name: "Pet Allowed" },
  { id: "pol_2", name: "Pet Charge" },
  { id: "pol_3", name: "Check-out Time" },
  { id: "pol_4", name: "Late Check-out Fee" },
  { id: "pol_5", name: "Cancellation Policy" },
];

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

const defaultRules = (): RuleRow[] => [
  { id: crypto.randomUUID(), operator: "<=", condition_value: "48", charge_type: "percentage", charge_value: 0 },
  { id: crypto.randomUUID(), operator: "<=", condition_value: "24", charge_type: "percentage", charge_value: 50 },
  { id: crypto.randomUUID(), operator: "<=", condition_value: "0", charge_type: "percentage", charge_value: 100 },
];

export const PolicyConfigurator: React.FC = () => {
  const [activePolicies, setActivePolicies] = useState<ActivePolicy[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handlePolicySelect = async (policyId: string) => {
    if (activePolicies.some((p) => p.policyId === policyId)) return;
    setLoadingId(policyId);
    await new Promise((r) => setTimeout(r, 600));
    const field = MOCK_API_RESPONSES[policyId];
    if (field) {
      setActivePolicies((prev) => [
        ...prev,
        {
          policyId,
          field,
          booleanValue: false,
          chargeValue: "",
          chargeType: "fixed",
          timeValue: "",
          percentageValue: "",
          rules: field.inputType === "rule" ? defaultRules() : [],
        },
      ]);
    }
    setLoadingId(null);
  };

  const removePolicy = (policyId: string) => {
    setActivePolicies((prev) => prev.filter((p) => p.policyId !== policyId));
  };

  const updatePolicy = (policyId: string, updates: Partial<ActivePolicy>) => {
    setActivePolicies((prev) =>
      prev.map((p) => (p.policyId === policyId ? { ...p, ...updates } : p))
    );
  };

  const updateRule = (policyId: string, ruleId: string, field: keyof RuleRow, value: string | number) => {
    setActivePolicies((prev) =>
      prev.map((p) =>
        p.policyId === policyId
          ? { ...p, rules: p.rules.map((r) => (r.id === ruleId ? { ...r, [field]: value } : r)) }
          : p
      )
    );
  };

  const addRule = (policyId: string) => {
    setActivePolicies((prev) =>
      prev.map((p) =>
        p.policyId === policyId
          ? {
              ...p,
              rules: [
                ...p.rules,
                { id: crypto.randomUUID(), operator: "<=", condition_value: "", charge_type: "percentage", charge_value: 0 },
              ],
            }
          : p
      )
    );
  };

  const removeRule = (policyId: string, ruleId: string) => {
    setActivePolicies((prev) =>
      prev.map((p) =>
        p.policyId === policyId ? { ...p, rules: p.rules.filter((r) => r.id !== ruleId) } : p
      )
    );
  };

  const handleSaveAll = () => {
    const payload = activePolicies.map((p) => {
      const base: Record<string, any> = { code: p.field.code };
      switch (p.field.inputType) {
        case "boolean": base.value = p.booleanValue; break;
        case "number": base.charge_value = p.chargeValue; base.charge_type = p.chargeType; break;
        case "time": base.value = p.timeValue; break;
        case "percentage": base.value = p.percentageValue; break;
        case "rule": base.rules = p.rules.map(({ id, ...rest }) => rest); break;
      }
      return base;
    });
    console.log("Save payload:", payload);
    alert("Saved! Check console for payload.");
  };

  const availablePolicies = POLICY_LIST.filter(
    (p) => !activePolicies.some((ap) => ap.policyId === p.id)
  );

  const renderPolicyCard = (policy: ActivePolicy) => {
    const { field, policyId } = policy;

    return (
      <Card key={policyId} className="relative group">
        <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <CardTitle className="text-sm font-semibold truncate">{field.name}</CardTitle>
            <Badge variant="secondary" className="text-[10px] shrink-0">
              {field.category} · {field.inputType}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => removePolicy(policyId)}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          {field.inputType === "boolean" && (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
              <Checkbox
                id={field.code}
                checked={policy.booleanValue}
                onCheckedChange={(v) => updatePolicy(policyId, { booleanValue: !!v })}
              />
              <Label htmlFor={field.code} className="text-sm cursor-pointer">
                {field.name}
              </Label>
            </div>
          )}

          {field.inputType === "number" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Charge Value</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={policy.chargeValue}
                  onChange={(e) => updatePolicy(policyId, { chargeValue: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Charge Type</Label>
                <Select value={policy.chargeType} onValueChange={(v) => updatePolicy(policyId, { chargeType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {field.inputType === "time" && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{field.name}</Label>
              <Input
                type="time"
                value={policy.timeValue}
                onChange={(e) => updatePolicy(policyId, { timeValue: e.target.value })}
                className="max-w-[200px]"
              />
            </div>
          )}

          {field.inputType === "percentage" && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{field.name}</Label>
              <div className="relative max-w-[200px]">
                <Input
                  type="number"
                  placeholder="Enter %"
                  value={policy.percentageValue}
                  onChange={(e) => updatePolicy(policyId, { percentageValue: e.target.value })}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
            </div>
          )}

          {field.inputType === "rule" && (
            <div className="space-y-3">
              <div className="flex items-center justify-end">
                <Button variant="outline" size="sm" onClick={() => addRule(policyId)} className="gap-1 text-xs">
                  <Plus className="h-3 w-3" /> Add Rule
                </Button>
              </div>
              <div className="rounded-md border border-border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="min-w-[130px]">Operator</TableHead>
                      <TableHead className="min-w-[120px]">Hours Before</TableHead>
                      <TableHead className="min-w-[130px]">Charge Type</TableHead>
                      <TableHead className="min-w-[110px]">Value</TableHead>
                      <TableHead className="w-[50px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policy.rules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-6 text-sm">
                          No rules. Click "+ Add Rule" to begin.
                        </TableCell>
                      </TableRow>
                    ) : (
                      policy.rules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell className="p-1.5">
                            <Select value={rule.operator} onValueChange={(v) => updateRule(policyId, rule.id, "operator", v)}>
                              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {OPERATORS.map((op) => (
                                  <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="p-1.5">
                            <Input type="number" className="h-9 text-xs" value={rule.condition_value}
                              onChange={(e) => updateRule(policyId, rule.id, "condition_value", e.target.value)} placeholder="Hours" />
                          </TableCell>
                          <TableCell className="p-1.5">
                            <Select value={rule.charge_type} onValueChange={(v) => updateRule(policyId, rule.id, "charge_type", v)}>
                              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fixed">Fixed</SelectItem>
                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="p-1.5">
                            <Input type="number" className="h-9 text-xs" value={rule.charge_value}
                              onChange={(e) => updateRule(policyId, rule.id, "charge_value", Number(e.target.value))} placeholder="Value" />
                          </TableCell>
                          <TableCell className="p-1.5">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeRule(policyId, rule.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings2 className="h-5 w-5 text-primary" />
            Policy Configurator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Add Policy</Label>
            <Select
              value=""
              onValueChange={handlePolicySelect}
              disabled={availablePolicies.length === 0 || !!loadingId}
            >
              <SelectTrigger>
                <SelectValue placeholder={availablePolicies.length === 0 ? "All policies added" : "Choose a policy to add..."} />
              </SelectTrigger>
              <SelectContent>
                {availablePolicies.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loadingId && (
            <div className="flex items-center gap-2 py-4 justify-center text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading policy...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active policy cards */}
      <div className="grid grid-cols-1 gap-4">
        {activePolicies.map(renderPolicyCard)}
      </div>

      {activePolicies.length > 0 && (
        <Button onClick={handleSaveAll} className="w-full sm:w-auto">
          Save All Policies
        </Button>
      )}
    </div>
  );
};
