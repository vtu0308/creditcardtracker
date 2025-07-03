'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { netWorthStorage, Asset, AssetType } from '@/lib/netWorthStorage';
import { SupportedCurrency } from '@/lib/utils';

const assetFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['cash', 'savings', 'etf', 'stock', 'custom'] as const),
  customType: z.string().optional(),
  amount: z.coerce.number().min(0, 'Amount must be positive'),
  originalCurrency: z.enum(['VND', 'USD', 'EUR', 'JPY', 'SGD'] as const),
  bank: z.string().optional(),
  interestRate: z.coerce.number().min(0).max(100).optional(),
  termMonths: z.coerce.number().min(1).optional(),
  symbol: z.string().optional(),
});

type AssetFormValues = z.infer<typeof assetFormSchema>;

interface AssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
}

const inputStyles = 'bg-[#F7EDEF] border-[#E8DCE0] text-base';

export default function AssetDialog({ open, onOpenChange, asset }: AssetDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      name: '',
      type: 'cash',
      customType: '',
      amount: 0,
      originalCurrency: 'VND',
      bank: '',
      interestRate: undefined,
      termMonths: undefined,
      symbol: '',
    },
  });

  useEffect(() => {
    if (asset) {
      form.reset({
        name: asset.name,
        type: asset.type,
        customType: asset.customType || '',
        amount: asset.amount,
        originalCurrency: asset.originalCurrency as SupportedCurrency,
        bank: asset.bank || '',
        interestRate: asset.interestRate || undefined,
        termMonths: asset.termMonths || undefined,
        symbol: asset.symbol || '',
      });
    } else {
      form.reset({
        name: '',
        type: 'cash',
        customType: '',
        amount: 0,
        originalCurrency: 'VND',
        bank: '',
        interestRate: undefined,
        termMonths: undefined,
        symbol: '',
      });
    }
  }, [asset, form, open]);

  const addMutation = useMutation({
    mutationFn: (data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) =>
      netWorthStorage.addAsset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['netWorth'] });
      toast({ title: 'Asset added successfully' });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error adding asset',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>>;
    }) => netWorthStorage.updateAsset(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['netWorth'] });
      toast({ title: 'Asset updated successfully' });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating asset',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (values: AssetFormValues) => {
    const vndAmount =
      values.originalCurrency === 'VND'
        ? values.amount
        : values.amount * 24000; // TODO: Implement proper conversion

    const assetData = {
      ...values,
      vndAmount,
      customType: values.type === 'custom' ? values.customType : undefined,
    };

    if (asset) {
      updateMutation.mutate({ id: asset.id, data: assetData });
    } else {
      addMutation.mutate(assetData);
    }
  };

  const assetType = form.watch('type');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] text-base">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{asset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
          <p className="text-muted-foreground text-base mt-1">
            {asset
              ? 'Update the details of your asset.'
              : 'Add a new asset to track your wealth and net worth.'}
          </p>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Asset Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Emergency Fund, VWCE ETF"
                      className={inputStyles}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Asset Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className={inputStyles}>
                        <SelectValue placeholder="Select an asset type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="savings">Savings Account</SelectItem>
                      <SelectItem value="etf">ETF</SelectItem>
                      <SelectItem value="stock">Stock</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {assetType === 'custom' && (
              <FormField
                control={form.control}
                name="customType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Custom Type</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Real Estate, Crypto"
                        className={inputStyles}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Amount</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        className={inputStyles}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="originalCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className={inputStyles}>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(['VND', 'USD', 'EUR', 'JPY', 'SGD'] as const).map(
                          (currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Bank/Institution (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Techcombank, VIB"
                      className={inputStyles}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {assetType === 'savings' && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="interestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Interest Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="e.g., 2.50"
                          className={inputStyles}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="termMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Term (Months)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="e.g., 12"
                          className={inputStyles}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {(assetType === 'etf' || assetType === 'stock') && (
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symbol (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., VWCE, AAPL"
                        className={inputStyles}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto rounded-full px-8 text-base"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto bg-[#C58B9F] hover:bg-[#b17b8f] text-white rounded-full px-8 text-base"
              >
                {asset ? 'Save Changes' : 'Add Asset'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
