import { StudentModel } from "../models/studentModel";
import { TeacherModel } from "../models/teacherModel";

export const viewUsersOverview = async (req: Request, res: Response) => {
  /**
   * Teacher accounts
   * students accounts
   * activated accounts
   * disabled accounts
   */

  const teacherAccounts = await TeacherModel.countDocuments();
  const studentAccounts = await StudentModel.countDocuments();

  //const disabledAccounts=
};
