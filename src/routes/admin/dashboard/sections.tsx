import { pb, ssr_pb } from "#/client/pb";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import PageLoader from "#/components/layouts/PageLoader";
import CustomTable, { type columnType } from "#/components/tables/CustomTable";
import type { Actions } from "#/components/tables/pop-up";
import Modal, { type ModalHandle } from "#/components/modals/DialogModal";
import type { SectionResponse } from "#/../pocketbase-types";

type FormValues = { name: string };

export const Route = createFileRoute("/admin/dashboard/sections")({
  component: RouteComponent,
  loader: () =>
    ssr_pb().collection("section").getFullList({ sort: "name" }),
});

const columns: columnType<SectionResponse>[] = [
  { key: "name", label: "Name" },
  {
    key: "created",
    label: "Created",
    render: (val) =>
      new Date(val).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
  },
];

function RouteComponent() {
  const loaderData = Route.useLoaderData();
  const qc = useQueryClient();
  const modalRef = useRef<ModalHandle>(null);
  const [editing, setEditing] = useState<SectionResponse | null>(null);

  const query = useQuery({
    queryKey: ["sections"],
    queryFn: () =>
      pb.collection("section").getFullList<SectionResponse>({ sort: "name" }),
    initialData: loaderData,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  const invalidate = () => qc.invalidateQueries({ queryKey: ["sections"] });

  const createMut = useMutation({
    mutationFn: (v: FormValues) => pb.collection("section").create(v),
    onSuccess: () => { invalidate(); modalRef.current?.close(); reset(); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, v }: { id: string; v: FormValues }) =>
      pb.collection("section").update(id, v),
    onSuccess: () => { invalidate(); modalRef.current?.close(); reset(); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => pb.collection("section").delete(id),
    onSuccess: invalidate,
  });

  const openCreate = () => {
    setEditing(null);
    reset({ name: "" });
    modalRef.current?.open();
  };

  const openEdit = (section: SectionResponse) => {
    setEditing(section);
    reset({ name: section.name ?? "" });
    modalRef.current?.open();
  };

  const onSubmit = (v: FormValues) => {
    if (editing) {
      toast.promise(updateMut.mutateAsync({ id: editing.id, v }), {
        loading: "Saving...",
        success: "Section updated.",
        error: "Failed to update.",
      });
    } else {
      toast.promise(createMut.mutateAsync(v), {
        loading: "Creating...",
        success: "Section created.",
        error: "Failed to create.",
      });
    }
  };

  const actions: Actions<SectionResponse>[] = [
    {
      key: "edit",
      label: "Edit",
      action: (item) => openEdit(item),
    },
    {
      key: "delete",
      label: "Delete",
      action: (item) =>
        toast.promise(deleteMut.mutateAsync(item.id), {
          loading: "Deleting...",
          success: "Section deleted.",
          error: "Failed to delete.",
        }),
    },
  ];

  return (
    <section className="page-wrap flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Sections</h2>
          {query.data && (
            <p className="text-sm text-base-content/40 mt-0.5">
              {query.data.length} section{query.data.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <button onClick={openCreate} className="btn btn-primary gap-1.5">
          <Plus size={16} />
          Add section
        </button>
      </div>

      <PageLoader query={query}>
        {(data) => (
          <CustomTable
            data={data}
            columns={columns}
            actions={actions}
          />
        )}
      </PageLoader>

      <Modal ref={modalRef} title={editing ? "Edit section" : "New section"}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Name</label>
            <input
              className={`input input-bordered w-full ${errors.name ? "input-error" : ""}`}
              placeholder="e.g. New Arrivals"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="text-xs text-error">{errors.name.message}</p>
            )}
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
              {editing ? "Save changes" : "Create section"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
