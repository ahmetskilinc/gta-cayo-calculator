"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function CheckboxField({
  id,
  label,
  checked,
  onCheckedChange,
  description,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Checkbox id={id} checked={checked} onCheckedChange={(val) => onCheckedChange(val === true)} className="mt-0.5" />
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={id} className="cursor-pointer">
          {label}
        </Label>
        {description && <span className="text-muted-foreground text-xs">{description}</span>}
      </div>
    </div>
  );
}
