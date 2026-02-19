import { useMemo, useState } from "react";
import { format, isValid, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { z } from "zod";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const dateTimeSchema = z.object({
  startDate: z.date({ required_error: "Start date is required." }),
  dob: z
    .date({ required_error: "Date of birth is required." })
    .max(new Date(), "Date of birth must be in the past."),
  stay: z.object({
    from: z.date({ required_error: "Range start is required." }),
    to: z.date({ required_error: "Range end is required." }),
  }),
});

type PickerSize = "sm" | "md" | "lg";

interface PickerButtonProps {
  value?: Date;
  placeholder: string;
  size: PickerSize;
  error?: string;
}

const pickerSizeClass: Record<PickerSize, string> = {
  sm: "h-8 text-xs",
  md: "h-10 text-sm",
  lg: "h-12 text-base",
};

function DatePickerButton({ value, placeholder, size, error }: PickerButtonProps) {
  return (
    <Button
      variant="outline"
      className={cn(
        "w-full justify-start text-left font-normal",
        !value && "text-muted-foreground",
        pickerSizeClass[size],
        error && "border-destructive",
      )}
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      {value ? format(value, "PPP") : placeholder}
    </Button>
  );
}

function parseNaturalDate(input: string) {
  const normalized = input.trim().toLowerCase();

  if (!normalized) return undefined;

  if (normalized === "today") return new Date();
  if (normalized === "tomorrow") {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  if (normalized === "next week") {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek;
  }

  const parsed = parse(input, "MMMM d, yyyy", new Date());
  if (isValid(parsed)) return parsed;

  const isoParsed = new Date(input);
  return isValid(isoParsed) ? isoParsed : undefined;
}

function FormikFriendlyDateField({
  fieldName,
  value,
  touched,
  error,
  onChange,
}: {
  fieldName: string;
  value?: Date;
  touched?: boolean;
  error?: string;
  onChange: (name: string, next: Date | undefined) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{fieldName}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <DatePickerButton
            value={value}
            placeholder="Select date"
            size="md"
            error={touched ? error : undefined}
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={value} onSelect={(date) => onChange(fieldName, date)} initialFocus />
        </PopoverContent>
      </Popover>
      {touched && error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export function DatePickerShowcase() {
  const [size, setSize] = useState<PickerSize>("md");
  const [formatPattern, setFormatPattern] = useState("PPP");

  const [basicDate, setBasicDate] = useState<Date>();
  const [naturalInput, setNaturalInput] = useState("");
  const [naturalDate, setNaturalDate] = useState<Date>();
  const [naturalError, setNaturalError] = useState<string>();

  const [time, setTime] = useState("09:00");
  const [dateTimeDate, setDateTimeDate] = useState<Date>();
  const [singleUnitDateTime, setSingleUnitDateTime] = useState("");

  const [dob, setDob] = useState<Date>();
  const [travelRange, setTravelRange] = useState<DateRange>();
  const [textDateInput, setTextDateInput] = useState("");
  const [textInputDate, setTextInputDate] = useState<Date>();

  const [normalErrors, setNormalErrors] = useState<Record<string, string>>({});
  const [zodErrors, setZodErrors] = useState<string[]>([]);

  const [formikLikeValues, setFormikLikeValues] = useState<{ checkIn?: Date; checkOut?: Date }>({});
  const [formikLikeTouched, setFormikLikeTouched] = useState<{ checkIn?: boolean; checkOut?: boolean }>({});

  const disabledDay = useMemo(() => new Date(2026, 6, 15), []);
  const disabledBetween = useMemo(
    () => ({
      from: new Date(2026, 6, 20),
      to: new Date(2026, 6, 25),
    }),
    [],
  );

  const formattedDate = basicDate ? format(basicDate, formatPattern) : "No date selected";

  const formikLikeErrors = useMemo(() => {
    return {
      checkIn: !formikLikeValues.checkIn ? "Check-in is required." : undefined,
      checkOut:
        !formikLikeValues.checkOut
          ? "Check-out is required."
          : formikLikeValues.checkIn && formikLikeValues.checkOut < formikLikeValues.checkIn
            ? "Check-out cannot be before check-in."
            : undefined,
    };
  }, [formikLikeValues]);

  const handleNaturalParse = () => {
    const parsed = parseNaturalDate(naturalInput);
    if (!parsed) {
      setNaturalError("Unable to parse date. Try: today, tomorrow, next week, or March 1, 2026.");
      return;
    }

    setNaturalDate(parsed);
    setNaturalError(undefined);
  };

  const handleTextInputDate = (value: string) => {
    setTextDateInput(value);
    const parsed = parse(value, "dd/MM/yyyy", new Date());
    if (isValid(parsed)) setTextInputDate(parsed);
  };

  const runNormalValidation = () => {
    const errors: Record<string, string> = {};

    if (!basicDate) errors.basicDate = "Please pick a date.";
    if (!dob) errors.dob = "Date of birth is required.";
    else if (dob >= new Date()) errors.dob = "Date of birth must be earlier than today.";
    if (!travelRange?.from || !travelRange?.to) errors.travelRange = "Please pick start and end dates.";
    if (!singleUnitDateTime) errors.singleUnitDateTime = "Please select a datetime in single unit picker.";

    setNormalErrors(errors);
  };

  const runZodValidation = () => {
    const result = dateTimeSchema.safeParse({
      startDate: basicDate,
      dob,
      stay: travelRange,
    });

    if (result.success) {
      setZodErrors([]);
      return;
    }

    setZodErrors(result.error.errors.map((issue) => `${issue.path.join(".")}: ${issue.message}`));
  };

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold md:text-3xl">Shadcn DatePicker Playground (Controlled)</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Includes basic picker, natural language parsing, date-time, DOB, range, input picker, time picker,
          disabled dates, custom formats, responsive sizes, normal validation, Zod validation, and Formik-friendly
          integration.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global settings</CardTitle>
          <CardDescription>Change component size and output format.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Size type</Label>
            <Select value={size} onValueChange={(value: PickerSize) => setSize(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date format</Label>
            <Select value={formatPattern} onValueChange={setFormatPattern}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PPP">PPP (Jan 1st, 2026)</SelectItem>
                <SelectItem value="dd/MM/yyyy">dd/MM/yyyy</SelectItem>
                <SelectItem value="yyyy-MM-dd">yyyy-MM-dd</SelectItem>
                <SelectItem value="EEEE, MMM d">Weekday short</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="pickers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
          <TabsTrigger value="pickers">Core Pickers</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="formik-friendly">Formik Friendly</TabsTrigger>
        </TabsList>

        <TabsContent value="pickers" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Picker + Disabled Rules</CardTitle>
                <CardDescription>
                  Disabled exact date {format(disabledDay, "PPP")} and blocked range {format(disabledBetween.from, "PPP")}
                  -{format(disabledBetween.to, "PPP")}.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <DatePickerButton
                      value={basicDate}
                      placeholder="Pick a date"
                      size={size}
                      error={normalErrors.basicDate}
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={basicDate}
                      onSelect={setBasicDate}
                      disabled={[disabledDay, disabledBetween]}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-sm text-muted-foreground">Formatted value: {formattedDate}</p>
                {normalErrors.basicDate ? <p className="text-sm text-destructive">{normalErrors.basicDate}</p> : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Natural Language Picker</CardTitle>
                <CardDescription>Examples: today, tomorrow, next week, March 8, 2026.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={naturalInput}
                    onChange={(event) => setNaturalInput(event.target.value)}
                    placeholder="Type natural date"
                  />
                  <Button onClick={handleNaturalParse} type="button">
                    Parse
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Result: {naturalDate ? format(naturalDate, "PPP") : "No parsed date yet"}
                </p>
                {naturalError ? <p className="text-sm text-destructive">{naturalError}</p> : null}
              </CardContent>
            </Card>

              <Card>
                <CardHeader>
                  <CardTitle>DateTime Picker</CardTitle>
                  <CardDescription>
                    Includes split picker (date + time) and single-unit datetime picker (`datetime-local`).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <DatePickerButton value={dateTimeDate} placeholder="Pick date" size={size} />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dateTimeDate} onSelect={setDateTimeDate} initialFocus />
                  </PopoverContent>
                </Popover>
                <div className="space-y-2">
                  <Label>Time picker</Label>
                  <Input type="time" value={time} onChange={(event) => setTime(event.target.value)} className={pickerSizeClass[size]} />
                </div>
                <p className="text-sm text-muted-foreground">
                  Value: {dateTimeDate ? `${format(dateTimeDate, "PPP")} ${time}` : `No datetime selected (${time})`}
                </p>

                <div className="space-y-2">
                  <Label>DateTime picker (single unit)</Label>
                  <Input
                    type="datetime-local"
                    value={singleUnitDateTime}
                    min="2026-01-01T00:00"
                    max="2028-12-31T23:59"
                    onChange={(event) => setSingleUnitDateTime(event.target.value)}
                    className={cn(pickerSizeClass[size], normalErrors.singleUnitDateTime && "border-destructive")}
                  />
                  <p className="text-sm text-muted-foreground">
                    Value: {singleUnitDateTime || "No datetime selected in single unit picker"}
                  </p>
                  {normalErrors.singleUnitDateTime ? (
                    <p className="text-sm text-destructive">{normalErrors.singleUnitDateTime}</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Date of Birth + Range + Input Picker</CardTitle>
                <CardDescription>Includes age-safe DOB picker, range selection, and direct input parsing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Date of birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <DatePickerButton value={dob} placeholder="Select DOB" size={size} error={normalErrors.dob} />
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dob}
                        onSelect={setDob}
                        toDate={new Date()}
                        captionLayout="dropdown-buttons"
                        fromYear={1940}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                  {normalErrors.dob ? <p className="text-sm text-destructive">{normalErrors.dob}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label>Range picker</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          pickerSizeClass[size],
                          !travelRange?.from && "text-muted-foreground",
                          normalErrors.travelRange && "border-destructive",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {travelRange?.from
                          ? travelRange.to
                            ? `${format(travelRange.from, "PPP")} - ${format(travelRange.to, "PPP")}`
                            : format(travelRange.from, "PPP")
                          : "Select date range"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="range" selected={travelRange} onSelect={setTravelRange} numberOfMonths={2} />
                    </PopoverContent>
                  </Popover>
                  {normalErrors.travelRange ? <p className="text-sm text-destructive">{normalErrors.travelRange}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label>Input picker (dd/MM/yyyy)</Label>
                  <Input
                    placeholder="31/12/2026"
                    value={textDateInput}
                    onChange={(event) => handleTextInputDate(event.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Parsed: {textInputDate ? format(textInputDate, "PPP") : "Waiting for valid input"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Normal + Zod validation</CardTitle>
              <CardDescription>Run either manual validation or schema validation.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button type="button" onClick={runNormalValidation}>
                Run normal validation
              </Button>
              <Button type="button" variant="secondary" onClick={runZodValidation}>
                Run Zod validation
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Zod errors</CardTitle>
            </CardHeader>
            <CardContent>
              {zodErrors.length ? (
                <ul className="list-disc space-y-1 pl-5 text-sm text-destructive">
                  {zodErrors.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No schema issues.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formik-friendly">
          <Card>
            <CardHeader>
              <CardTitle>Formik-friendly controlled fields</CardTitle>
              <CardDescription>
                This field API mirrors Formik usage (`value`, `touched`, `error`, and `setFieldValue` style callback).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormikFriendlyDateField
                fieldName="checkIn"
                value={formikLikeValues.checkIn}
                touched={formikLikeTouched.checkIn}
                error={formikLikeErrors.checkIn}
                onChange={(name, next) => {
                  setFormikLikeValues((prev) => ({ ...prev, [name]: next }));
                  setFormikLikeTouched((prev) => ({ ...prev, [name]: true }));
                }}
              />

              <FormikFriendlyDateField
                fieldName="checkOut"
                value={formikLikeValues.checkOut}
                touched={formikLikeTouched.checkOut}
                error={formikLikeErrors.checkOut}
                onChange={(name, next) => {
                  setFormikLikeValues((prev) => ({ ...prev, [name]: next }));
                  setFormikLikeTouched((prev) => ({ ...prev, [name]: true }));
                }}
              />

              <Button
                type="button"
                onClick={() =>
                  setFormikLikeTouched({
                    checkIn: true,
                    checkOut: true,
                  })
                }
              >
                Validate Formik-like fields
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
