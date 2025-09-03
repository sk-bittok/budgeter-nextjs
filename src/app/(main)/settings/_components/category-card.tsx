import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Category } from "@/generated/prisma";
import DeleteCategoryModal from "../../_components/delete-category";

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <div className="flex border-separate rounded-md flex-col justify-between shadow-md border shadow-black/[0.1] dark:shadow-white/[0.1]">
      <div className="flex flex-col items-center gap-2 p-4">
        <span className="text-3xl" role="img">
          {category.icon}
        </span>
        <span>{category.name}</span>
      </div>
      <DeleteCategoryModal category={category}>
        <Button
          className="group flex w-full border-separate gap-2 items-center rounded-t-none text-muted-foreground hover:bg-red-500/20"
          variant={"secondary"}
        >
          <Trash className="h-4 w-4 shake-on-hover transition-transform duration-300" />
          Delete
        </Button>
      </DeleteCategoryModal>
    </div>
  );
}
