import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CurrentAccountForm() {
  return (
    <div className="grid gap-2">
      <Label htmlFor="current-account-interest-rate">Interest rate</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          %
        </span>
        <Input
          id="current-account-interest-rate"
          type="number"
          defaultValue={0}
          className="pl-8"
        />
      </div>
      <p className="text-sm text-muted-foreground">The interest rate of the account</p>
    </div>
  );
}
