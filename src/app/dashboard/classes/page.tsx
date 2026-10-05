"use client";

import { useEffect, useState } from "react";
import { ClassService, GuitarClass } from "@/services/class.service";
import { Plus, Edit2, Trash2, Calendar, Clock, DollarSign, User } from "lucide-react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Modal from "@/components/ui/modal";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Loading from "@/components/ui/loading";
import EmptyState from "@/components/ui/empty-state";
import Badge from "@/components/ui/badge";

const initialFormData = {
  name: "",
  teacherName: "",
  dayOfWeek: "Thứ 2",
  time: "18:00 - 19:30",
  tuitionRate: 800000,
  active: true,
};

export default function ClassesPage() {
  const [classes, setClasses] = useState<GuitarClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<GuitarClass | null>(null);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    async function loadClasses() {
      try {
        const data = await ClassService.getAllClasses();
        setClasses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadClasses();
  }, []);

  const handleOpenCreate = () => {
    setEditingClass(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  const handleOpenEdit = (cls: GuitarClass) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      teacherName: cls.teacherName,
      dayOfWeek: cls.schedule.dayOfWeek,
      time: cls.schedule.time,
      tuitionRate: cls.tuitionRate,
      active: cls.active,
    });
    setShowModal(true);
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await ClassService.deleteClass(deletingId);
      setClasses((prev) => prev.filter((c) => c.id !== deletingId));
      setDeletingId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await ClassService.updateClass(editingClass.id, {
          name: formData.name,
          teacherName: formData.teacherName,
          schedule: {
            dayOfWeek: formData.dayOfWeek,
            time: formData.time,
          },
          tuitionRate: formData.tuitionRate,
          active: formData.active,
        });
        setClasses(
          classes.map((c) =>
            c.id === editingClass.id
              ? {
                  ...c,
                  name: formData.name,
                  teacherName: formData.teacherName,
                  schedule: { dayOfWeek: formData.dayOfWeek, time: formData.time },
                  tuitionRate: formData.tuitionRate,
                  active: formData.active,
                }
              : c
          )
        );
      } else {
        const created = await ClassService.createClass({
          name: formData.name,
          teacherId: "u-teacher-" + Date.now(),
          teacherName: formData.teacherName,
          studentIds: [],
          schedule: {
            dayOfWeek: formData.dayOfWeek,
            time: formData.time,
          },
          tuitionRate: formData.tuitionRate,
          active: formData.active,
        });
        setClasses([...classes, created]);
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Danh sách Lớp học</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Xem và quản lý tất cả các lớp guitar đang mở và lịch giảng dạy.</p>
        </div>
        <Button size="lg" className="w-full sm:w-auto" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" />
          Tạo lớp mới
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {classes.length > 0 ? (
          classes.map((cls) => (
            <Card key={cls.id} className={`p-6 transition-all hover:scale-[1.01] ${!cls.active ? "opacity-60" : ""}`}>
              <div className="flex items-center justify-between">
                <Badge variant={cls.active ? "emerald" : "neutral"}>
                  <span className={`h-1.5 w-1.5 rounded-full ${cls.active ? "bg-emerald-500" : "bg-neutral-400"}`} />
                  {cls.active ? "Đang hoạt động" : "Tạm ngưng"}
                </Badge>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(cls)} title="Chỉnh sửa">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="danger" size="icon" onClick={() => handleDelete(cls.id)} title="Xóa">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <h3 className="mt-4 text-sm font-bold text-neutral-900 dark:text-white">{cls.name}</h3>

              <div className="mt-4 space-y-2 border-t border-neutral-100 pt-4 text-xs font-semibold text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-neutral-400" />
                  <span>Giảng viên: {cls.teacherName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-neutral-400" />
                  <span>Lịch học: {cls.schedule.dayOfWeek}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-neutral-400" />
                  <span>Thời gian: {cls.schedule.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-neutral-400" />
                  <span>
                    Học phí: <span className="text-neutral-900 dark:text-white">{formatCurrency(cls.tuitionRate)}</span>/tháng
                  </span>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState message={'Không tìm thấy lớp học nào. Hãy bấm "Tạo lớp mới" để bắt đầu!'} />
          </div>
        )}
      </div>

      {showModal && (
        <Modal
          title={editingClass ? "Chỉnh sửa thông tin lớp" : "Tạo lớp học mới"}
          onClose={() => setShowModal(false)}
        >
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Tên lớp học"
              type="text"
              required
              placeholder="Lớp Guitar Fingerstyle B1"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <Input
              label="Giảng viên giảng dạy"
              type="text"
              required
              placeholder="Thầy Nguyễn Hoàng"
              value={formData.teacherName}
              onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Lịch trong tuần"
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
              >
                {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Select>
              <Input
                label="Giờ dạy (Ca học)"
                type="text"
                required
                placeholder="19:00 - 20:30"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>

            <Input
              label="Học phí (VND / Tháng)"
              type="number"
              required
              value={formData.tuitionRate}
              onChange={(e) => setFormData({ ...formData, tuitionRate: Number(e.target.value) })}
            />

            <div className="flex items-center gap-2 py-2">
              <input
                id="active-toggle"
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-300 text-brand accent-brand focus:ring-brand dark:border-neutral-800 dark:accent-brand-light dark:focus:ring-brand-light"
              />
              <label htmlFor="active-toggle" className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                Lớp học đang mở tuyển sinh / Hoạt động
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit">Xác nhận lưu</Button>
            </div>
          </form>
        </Modal>
      )}
      <ConfirmDialog
        open={deletingId !== null}
        title="Xóa lớp học?"
        message="Xóa sẽ xóa hóa đơn và buổi điểm danh của lớp này. Không thể hoàn tác."
        confirmLabel="Xóa lớp"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}