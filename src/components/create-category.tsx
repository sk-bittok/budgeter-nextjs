import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { CircleOff, PlusSquare } from "lucide-react";
import { type ReactNode, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createCategory } from "@/app/actions/categories";
import type { Category } from "@/generated/prisma";
import {
  type CreateCategoryType,
  createCategorySchema,
} from "@/schemas/category";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "./ui/form";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

type Props = {
  type: "income" | "expense";
  onSuccess: (category: Category) => void;
  trigger?: ReactNode;
};

export default function CreateCategoryModal({
  type,
  onSuccess,
  trigger,
}: Props) {
  const [open, setOpen] = useState(false);
  const form = useForm<CreateCategoryType>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      type,
      icon: "",
      name: "",
    },
  });

  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: createCategory,
    onSuccess: async (data) => {
      form.reset({
        type,
        name: "",
        icon: "",
      });

      toast.success(`Category ${data.name} added successfully.`, {
        id: "create-category",
      });

      onSuccess(data);

      await queryClient.invalidateQueries({ queryKey: ["categories"] });

      setOpen((prev) => !prev);
    },
    onError: (error) => {
      toast.error(`Failed to create category ${error.message}!`, {
        id: "create-category",
      });
    },
  });

  const onSubmit = useCallback(
    (data: CreateCategoryType) => {
      toast.loading("Adding category", { id: "create-category" });
      mutate(data);
    },
    [mutate],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant={"ghost"}
            className="flex border-separate items-center justify-start gap-1 rounded-none border-b p-3 text-muted-foreground"
          >
            <PlusSquare className="w-4 h-4" />
            Add new
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="flex items-center justify-center">
          <DialogTitle className="text-3xl font-bold capitalize tracking-tighter">
            Add&nbsp;
            <span
              className={`${type === "income" ? "text-emerald-600" : "text-rose-600"}`}
            >
              {type}
            </span>
            &nbsp;Category
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a new category for your {type}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Category name" type="text" {...field} />
                  </FormControl>
                  <FormDescription>
                    Name of the category i.e. salary
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="h-[100px] w-full"
                        >
                          {form.watch("icon") ? (
                            <div className="flex flex-col items-center gap-2.5">
                              <span role="img" className="text-5xl">
                                {field.value}
                              </span>
                              <p className="text-xs text-muted-foreground">
                                Click to change
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <CircleOff className="h-[48px] w-[48px]" />
                              <p className="text-xs text-muted-foreground">
                                Click to select
                              </p>
                            </div>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <EmojiPicker
                          theme={Theme.AUTO}
                          onEmojiClick={(emoji) => {
                            field.onChange(emoji.emoji);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormDescription>
                    An icon to represent the category in the application.
                  </FormDescription>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              onClick={() => form.reset()}
              className="bg-red-600 hover:bg-red-500 text-white font-bold"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold"
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
