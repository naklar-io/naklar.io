import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TransformationService } from '../_services/database/transformation.service';

/**
 * sendable interfaces for communication with the api
 */
export interface SendableTutorData {
    schooldata: number[];
    subjects: number[];
    verificationFile?: string;
    verified?: boolean;
    profilePicture?: string;
}

export interface SendableStudentData {
    schoolData: number;
}

type GenderAbbr = 'MA' | 'FE' | 'DI';

export interface SendableUser {
    uuid?: string;
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
    state: number;
    termsAccepted: boolean;
    gender: GenderAbbr;
    emailVerified?: boolean;
    studentdata: SendableStudentData | null;
    tutordata: SendableTutorData | null;
}

export interface SendableLogin {
    email: string;
    password: string;
}

export interface SendableSchoolData {
    id: number;
    schoolType: number;
    grade: number;
}

/**
 * local objects
 */
export class StudentData {
    constructor(public schoolData: SchoolData) {}
}

export class TutorData {
    constructor(
        public schooldata: SchoolData[],
        public subjects: Subject[],
        public verificationFile: string,
        public verified: boolean,
        public profilePicture
    ) {}
}

export class User {
    constructor(
        public email: string,
        public password: string,
        public firstName: string,
        public lastName: string,
        public state: State,
        public studentdata: StudentData | null,
        public tutordata: TutorData | null,
        public termsAccepted: boolean,
        public emailVerified: boolean,
        public gender: Gender,
        public token: string,
        public tokenExpiry: string,
        public uuid?: string
    ) {}

    isStudent(): boolean {
        return !this.studentdata === null;
    }
    public equals(otherUser: User): boolean {
        return this.uuid === otherUser.uuid;
    }
}

export class State {
    constructor(public id: number, public name: string, public shortcode: string) {}
}

export class Subject {
    constructor(public id: number, public name: string) {}
}
export class SchoolType {
    constructor(public id: number, public name: string) {}
}

export class SchoolData {
    constructor(public id: number, public schoolType: SchoolType, public grade: number) {}
}

export class Gender {
    constructor(public id: number, public gender: string, public shortcode: GenderAbbr) {}
}

/**
 *  conversion functions between User <==> SendableUser
 */
export function localToSendableUser(user: User): SendableUser {
    const studentdata: SendableStudentData | null = user.studentdata
        ? {
              schoolData: user.studentdata.schoolData.id,
          }
        : null;
    const tutordata: SendableTutorData | null = user.tutordata
        ? {
              schooldata: user.tutordata.schooldata.map((x) => x.id),
              subjects: user.tutordata.subjects.map((x) => x.id),
              verificationFile: user.tutordata.verificationFile,
              verified: user.tutordata.verified,
              profilePicture: user.tutordata.profilePicture,
          }
        : null;
    return {
        email: user.email,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        state: user.state.id,
        gender: user.gender.shortcode,
        emailVerified: user.emailVerified,
        studentdata,
        tutordata,
        termsAccepted: user.termsAccepted,
    };
}
export function sendableToLocalUser(user: SendableUser, constants: Constants): User {
    return new User(
        user.email,
        user.password,
        user.firstName,
        user.lastName,
        constants.states.find((x) => x.id === user.state),
        user.studentdata
            ? new StudentData(
                  constants.schoolData.find((x) => x.id === user.studentdata.schoolData)
              )
            : null,
        user.tutordata
            ? new TutorData(
                  constants.schoolData.filter((x) => user.tutordata.schooldata.includes(x.id)),
                  constants.subjects.filter((x) => user.tutordata.subjects.includes(x.id)),
                  user.tutordata.verificationFile,
                  user.tutordata.verified,
                  user.tutordata.profilePicture
              )
            : null,
        user.termsAccepted,
        user.emailVerified,
        constants.genders.find((x) => x.shortcode === user.gender),
        // need to provide token / token_expiry via login
        '',
        '',
        user.uuid
    );
}

export function localToSendableSchoolData(s: SchoolData): SendableSchoolData {
    return {
        id: s.id,
        schoolType: s.schoolType.id,
        grade: s.grade,
    };
}

export function sendableToLocalSchoolData(s: SendableSchoolData, types: SchoolType[]): SchoolData {
    return new SchoolData(
        s.id,
        types.find((t) => t.id === s.schoolType),
        s.grade
    );
}

const addAPIUrl = (url: string) => environment.apiUrl + url;
const removeAPIUrl = (url: string) => url.replace(environment.apiUrl, '');

export class Constants {
    constructor(
        public states: State[],
        public subjects: Subject[],
        public schoolTypes: SchoolType[],
        public schoolData: SchoolData[],
        public genders: Gender[]
    ) {}
}

export type Sendable<T> = { [Property in keyof T]+?: T[Property] extends object ? string : T[Property] };
export interface Serializable {
  serialize(transform: TransformationService): Sendable<Serializable>;
}

export interface Deserializable {
  deserialize(object: Sendable<Deserializable>, transform: TransformationService): Observable<Deserializable>;
}
