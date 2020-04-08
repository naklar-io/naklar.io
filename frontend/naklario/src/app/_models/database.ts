/**
 * sendable interfaces for communication with the api
 */
export interface SendableTutorData {
  schooldata: number[];
  subjects: number[];
}

export interface SendableStudentData {
  school_data: number;
}

export interface SendableUser {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  state: number;
  terms_accepted: boolean;
  studentdata: SendableStudentData | null;
  tutordata: SendableTutorData | null;
}

export interface SendableLogin {
  email: string;
  password: string;
}

/**
 * local objects
 */
export class StudentData {
  constructor(public school_data: SchoolData = new SchoolData()) {}
}

export class TutorData {
  constructor(
    public schooldata: SchoolData[] = [],
    public subjects: Subject[] = []
  ) {}
}

export class User {
  constructor(
    public email: string = "",
    public password: string = "",
    public first_name: string = "",
    public last_name: string = "",
    public state: State = new State(),
    public studentdata: StudentData | null = new StudentData(),
    public tutordata: TutorData | null = new TutorData(),
    public terms_accepted: boolean = false,
    public token: string = "",
    public token_expiry: string = ""
  ) {}
}

export class State {
  constructor(
    public id: number = -1,
    public name: string = "",
    public shortcode: string = ""
  ) {}
}

export class Subject {
  constructor(public id: number = -1, public name: string = "") {}
}
export class SchoolType {
  constructor(public id: number = -1, public name: string = "") {}
}

export class SchoolData {
  constructor(
    public id: number = -1,
    public school_type: number = -1,
    public grade: number = -1
  ) {}
}

/**
 *  conversion functions between User <==> SendableUser
 */
export const localToSendable = (user: User): SendableUser => {
  const studentdata: SendableStudentData | null = user.studentdata
    ? {
        school_data: user.studentdata.school_data.id,
      }
    : null;
  const tutordata: SendableTutorData | null = user.tutordata
    ? {
        schooldata: user.tutordata.schooldata.map((x) => x.id),
        subjects: user.tutordata.subjects.map((x) => x.id),
      }
    : null;
  return {
    email: user.email,
    password: user.password,
    first_name: user.first_name,
    last_name: user.last_name,
    state: user.state.id,
    studentdata: studentdata,
    tutordata: tutordata,
    terms_accepted: user.terms_accepted,
  };
};
export const sendableToLocal = (
  user: SendableUser,
  constants: Constants
): User => {
  return new User(
    user.email,
    user.password,
    user.first_name,
    user.last_name,
    constants.states.find((x) => x.id === user.state),
    user.studentdata
      ? new StudentData(
          constants.schoolData.find(
            (x) => x.id === user.studentdata.school_data
          )
        )
      : null,
    user.tutordata
      ? new TutorData(
          constants.schoolData.filter((x) => x.id in user.tutordata.schooldata),
          constants.subjects.filter((x) => x.id in user.tutordata.subjects)
        )
      : null
    // TODO: provide token & terms_accepted
  );
};

export class Constants {
  constructor(
    public states: State[],
    public subjects: Subject[],
    public schoolTypes: SchoolType[],
    public schoolData: SchoolData[]
  ) {}
}
