import { pb, ssr_pb } from "#/client/pb.ts";
import PageLoader from "#/components/layouts/PageLoader.tsx";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import Modal, { type ModalHandle } from "#/components/modals/DialogModal.tsx";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import SimpleSelect from "#/components/inputs/SimpleSelect";
import type { SectionResponse } from "#/../pocketbase-types";
import { toast } from "sonner";
import type { CategoryResponse } from "#/../pocketbase-types";
import { Plus, ToggleLeft, ToggleRight } from "lucide-react";
import CustomTable, { type columnType } from "#/components/tables/CustomTable";
import type { Actions } from "#/components/tables/pop-up";

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
        expand: "parent",
      }),
    initialData: loaderData,
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
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
      pb.collection("category").update(id, {
        name: v.name,
        parent: v.parent || null,
      }),
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
    reset({ name: cat.name ?? "", parent: "" });
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

  const columns: columnType<CategoryResponse>[] = [
    { key: "name", label: "Name" },
    {
      key: "parent",
      label: "Parent",
      render: (_val, item) => {
        const parent = (item.expand as any)?.parent as
          | SectionResponse
          | undefined;
        return parent ? (
          <span className="badge badge-ghost">{parent.name}</span>
        ) : (
          <span className="text-base-content/30">—</span>
        );
      },
    },
    {
      key: "isAvailable",
      label: "Available",
      render: (val, item) => (
        <button
          onClick={() =>
            toast.promise(
              toggleMut.mutateAsync({ id: item.id, current: val ?? false }),
              {
                loading: "Updating...",
                success: val ? "Disabled." : "Enabled.",
                error: "Failed to toggle.",
              },
            )
          }
          disabled={toggleMut.isPending}
          className="btn btn-ghost"
          title={val ? "Click to disable" : "Click to enable"}
        >
          {val ? (
            <ToggleRight size={22} className="text-success" />
          ) : (
            <ToggleLeft size={22} className="text-base-content/30" />
          )}
        </button>
      ),
    },
  ];

  const actions: Actions<CategoryResponse>[] = [
    {
      key: "edit",
      label: "Edit",
      action: (item) => openEdit(item),
    },
  ];

  return (
    <section className="page-wrap flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Categories</h2>
          <p className="text-sm text-base-content/40 mt-0.5">
            Manage product categories and hierarchy
          </p>
        </div>
        <button onClick={openCreate} className="btn btn-primary gap-1.5">
          <Plus size={16} />
          Add category
        </button>
      </div>

      <PageLoader query={query}>
        {(data) =>
          data.items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-base-content/40">
              <p className="text-sm">No categories yet.</p>
              <button onClick={openCreate} className="btn btn-ghost">
                Create one
              </button>
            </div>
          ) : (
            <CustomTable
              data={data.items}
              columns={columns}
              actions={actions}
            />
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

          <Controller
            name="parent"
            control={control}
            render={({ field }) => (
              <SimpleSelect<SectionResponse>
                route="section"
                label="Parent section"
                placeholder="None (top-level)"
                value={field.value || null}
                onChange={(val) => field.onChange(val ?? "")}
                render={(item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                )}
              />
            )}
          />

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
