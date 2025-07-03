'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as z from 'zod';
import { CalendarIcon, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabaseClient';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { netWorthStorage, NetWorthSnapshot } from '@/lib/netWorthStorage';
import { cn } from '@/lib/utils';

const snapshotFormSchema = z.object({
  date: z.date(),
  totalAssets: z.coerce.number().min(0, 'Total assets must be positive'),
  totalLiabilities: z.coerce.number().min(0, 'Total liabilities must be positive'),
});

type SnapshotFormValues = z.infer<typeof snapshotFormSchema>;

interface NetWorthSnapshotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snapshot?: NetWorthSnapshot | null;
}

const inputStyles = 'bg-[#F7EDEF] border-[#E8DCE0] h-11 px-3 focus:ring-[#C58B9F] focus:ring-opacity-20 text-gray-900';

export default function NetWorthSnapshotDialog({ open, onOpenChange, snapshot }: NetWorthSnapshotDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  const form = useForm<SnapshotFormValues>({
    resolver: zodResolver(snapshotFormSchema),
    defaultValues: {
      date: new Date(),
      totalAssets: 0,
      totalLiabilities: 0,
    },
  });

  React.useEffect(() => {
    if (snapshot) {
      form.reset({
        date: new Date(snapshot.date),
        totalAssets: snapshot.totalAssets,
        totalLiabilities: snapshot.totalLiabilities,
      });
    } else {
      form.reset({
        date: new Date(),
        totalAssets: 0,
        totalLiabilities: 0,
      });
    }
  }, [snapshot, form]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('net_worth_snapshots')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['netWorthSnapshots'] });
      queryClient.invalidateQueries({ queryKey: ['netWorth'] });
      toast({ title: 'Net worth snapshot deleted successfully' });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting snapshot',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
  });

  const snapshotMutation = useMutation({
    mutationFn: async (data: SnapshotFormValues) => {
      const snapshotData = {
        date: data.date.toISOString(),
        totalAssets: data.totalAssets,
        totalLiabilities: data.totalLiabilities,
        netWorth: data.totalAssets - data.totalLiabilities
      };

      if (snapshot) {
        const { error } = await supabase
          .from('net_worth_snapshots')
          .update({
            ...snapshotData,
            netWorth: snapshotData.netWorth
          })
          .eq('id', snapshot.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('net_worth_snapshots')
          .insert([snapshotData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['netWorthSnapshots'] });
      queryClient.invalidateQueries({ queryKey: ['netWorth'] });
      toast({ 
        title: `Net worth snapshot ${snapshot ? 'updated' : 'added'} successfully` 
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: `Error ${snapshot ? 'updating' : 'adding'} snapshot`,
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (values: SnapshotFormValues) => {
    snapshotMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#F8F2F3] p-5 gap-0 overflow-hidden border-none">
        <DialogHeader className="mb-5 space-y-1">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {snapshot ? 'Edit Net Worth Snapshot' : 'Add Net Worth Snapshot'}
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            {snapshot ? 'Update the data for ' + format(new Date(snapshot.date), 'MMM yyyy') : 'Add a new data point to track your net worth progress.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel className="text-sm font-medium text-gray-700">Date</FormLabel>
                  <div className="relative">
                    <Popover modal={true}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <div className="relative">
                            <Input
                              className={cn(
                                inputStyles,
                                'pr-10',
                                !field.value && 'text-muted-foreground'
                              )}
                              value={field.value ? format(field.value, 'dd/MM/yyyy') : ''}
                              readOnly
                              placeholder="Pick a date"
                            />
                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
                          </div>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-[#E8DCE0]" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </FormItem>
              )}
            />

            <div className="grid gap-4 items-end">
              <FormField
                control={form.control}
                name="totalAssets"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Total Assets (VND)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter total assets" {...field} className={inputStyles} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 items-end">
              <FormField
                control={form.control}
                name="totalLiabilities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Total Liabilities (VND)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter total liabilities" {...field} className={inputStyles} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-6 flex flex-row-reverse items-center gap-3">
              {snapshot ? (
                <>
                  <Button 
                    type="submit"
                    className="h-10 px-5 bg-[#C58B9F] hover:bg-[#b17c8f] text-white font-medium rounded-md"
                  >
                    Update Snapshot
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => onOpenChange(false)} 
                    className="h-10 px-4 border-gray-200 hover:bg-gray-50 font-medium rounded-md"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => snapshot && deleteMutation.mutate(snapshot.id)}
                    className="rounded-full bg-[#EF4444] hover:bg-[#d83a3a] mr-auto"
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    type="submit"
                    className="h-10 px-5 bg-[#C58B9F] hover:bg-[#b17c8f] text-white font-medium rounded-md"
                  >
                    Add Snapshot
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => onOpenChange(false)} 
                    className="h-10 px-4 border-gray-200 hover:bg-gray-50 font-medium rounded-md"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
