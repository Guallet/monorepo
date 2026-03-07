import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function MortgageForm() {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="mortgage-remaining-balance">Remaining balance *</Label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            %
          </span>
          <Input
            id="mortgage-remaining-balance"
            type="number"
            required
            defaultValue={0}
            className="pl-8"
          />
        </div>
        <p className="text-sm text-muted-foreground">The remaining balance of the account</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="mortgage-interest-rate">Interest rate *</Label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            %
          </span>
          <Input
            id="mortgage-interest-rate"
            type="number"
            required
            defaultValue={0}
            className="pl-8"
          />
        </div>
        <p className="text-sm text-muted-foreground">The interest rate of the account</p>
      </div>
    </div>
  );
}
