"use client";

import { useEffect, useState } from "react";
import { StudentService, Student } from "@/services/student.service";
import { Plus, Edit2, Trash2, User, Phone, Mail, GraduationCap, Calendar } from "lucide-react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Modal from "@/components/ui/modal";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Loading from "@/components/ui/loading";
import EmptyState from "@/components/ui/empty-state";

const initialFormData = {
  name: "",
  parentName: "",
  phoneNumber: "",
  guitarLevel: "Cơ bản (Đệm hát)" as Student["guitarLevel"],
  joinDate: new Date().toISOString().split("T")[0],
  email: "",
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    async function loadStudents() {
      try {
        const data = await StudentService.getAllStudents();
        setStudents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, []);

  const handleOpenCreate = () => {
    setEditingStudent(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      parentName: student.parentName,
      phoneNumber: student.phoneNumber,
      guitarLevel: student.guitarLevel,
      joinDate: student.joinDate,
      email: student.email || "",
    });
    setShowModal(true);
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await StudentService.deleteStudent(deletingId);
      setStudents((prev) => prev.filter((s) => s.id !== deletingId));
      setDeletingId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      if (editingStudent) {
        await StudentService.updateStudent(editingStudent.id, formData);
        setStudents(
          students.map((s) =>
            s.id === editingStudent.id ? { ...s, ...formData } : s
          )
        );
      } else {
        const created = await StudentService.createStudent(formData);
        setStudents([...students, created]);
      }
      setShowModal(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Không lưu được. Kiểm tra SĐT/email/học phí.");
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Danh sách Học viên</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Xem và quản lý thông tin liên hệ, trình độ học tập của các học viên guitar.</p>
        </div>
        <Button size="lg" className="w-full sm:w-auto" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" />
          Thêm học viên
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {students.length > 0 ? (
          students.map((student) => (
            <Card key={student.id} className="p-6 transition-all hover:scale-[1.01]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{student.name}</h3>
                    <span className="mt-1.5 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-[9px] font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                      {student.guitarLevel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(student)} title="Chỉnh sửa">
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="danger" size="icon" onClick={() => handleDelete(student.id)} title="Xóa">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="mt-6 space-y-2 border-t border-neutral-100 pt-4 text-xs font-semibold text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-neutral-400" />
                  <span>Phụ huynh: {student.parentName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-neutral-400" />
                  <span>SĐT: {student.phoneNumber}</span>
                </div>
                {student.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-neutral-400" />
                    <span className="truncate">{student.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-neutral-400" />
                  <span>Ngày nhập học: {student.joinDate}</span>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState message={'Chưa có học viên nào. Hãy bấm "Thêm học viên" để tạo tài khoản mới.'} />
          </div>
        )}
      </div>

      {showModal && (
        <Modal
          title={editingStudent ? "Chỉnh sửa hồ sơ học viên" : "Thêm học viên mới"}
          onClose={() => setShowModal(false)}
        >
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            {formError && (
              <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-600">{formError}</p>
            )}
            <Input
              label="Họ và tên học viên"
              type="text"
              required
              placeholder="Lê Minh Đạt"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Họ tên Phụ huynh"
                type="text"
                required
                placeholder="Lê Văn Hùng"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
              />
              <Input
                label="Số điện thoại"
                type="tel"
                required
                placeholder="0901xxxxxx"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>

            <Select
              label="Trình độ / Loại khóa học"
              value={formData.guitarLevel}
              onChange={(e) => setFormData({ ...formData, guitarLevel: e.target.value as Student["guitarLevel"] })}
            >
              <option value="Cơ bản (Đệm hát)">Cơ bản (Đệm hát)</option>
              <option value="Cổ điển (Classic)">Cổ điển (Classic)</option>
              <option value="Nâng cao (Fingerstyle)">Nâng cao (Fingerstyle)</option>
            </Select>

            <Input
              label="Địa chỉ Email học viên (nếu có)"
              type="email"
              placeholder="datguitar@gmail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Input
              label="Ngày nhập học"
              type="date"
              required
              value={formData.joinDate}
              onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
            />

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
        title="Xóa học viên?"
        message="Xóa sẽ gỡ học viên khỏi lớp, xóa hóa đơn và điểm danh liên quan. Không thể hoàn tác."
        confirmLabel="Xóa học viên"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}