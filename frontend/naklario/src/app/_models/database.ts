/**
 * sendable interfaces for communication with the api
 */
export interface SendableTutorData {
  schooldata: number[];
  subjects: number[];
  verification_file?: string;
  verified?: boolean;
  profile_picture?: string;
}

export interface SendableStudentData {
  school_data: number;
}

type GenderAbbr = "MA" | "FE" | "DI";

export interface SendableUser {
  email: string;
  password: string;
  first_name: string;
  last_name?: string;
  state: number;
  terms_accepted: boolean;
  gender: GenderAbbr;
  email_verified?: boolean;
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
  constructor(public school_data: SchoolData) {}
}

export class TutorData {
  constructor(
    public schooldata: SchoolData[],
    public subjects: Subject[],
    public verification_file: string,
    public verified: boolean,
    public profile_picture
  ) {}
}

export class User {
  constructor(
    public email: string,
    public password: string,
    public first_name: string,
    public last_name: string,
    public state: State,
    public studentdata: StudentData | null,
    public tutordata: TutorData | null,
    public terms_accepted: boolean,
    public email_verified: boolean,
    public gender: Gender,
    public token: string,
    public token_expiry: string
  ) {}
}

export class State {
  constructor(
    public id: number,
    public name: string,
    public shortcode: string
  ) {}
}

export class Subject {
  constructor(public id: number, public name: string) {}
}
export class SchoolType {
  constructor(public id: number, public name: string) {}
}

export class SchoolData {
  constructor(
    public id: number,
    public school_type: number,
    public grade: number
  ) {}
}

export class Gender {
  constructor(
    public id: number,
    public gender: string,
    public shortcode: GenderAbbr
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
        verification_file: user.tutordata.verification_file,
        verified: user.tutordata.verified,
        profile_picture: user.tutordata.profile_picture,
      }
    : null;
  return {
    email: user.email,
    password: user.password,
    first_name: user.first_name,
    last_name: user.last_name,
    state: user.state.id,
    gender: user.gender.shortcode,
    email_verified: user.email_verified,
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
          constants.schoolData.filter((x) =>
            user.tutordata.schooldata.includes(x.id)
          ),
          constants.subjects.filter((x) =>
            user.tutordata.subjects.includes(x.id)
          ),
          user.tutordata.verification_file,
          user.tutordata.verified,
          user.tutordata.profile_picture
        )
      : null,
    user.terms_accepted,
    user.email_verified,
    constants.genders.find((x) => x.shortcode === user.gender),
    // need to provide token / token_expiry via login
    "",
    ""
  );
};

export class Constants {
  constructor(
    public states: State[],
    public subjects: Subject[],
    public schoolTypes: SchoolType[],
    public schoolData: SchoolData[],
    public genders: Gender[]
  ) {}
}
