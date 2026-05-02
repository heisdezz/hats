import { pb, ssr_pb } from "#/client/pb.ts";
import PageLoader from "#/components/layouts/PageLoader.tsx";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import Modal, { type ModalHandle } from "#/components/modals/DialogModal.tsx";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { CategoryResponse } from "#/../pocketbase-types";
import { Pencil, Plus, ToggleLeft, ToggleRight } from "lucide-react";

type FormValues = { name: string; parent: string };

export const Route = createFileRoute("/admin/dashboard/category/")({
  component: RouteComponent,
  loader: () => ssr_pb().collection("category").getList(1, 100),
});

function RouteComponent() {
  const loaderData = Route.useLoaderData();
  const qc = useQueryClient();
  const modalRef = useRef<ModalHandle>(null);
  const [editing, setEditing] = useState<CategoryResponse | null>(null);

  const query = useQuery({
    queryKey: ["category"],
    queryFn: () =>
      pb.collection("category").getList<CategoryResponse>(1, 100, {
        sort: "name",
      }),
    initialData: loaderData,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const invalidate = () => qc.invalidateQueries({ queryKey: ["category"] });

  const createMut = useMutation({
    mutationFn: (v: FormValues) =>
      pb.collection("category").create({
        name: v.name,
        parent: v.parent || undefined,
        isAvailable: true,
      }),
    onSuccess: () => {
      invalidate();
      modalRef.current?.close();
      reset();
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, v }: { id: string; v: FormValues }) =>
      pb
        .collection("category")
        .update(id, { name: v.name, parent: v.parent || undefined }),
    onSuccess: () => {
      invalidate();
      modalRef.current?.close();
      reset();
    },
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, current }: { id: string; current: boolean }) =>
      pb.collection("category").update(id, { isAvailable: !current }),
    onSuccess: invalidate,
  });

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", parent: "" });
    modalRef.current?.open();
  };

  const openEdit = (cat: CategoryResponse) => {
    setEditing(cat);
    reset({ name: cat.name ?? "", parent: cat.parent ?? "" });
    modalRef.current?.open();
  };

  const onSubmit = (v: FormValues) => {
    if (editing) {
      toast.promise(updateMut.mutateAsync({ id: editing.id, v }), {
        loading: "Saving...",
        success: "Category updated.",
        error: "Failed to update.",
      });
    } else {
      toast.promise(createMut.mutateAsync(v), {
        loading: "Creating...",
        success: "Category created.",
        error: "Failed to create.",
      });
    }
  };

  const categories = query.data?.items ?? [];

  return (
    <section className="page-wrap flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Categories</h2>
          <p className="text-sm text-base-content/40 mt-0.5">
            Manage product categories and hierarchy
          </p>
        </div>
        <button onClick={openCreate} className="btn btn-primary btn-sm gap-1.5">
          <Plus size={15} />
          Add category
        </button>
      </div>

      <PageLoader query={query}>
        {(data) =>
          data.items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-base-content/40">
              <p className="text-sm">No categories yet.</p>
              <button onClick={openCreate} className="btn btn-ghost btn-sm">
                Create one
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-base-200">
              <table className="table w-full">
                <thead>
                  <tr className="bg-base-200/60 text-xs uppercase tracking-wider text-base-content/50">
                    <th>Name</th>
                    <th>Parent</th>
                    <th className="text-center">Available</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((cat) => {
                    const parent = categories.find((c) => c.id === cat.parent);
                    const isAvailable = cat.isAvailable ?? false;
                    return (
                      <tr
                        key={cat.id}
                        className="hover:bg-base-200/40 transition-colors"
                      >
                        <td>
                          <span className="font-medium text-sm">{cat.name}</span>
                        </td>
                        <td>
                          {parent ? (
                            <span className="badge badge-ghost badge-sm">
                              {parent.name}
                            </span>
                          ) : (
                            <span className="text-xs text-base-content/30">—</span>
                          )}
                        </td>
                        <td className="text-center">
                          <button
                            onClick={() =>
                              toast.promise(
                                toggleMut.mutateAsync({
                                  id: cat.id,
                                  current: isAvailable,
                                }),
                                {
                                  loading: "Updating...",
                                  success: isAvailable ? "Disabled." : "Enabled.",
                                  error: "Failed to toggle.",
                                },
                              )
                            }
                            disabled={toggleMut.isPending}
                            className="btn btn-ghost btn-xs"
                            title={isAvailable ? "Click to disable" : "Click to enable"}
                          >
                            {isAvailable ? (
                              <ToggleRight size={20} className="text-success" />
                            ) : (
                              <ToggleLeft size={20} className="text-base-content/30" />
                            )}
                          </button>
                        </td>
                        <td>
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => openEdit(cat)}
                              className="btn btn-ghost btn-xs gap-1.5"
                            >
                              <Pencil size={13} />
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        }
      </PageLoader>

      <Modal ref={modalRef} title={editing ? "Edit category" : "New category"}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Name</label>
            <input
              className={`input input-bordered w-full ${errors.name ? "input-error" : ""}`}
              placeholder="e.g. Snapbacks"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="text-xs text-error">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Parent category</label>
            <select
              className="select select-bordered w-full"
              {...register("parent")}
            >
              <option value="">None (top-level)</option>
              {categories
                .filter((c) => !editing || c.id !== editing.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
            <p className="text-xs text-base-content/40">
              Leave empty to make this a top-level category.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => modalRef.current?.close()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createMut.isPending || updateMut.isPending}
            >
              {editing ? "Save changes" : "Create category"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
