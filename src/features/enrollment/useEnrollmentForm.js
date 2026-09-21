import { useState, useCallback } from "react";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../../components/ui/ToastContext.jsx";
import {
  validateEnrollmentForm,
  getAgeRecommendation,
  buildEnrollmentPayload,
} from "./enrollmentForm.js";

export function useEnrollmentForm() {
  const toastCtx = useToast();
  const showToast = toastCtx?.showToast;

  const [formData, setFormData] = useState({
    hoTen: "",
    namSinh: "",
    sdt: "",
    giaoXom: "",
    khoiDangKy: "",
    ghiChu: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submissionStatus, setSubmissionStatus] = useState("idle"); // "idle" | "submitting" | "success" | "error" | "uncertain"
  const [errorMessage, setErrorMessage] = useState("");
  const [successData, setSuccessData] = useState(null);

  // Đảm bảo đúng thứ tự: (khoiValue, birthYearStr)
  const ageRecommendation = getAgeRecommendation(formData.khoiDangKy, formData.namSinh);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => {
      if (prev[name]) {
        const next = { ...prev };
        delete next[name];
        return next;
      }
      return prev;
    });

    if (submissionStatus === "error" || submissionStatus === "uncertain") {
      setSubmissionStatus("idle");
      setErrorMessage("");
    }
  }, [submissionStatus]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const setKhoiDangKy = useCallback((khoiValue) => {
    setFormData((prev) => ({ ...prev, khoiDangKy: khoiValue }));
    setErrors((prev) => {
      if (prev.khoiDangKy) {
        const next = { ...prev };
        delete next.khoiDangKy;
        return next;
      }
      return prev;
    });
  }, []);

  const handleSubmit = useCallback(async (e, onValidationError, onSuccess) => {
    if (e && e.preventDefault) e.preventDefault();

    const validation = validateEnrollmentForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setTouched({
        hoTen: true,
        namSinh: true,
        sdt: true,
        giaoXom: true,
        khoiDangKy: true,
        ghiChu: true,
      });

      if (onValidationError) {
        onValidationError(validation.errors);
      }
      return;
    }

    setSubmissionStatus("submitting");
    setErrorMessage("");

    try {
      const payload = buildEnrollmentPayload(formData);
      const { data, error } = await supabase.rpc("submit_dang_ky_hoc", payload);

      if (error) {
        throw error;
      }

      setSuccessData({
        hoTen: payload.p_ho_ten,
        khoi: payload.p_khoi_dang_ky,
        sdt: payload.p_sdt,
        id: data,
      });
      setSubmissionStatus("success");
      showToast?.("Đã gửi đơn đăng ký học Giáo lý thành công!", "success");
      if (onSuccess) {
        onSuccess(data);
      }
    } catch (err) {
      const isNetworkError = typeof navigator !== "undefined" && (!navigator.onLine || err?.message?.includes("fetch"));
      if (isNetworkError) {
        setSubmissionStatus("uncertain");
        setErrorMessage("Kết nối mạng bị gián đoạn. Vui lòng kiểm tra lại đường truyền hoặc liên hệ trực tiếp hotline để được hỗ trợ.");
        showToast?.("Chưa thể xác nhận kết quả. Vui lòng kiểm tra lại trước khi gửi lần nữa.", "warning");
      } else {
        setSubmissionStatus("error");
        setErrorMessage(err?.message || "Không thể gửi đơn đăng ký. Vui lòng thử lại sau ít phút.");
        showToast?.(err?.message || "Lỗi khi gửi hồ sơ đăng ký", "error");
      }
    }
  }, [formData, showToast]);

  const handleResetForm = useCallback(() => {
    setFormData({
      hoTen: "",
      namSinh: "",
      sdt: "",
      giaoXom: "",
      khoiDangKy: "",
      ghiChu: "",
    });
    setErrors({});
    setTouched({});
    setSubmissionStatus("idle");
    setErrorMessage("");
    setSuccessData(null);
  }, []);

  return {
    formData,
    errors,
    touched,
    submissionStatus,
    errorMessage,
    successData,
    ageRecommendation,
    handleChange,
    handleBlur,
    handleSubmit,
    handleResetForm,
    setKhoiDangKy,
  };
}
