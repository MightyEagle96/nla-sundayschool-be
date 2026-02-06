import { model, Schema, Types } from "mongoose";

export interface IAttendanceReport {
  student: Types.ObjectId;
  classCategory: string;
  className: string;
  timeLogged: Date;
}

const schema = new Schema<IAttendanceReport>(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student" },
    classCategory: String,
    className: String,
    timeLogged: Date,
  },
  { timestamps: true },
);

const AttendanceReport = model("AttendanceReport", schema);
export default AttendanceReport;
