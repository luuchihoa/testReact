import React from "react";
import { motion as Motion } from "framer-motion";
import { BookOpen, Clock, UserRound, Users } from "lucide-react";

const compactTimeRange = (value = "") => value.replace(/\s+[–-]\s+/g, "–");

function getScheduleDetails(timeline) {
  const shiftName = timeline?.shiftName || "Ca học";
  const classTime = compactTimeRange(timeline?.classTime || "");
  const massTime = compactTimeRange(timeline?.massTime || "");
  const massStart = massTime.split("–")[0];
  const isFirstShift = shiftName === "Ca 1";

  return {
    shiftName,
    detailLabel: isFirstShift ? "Giáo lý" : "Thánh Lễ",
    detailTime: isFirstShift ? classTime : massStart,
    noteLabel: isFirstShift ? "Thánh Lễ" : "Giáo lý",
    noteTime: isFirstShift ? massStart : classTime,
  };
}

export default function KhoiOverviewBar({
  ariaLabel,
  age,
  ageDetail,
  classCount,
  classDetail,
  teacherCount,
  teamDetail,
  timeline,
  motionProps,
}) {
  const schedule = getScheduleDetails(timeline);
  const items = [
    {
      key: "age",
      icon: UserRound,
      label: "Độ tuổi",
      value: age,
      detail: ageDetail,
    },
    {
      key: "scale",
      icon: BookOpen,
      label: "Quy mô",
      value: `${classCount} lớp`,
      detail: String(classDetail || "").replace(/\s*&\s*/g, " và "),
    },
    {
      key: "team",
      icon: Users,
      label: "Đội ngũ",
      value: `${teacherCount} Giáo lý viên`,
      detail: teamDetail,
    },
    {
      key: "schedule",
      icon: Clock,
      label: "Lịch học",
      value: "Chúa Nhật",
      detail: (
        <>
          {schedule.shiftName} · {schedule.detailLabel}{" "}
          <span className="khoi-overview-time">{schedule.detailTime}</span>
        </>
      ),
      note: schedule.noteTime ? (
        <>
          {schedule.noteLabel}{" "}
          <span className="khoi-overview-time">{schedule.noteTime}</span>
        </>
      ) : null,
    },
  ];

  return (
    <Motion.dl
      {...motionProps}
      className="khoi-overview-bar"
      aria-label={ariaLabel}
    >
      {items.map((item) => (
        <div className="khoi-overview-item" key={item.key}>
          <dt className="khoi-overview-term">
            <span className="khoi-overview-icon" aria-hidden="true">
              {React.createElement(item.icon, { size: 17, strokeWidth: 1.9 })}
            </span>
            <span>{item.label}</span>
          </dt>
          <dd className="khoi-overview-value">{item.value}</dd>
          <dd className="khoi-overview-detail">{item.detail}</dd>
          {item.note ? <dd className="khoi-overview-note">{item.note}</dd> : null}
        </div>
      ))}
    </Motion.dl>
  );
}
