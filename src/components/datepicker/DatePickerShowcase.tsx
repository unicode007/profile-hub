import { useMemo, useState } from "react";
import { format } from "date-fns";
import { z } from "zod";
import { DateRange } from "react-day-picker";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ControlledDatePicker,
  ControlledPickerValue,
  PickerSize,
} from "@/components/datepicker/ControlledDatePicker";

const zodSchema = z.object({
  startDate: z.date({ required_error: "Start date is required" }),
  dateTime: z.string().min(1, "Date time is required"),
  stay: z.object({
    from: z.date({ required_error: "From date required" }),
    to: z.date({ required_error: "To date required" }),
  }),
});

interface FormikLikeMeta {
  touched?: boolean;
  error?: string;
}

interface FormikLikeFieldProps {
  name: string;
  value: ControlledPickerValue;
  meta: FormikLikeMeta;
  setFieldValue: (name: string, value: ControlledPickerValue) => void;
}

function FormikLikeDateField({ name, value, meta, setFieldValue }: FormikLikeFieldProps) {
  return (
    <ControlledDatePicker
      mode="single"
      label={name}
      value={value}
      touched={meta.touched}
      error={meta.error}
      onChange={(next) => setFieldValue(name, next)}
    />
  );
}

export function DatePickerShowcase() {
  const [size] = useState<PickerSize>("md");

  const [singleDate, setSingleDate] = useState<Date>();
  const [rangeDate, setRangeDate] = useState<DateRange>();
  const [splitDateTime, setSplitDateTime] = useState<Date>();
  const [singleUnitDateTime, setSingleUnitDateTime] = useState("");
  const [timeOnly, setTimeOnly] = useState("10:00");
  const [inputDate, setInputDate] = useState<Date>();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [zodErrors, setZodErrors] = useState<string[]>([]);

  const [formikValues, setFormikValues] = useState<{ checkIn?: Date; checkOut?: Date }>({});
  const [formikTouched, setFormikTouched] = useState<{ checkIn?: boolean; checkOut?: boolean }>({});

  const formikErrors = useMemo(
    () => ({
      checkIn: !formikValues.checkIn ? "Check in is required" : undefined,
      checkOut:
        !formikValues.checkOut
          ? "Check out is required"
          : formikValues.checkIn && formikValues.checkOut < formikValues.checkIn
            ? "Check out cannot be before check in"
            : undefined,
    }),
    [formikValues],
  );

  const disabledDates = useMemo(
    () => [new Date(2026, 6, 15), { from: new Date(2026, 6, 20), to: new Date(2026, 6, 25) }],
    [],
  );

  const runNormalValidation = () => {
    const nextErrors: Record<string, string> = {};

    if (!singleDate) nextErrors.singleDate = "Please select date";
    if (!rangeDate?.from || !rangeDate.to) nextErrors.rangeDate = "Please select range";
    if (!singleUnitDateTime) nextErrors.singleUnitDateTime = "Please select single-unit datetime";

    setErrors(nextErrors);
  };

  const runZodValidation = () => {
    const result = zodSchema.safeParse({
      startDate: singleDate,
      dateTime: singleUnitDateTime,
      stay: rangeDate,
    });

    if (result.success) {
      setZodErrors([]);
      return;
    }

    setZodErrors(result.error.errors.map((error) => `${error.path.join(".")}: ${error.message}`));
  };

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Reusable DatePicker Components</h1>
        <p className="text-sm text-muted-foreground">
          Import `ControlledDatePicker` and choose mode: single, range, date-time, datetime-local, time, or input.
        </p>
      </div>

      <Tabs defaultValue="components" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="formik">Formik Friendly</TabsTrigger>
          <TabsTrigger value="zod">Zod Validation</TabsTrigger>
        </TabsList>

        <TabsContent value="components">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic + disabled rules</CardTitle>
                <CardDescription>Single date with exact date and range disabled.</CardDescription>
              </CardHeader>
              <CardContent>
                <ControlledDatePicker
                  mode="single"
                  label="Booking date"
                  value={singleDate}
                  onChange={(next) => setSingleDate(next as Date | undefined)}
                  error={errors.singleDate}
                  touched
                  size={size}
                  disabledDates={disabledDates}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>DateTime (split + single unit)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ControlledDatePicker
                  mode="date-time"
                  label="Split DateTime picker"
                  value={splitDateTime}
                  onChange={(next) => setSplitDateTime(next as Date | undefined)}
                  size={size}
                />
                <ControlledDatePicker
                  mode="datetime-local"
                  label="Single unit DateTime picker"
                  value={singleUnitDateTime}
                  onChange={(next) => setSingleUnitDateTime((next as string) || "")}
                  touched
                  error={errors.singleUnitDateTime}
                  size={size}
                />
                <p className="text-xs text-muted-foreground">
                  Split value: {splitDateTime ? format(splitDateTime, "PPP p") : "not selected"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Range + input + time</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ControlledDatePicker
                  mode="range"
                  label="Stay range"
                  value={rangeDate}
                  onChange={(next) => setRangeDate(next as DateRange | undefined)}
                  touched
                  error={errors.rangeDate}
                  size={size}
                />
                <ControlledDatePicker
                  mode="input"
                  label="Input picker"
                  value={inputDate}
                  onChange={(next) => setInputDate(next as Date | undefined)}
                  inputFormat="dd/MM/yyyy"
                  size={size}
                />
                <ControlledDatePicker
                  mode="time"
                  label="Time picker"
                  value={timeOnly}
                  onChange={(next) => setTimeOnly((next as string) || "")}
                  size={size}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Normal validation</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={runNormalValidation}>Run normal validation</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="formik">
          <Card>
            <CardHeader>
              <CardTitle>Formik usage pattern</CardTitle>
              <CardDescription>Use this same API with real Formik `setFieldValue` and `meta`.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormikLikeDateField
                name="checkIn"
                value={formikValues.checkIn}
                meta={{ touched: formikTouched.checkIn, error: formikErrors.checkIn }}
                setFieldValue={(name, value) => {
                  setFormikValues((prev) => ({ ...prev, [name]: value as Date | undefined }));
                  setFormikTouched((prev) => ({ ...prev, [name]: true }));
                }}
              />
              <FormikLikeDateField
                name="checkOut"
                value={formikValues.checkOut}
                meta={{ touched: formikTouched.checkOut, error: formikErrors.checkOut }}
                setFieldValue={(name, value) => {
                  setFormikValues((prev) => ({ ...prev, [name]: value as Date | undefined }));
                  setFormikTouched((prev) => ({ ...prev, [name]: true }));
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zod">
          <Card>
            <CardHeader>
              <CardTitle>Zod usage pattern</CardTitle>
              <CardDescription>Validate controlled values with your own schema and map issues to UI errors.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="secondary" onClick={runZodValidation}>
                Run zod validation
              </Button>
              {zodErrors.length ? (
                <ul className="list-disc pl-5 text-sm text-destructive">
                  {zodErrors.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No schema issues</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
