"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Plus, X } from "lucide-react";
import { type ReactNode, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createTransaction } from "@/app/actions/transactions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { dateToUTCDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import {
  type CategoryFormInputType,
  type CreateTransactionType,
  categoryFormInputSchema,
  createTransactionSchema,
} from "@/schemas/transactions";
import CategorySelector from "./category-selector";

interface Props {
  type: "income" | "expense";
  children: ReactNode;
}

export default function CreateTransactionModal({ type, children }: Props) {
  const [open, setOpen] = useState(false);
  const [openDate, setOpenDate] = useState(false);

  const form = useForm<CategoryFormInputType>({
    resolver: zodResolver(categoryFormInputSchema),
    defaultValues: {
      amount: "0.0",
      category: "",
      date: new Date(),
      description: "",
    },
  });

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      toast.success("Transaction successfully added", {
        id: "create-transaction",
      });

      form.reset({
        date: new Date(),
        amount: "0.00",
        description: "",
        category: undefined,
      });

      queryClient.invalidateQueries({ queryKey: ["overview"] });

      setOpen((prev) => !prev);
    },
  });

  const handleCategoryChange = useCallback(
    (category: string) => {
      form.setValue("category", category);
    },
    [form.setValue],
  );

  const onSubmit = useCallback(
    (data: CategoryFormInputType) => {
      toast.loading("Creating transaction", {
        id: "create-transaction",
      });

      const tranformedData: CreateTransactionType = {
        ...data,
        date: dateToUTCDate(data.date),
        amount: Number.parseFloat(data.amount),
        type: type,
      };

      try {
        const parsedData = createTransactionSchema.safeParse(tranformedData);

        if (!parsedData.success) {
          throw parsedData.error;
        }

        mutate(tranformedData);
      } catch (err) {
        console.error("Error when submitting ", err);
        toast.error("Invalid form data", { id: "create-transaction" });
      }
    },
    [mutate, type],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader className="flex items-center justify-center">
          <DialogTitle className="text-3xl font-bold capitalize tracking-tighter">
            Record&nbsp;
            <span
              className={`${type === "income" ? "text-emerald-600" : "text-rose-600"}`}
            >
              {type}
            </span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Record a new income or expense
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <CategorySelector
                        type={type}
                        onChange={handleCategoryChange}
                      />
                    </FormControl>
                    <FormDescription>(Required).</FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full">
                    <FormLabel>Date</FormLabel>
                    <Popover open={openDate} onOpenChange={setOpenDate}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[200px] font-normal text-left pl-3",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Select a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          captionLayout="dropdown"
                          onSelect={(date) => {
                            field.onChange(date);
                            if (!date) return;
                            setOpenDate(false);
                          }}
                          autoFocus={true}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1970-01-01")
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Transaction date (required)
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input placeholder="0.0" {...field} />
                  </FormControl>
                  <FormDescription>
                    Transaction amount (required)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the transaction briefly"
                      className="min-h-40"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Transaction description (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
