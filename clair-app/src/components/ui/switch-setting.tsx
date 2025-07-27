import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SwitchSettingProps {
  id?: string;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function SwitchSetting({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  disabled = false
}: SwitchSettingProps) {
  return (
    <div className="flex items-center justify-between gap-4 min-w-0">
      <div className="space-y-1 flex-1 min-w-0">
        <Label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </Label>
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div className="flex-shrink-0">
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}