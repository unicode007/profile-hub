import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X, Plus, Trash2, Loader2, Settings2, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  isOpen: boolean;
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
  { value: "<=", label: "≤" },
  { value: ">=", label: "≥" },
  { value: "==", label: "=" },
  { value: "<", label: "<" },
  { value: ">", label: ">" },
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
    await new Promise((r) => setTimeout(r, 500));
    const field = MOCK_API_RESPONSES[policyId];
    if (field) {
      setActivePolicies((prev) => [
        ...prev,
        {
          policyId, field, booleanValue: false, chargeValue: "", chargeType: "fixed",
          timeValue: "", percentageValue: "",
          rules: field.inputType === "rule" ? defaultRules() : [],
          isOpen: true,
        },
      ]);
    }
    setLoadingId(null);
  };

  const removePolicy = (policyId: string) =>
    setActivePolicies((prev) => prev.filter((p) => p.policyId !== policyId));

  const updatePolicy = (policyId: string, updates: Partial<ActivePolicy>) =>
    setActivePolicies((prev) => prev.map((p) => (p.policyId === policyId ? { ...p, ...updates } : p)));

  const updateRule = (policyId: string, ruleId: string, field: keyof RuleRow, value: string | number) =>
    setActivePolicies((prev) =>
      prev.map((p) =>
        p.policyId === policyId
          ? { ...p, rules: p.rules.map((r) => (r.id === ruleId ? { ...r, [field]: value } : r)) }
          : p
      )
    );

  const addRule = (policyId: string) =>
    setActivePolicies((prev) =>
      prev.map((p) =>
        p.policyId === policyId
          ? { ...p, rules: [...p.rules, { id: crypto.randomUUID(), operator: "<=", condition_value: "", charge_type: "percentage", charge_value: 0 }] }
          : p
      )
    );

  const removeRule = (policyId: string, ruleId: string) =>
    setActivePolicies((prev) =>
      prev.map((p) => (p.policyId === policyId ? { ...p, rules: p.rules.filter((r) => r.id !== ruleId) } : p))
    );

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
    alert("Saved! Check console.");
  };

  const availablePolicies = POLICY_LIST.filter((p) => !activePolicies.some((ap) => ap.policyId === p.id));

  const renderInlineField = (policy: ActivePolicy) => {
    const { field, policyId } = policy;

    if (field.inputType === "boolean") {
      return (
        <div className="flex items-center gap-2">
          <Checkbox id={field.code} checked={policy.booleanValue}
            onCheckedChange={(v) => updatePolicy(policyId, { booleanValue: !!v })} />
          <Label htmlFor={field.code} className="text-xs cursor-pointer">{field.name}</Label>
        </div>
      );
    }

    if (field.inputType === "number") {
      return (
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" placeholder="Value" className="h-8 text-xs"
            value={policy.chargeValue} onChange={(e) => updatePolicy(policyId, { chargeValue: e.target.value })} />
          <Select value={policy.chargeType} onValueChange={(v) => updatePolicy(policyId, { chargeType: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed</SelectItem>
              <SelectItem value="percentage">Percentage</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (field.inputType === "time") {
      return <Input type="time" className="h-8 text-xs max-w-[140px]" value={policy.timeValue}
        onChange={(e) => updatePolicy(policyId, { timeValue: e.target.value })} />;
    }

    if (field.inputType === "percentage") {
      return (
        <div className="relative max-w-[140px]">
          <Input type="number" placeholder="%" className="h-8 text-xs pr-7" value={policy.percentageValue}
            onChange={(e) => updatePolicy(policyId, { percentageValue: e.target.value })} />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[10px]">%</span>
        </div>
      );
    }

    if (field.inputType === "rule") {
      return (
        <div className="space-y-2 w-full">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => addRule(policyId)} className="h-7 gap-1 text-[10px] px-2">
              <Plus className="h-3 w-3" /> Rule
            </Button>
          </div>
          <div className="rounded border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-[10px] py-1.5 px-2 min-w-[80px]">Op</TableHead>
                  <TableHead className="text-[10px] py-1.5 px-2 min-w-[70px]">Hrs</TableHead>
                  <TableHead className="text-[10px] py-1.5 px-2 min-w-[90px]">Type</TableHead>
                  <TableHead className="text-[10px] py-1.5 px-2 min-w-[70px]">Val</TableHead>
                  <TableHead className="w-8 py-1.5 px-1" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {policy.rules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-3 text-[10px]">
                      No rules yet
                    </TableCell>
                  </TableRow>
                ) : (
                  policy.rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="p-1">
                        <Select value={rule.operator} onValueChange={(v) => updateRule(policyId, rule.id, "operator", v)}>
                          <SelectTrigger className="h-7 text-[11px] px-2"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {OPERATORS.map((op) => (
                              <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="p-1">
                        <Input type="number" className="h-7 text-[11px] px-2" value={rule.condition_value}
                          onChange={(e) => updateRule(policyId, rule.id, "condition_value", e.target.value)} />
                      </TableCell>
                      <TableCell className="p-1">
                        <Select value={rule.charge_type} onValueChange={(v) => updateRule(policyId, rule.id, "charge_type", v)}>
                          <SelectTrigger className="h-7 text-[11px] px-2"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">Fixed</SelectItem>
                            <SelectItem value="percentage">%</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="p-1">
                        <Input type="number" className="h-7 text-[11px] px-2" value={rule.charge_value}
                          onChange={(e) => updateRule(policyId, rule.id, "charge_value", Number(e.target.value))} />
                      </TableCell>
                      <TableCell className="p-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive"
                          onClick={() => removeRule(policyId, rule.id)}>
                          <Trash2 className="h-3 w-3" />
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
    }

    return null;
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="pb-3 px-4 pt-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings2 className="h-4 w-4 text-primary" />
          Policy Configurator
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        {/* Selector */}
        <div className="flex items-center gap-2">
          <Select value="" onValueChange={handlePolicySelect} disabled={availablePolicies.length === 0 || !!loadingId}>
            <SelectTrigger className="h-9 text-xs flex-1">
              <SelectValue placeholder={availablePolicies.length === 0 ? "All policies added" : "Add a policy..."} />
            </SelectTrigger>
            <SelectContent>
              {availablePolicies.map((p) => (
                <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {loadingId && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />}
        </div>

        {/* Active policies */}
        {activePolicies.length > 0 && <Separator />}

        <div className="space-y-2">
          {activePolicies.map((policy) => (
            <Collapsible
              key={policy.policyId}
              open={policy.isOpen}
              onOpenChange={(open) => updatePolicy(policy.policyId, { isOpen: open })}
            >
              <div className="rounded-lg border border-border bg-muted/20 overflow-hidden">
                {/* Header row */}
                <div className="flex items-center gap-2 px-3 py-2">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                      {policy.isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </Button>
                  </CollapsibleTrigger>
                  <span className="text-xs font-medium truncate flex-1">{policy.field.name}</span>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 shrink-0">
                    {policy.field.inputType}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removePolicy(policy.policyId)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Collapsible body */}
                <CollapsibleContent>
                  <div className="px-3 pb-3 pt-1">
                    {renderInlineField(policy)}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>

        {activePolicies.length > 0 && (
          <Button onClick={handleSaveAll} size="sm" className="w-full text-xs h-8">
            Save All Policies
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
