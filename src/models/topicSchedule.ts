import { model, Schema } from "mongoose";

export interface ITopicSchedule {
  yayaClass: string;
  adultClass: string;
  scheduleDate: Date;
}

const shema = new Schema<ITopicSchedule>(
  {
    yayaClass: String,
    adultClass: String,
    scheduleDate: Date,
  },
  { timestamps: true },
);

const TopicSchedule = model("TopicSchedule", shema);
export default TopicSchedule;
