'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { netWorthStorage, Liability } from '@/lib/netWorthStorage';
import { storage } from '@/lib/storage';
import { SupportedCurrency } from '@/lib/utils';

const liabilityFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['credit_card', 'loan', 'custom'] as const),
  customType: z.string().optional(),
  amount: z.coerce.number().min(0, 'Amount must be positive'),
  originalCurrency: z.enum(['VND', 'USD', 'EUR', 'JPY', 'SGD'] as const),
  bank: z.string().optional(),
  interestRate: z.coerce.number().min(0).max(100).optional(),
  includeCreditCard: z.boolean(),
  creditCardId: z.string().optional(),
});

type LiabilityFormValues = z.infer<typeof liabilityFormSchema>;

interface LiabilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  liability: Liability | null;
}

const inputStyles = 'bg-[#F7EDEF] border-[#E8DCE0] text-base';

export default function LiabilityDialog({
  open,
  onOpenChange,
  liability,
}: LiabilityDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cards = [] } = useQuery({
    queryKey: ['cards'],
    queryFn: () => storage.getCards(),
  });

  const form = useForm<LiabilityFormValues>({
    resolver: zodResolver(liabilityFormSchema),
    defaultValues: {
      name: '',
      type: 'loan',
      customType: '',
      amount: 0,
      originalCurrency: 'VND',
      bank: '',
      interestRate: 0,
      includeCreditCard: false,
      creditCardId: undefined,
    },
  });

  useEffect(() => {
    if (liability) {
      form.reset({
        name: liability.name,
        type: liability.type,
        customType: liability.customType || '',
        amount: liability.amount,
        originalCurrency: liability.originalCurrency as SupportedCurrency,
        bank: liability.bank || '',
        interestRate: liability.interestRate || 0,
        includeCreditCard: liability.includeCreditCard,
        creditCardId: liability.creditCardId,
      });
    } else {
      form.reset();
    }
  }, [liability, form]);

  const addMutation = useMutation({
    mutationFn: (data: Omit<Liability, 'id' | 'createdAt' | 'updatedAt'>) =>
      netWorthStorage.addLiability(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
      queryClient.invalidateQueries({ queryKey: ['netWorth'] });
      toast({ title: 'Liability added successfully' });
      onOpenChange(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<Liability, 'id' | 'createdAt' | 'updatedAt'>>;
    }) => netWorthStorage.updateLiability(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
      queryClient.invalidateQueries({ queryKey: ['netWorth'] });
      toast({ title: 'Liability updated successfully' });
      onOpenChange(false);
    },
  });

  const onSubmit = async (values: LiabilityFormValues) => {
    // For VND, vndAmount is the same as amount
    // For other currencies, we'll need to implement conversion
    const vndAmount = values.originalCurrency === 'VND' 
      ? values.amount 
      : values.amount * 24000; // TODO: Implement proper conversion

    const liabilityData = {
      ...values,
      vndAmount,
      customType: values.type === 'custom' ? values.customType : undefined,
    };

    if (liability) {
      await updateMutation.mutateAsync({ id: liability.id, data: liabilityData });
    } else {
      await addMutation.mutateAsync(liabilityData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] text-base">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{liability ? 'Edit Liability' : 'Add New Liability'}</DialogTitle>
          <p className="text-base text-muted-foreground mt-1">
            {liability ? 'Update the details of your liability.' : 'Add a new liability to track your debts and get a complete financial picture.'}
          </p>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Liability Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Personal Loan, Mortgage" {...field} className={inputStyles} />
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
                  <FormLabel className="text-base">Liability Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="loan">Loan</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('type') === 'custom' && (
              <FormField
                control={form.control}
                name="customType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Custom Type</FormLabel>
                    <FormControl>
                      <Input {...field} className={inputStyles} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex items-end gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel className="text-base">Amount</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" placeholder="0.00" className={inputStyles} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-[100px] bg-[#F7EDEF] border-[#E8DCE0] text-base">
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(['VND', 'USD', 'EUR', 'JPY', 'SGD'] as const).map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
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
                    <Input placeholder="e.g., VIB Bank, TCB Bank" {...field} className={inputStyles} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interestRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Interest Rate (%) (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="18.50" {...field} type="number" step="0.01" className={inputStyles} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('type') === 'credit_card' && (
              <>
                <FormField
                  control={form.control}
                  name="includeCreditCard"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-base">
                          Include credit card balance in liabilities
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch('includeCreditCard') && (
                  <FormField
                    control={form.control}
                    name="creditCardId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Select Credit Card</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a card" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cards.map((card) => (
                              <SelectItem key={card.id} value={card.id}>
                                {card.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}

            <div className="flex justify-end space-x-2 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-full px-8 text-base"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-[#C58B9F] hover:bg-[#b17b8f] text-white rounded-full px-8 text-base"
              >
                {liability ? 'Update Liability' : 'Add Liability'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
