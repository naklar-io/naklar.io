import {
  SendableUser,
  User,
  localToSendableUser,
  sendableToLocalUser,
  Constants,
  Subject,
} from './database';

export interface SendableMatch {
  uuid: string;
  studentAgree: boolean;
  tutorAgree: boolean;
  tutor: SendableUser;
  student: SendableUser;
  failedMatches: number[];
  created: string;
  user: string;
  subject: number;
}

export interface RouletteEvent {
  type: string;
  match?: SendableMatch;
  meetingID?: string;
}

export interface SendableMatchRequest {
  id: number;
  match?: SendableMatch;
  failedMatches?: number[];
  created?: string;
}

export interface SendableStudentRequest extends SendableMatchRequest {
  subject: number;
}

export interface SendableMatchAnswer {
  agree: boolean;
}

export interface Meeting {
  meetingId?: string;
  ended?: boolean;
  timeEnded?: string;
  established?: boolean;
  timeEstablished?: string;
  student?: string;
  tutor?: string;
  name: string;
  feedbackSet: number[];
}

export interface JoinResponse {
  joinUrl: string;
  meetingId: string;
}

export interface Feedback {
  receiver?: string;
  provider?: string;
  rating: number;
  message?: string;
  meeting: string;
  created?: string;
}

export class Report {
  meeting: string;
  message: string;
}

export class Match {
  constructor(
    public uuid: string,
    public studentAgree: boolean,
    public tutorAgree: boolean,
    public tutor: User,
    public student: User,
    public failedMatches: number[],
    public created: string,
    public user: string,
    public subject: Subject
  ) {}

  bothAccepted() {
    return this.tutorAgree && this.studentAgree;
  }

  // TODO: this is WIP
  equals(m: Match) {
    return (
      this.uuid === m.uuid &&
      this.studentAgree === m.studentAgree &&
      this.tutorAgree === m.tutorAgree
    );
  }
}

export class Request {
  constructor(
    public id?: number,
    public match?: Match,
    public failedMatches?: number[],
    public created?: string
  ) {}

  // TODO: this is untested
  equals(mr: Request): boolean {
    if (
      this.match === null &&
      mr.match === null &&
      this.created === mr.created
    ) {
      return true;
    }
    if (this.match && mr.match) {
      return this.match.equals(mr.match) && this.created === mr.created;
    }
    return false;
  }
}

export class StudentRequest extends Request {
  constructor(
    public subject: number,
    public id?: number,
    public match?: Match,
    public failedMatches?: number[],
    public created?: string
  ) {
    super(id, match, failedMatches, created);
  }
}

export class MatchAnswer {
  constructor(public agree: boolean) {}
}

/**
 * Conversion functions
 */

export function localToSendableMatch(m: Match): SendableMatch {
  return {
    uuid: m.uuid,
    studentAgree: m.studentAgree,
    tutorAgree: m.tutorAgree,
    tutor: m.tutor ? localToSendableUser(m.tutor) : undefined,
    student: m.student ? localToSendableUser(m.student) : undefined,
    failedMatches: m.failedMatches,
    created: m.created,
    user: m.user,
    subject: m.subject.id
  };
}

export function sendableToLocalMatch(
  m: SendableMatch,
  constants: Constants
): Match {
  return new Match(
    m.uuid,
    m.studentAgree,
    m.tutorAgree,
    m.tutor ? sendableToLocalUser(m.tutor, constants) : null,
    m.student ? sendableToLocalUser(m.student, constants) : null,
    m.failedMatches,
    m.created,
    m.user,
    m.subject ? constants.subjects.find((x) => x.id === m.subject) : null
  );
}

export function localToSendableMatchRequest(
  m: Request
): SendableMatchRequest {
  return {
    id: m.id,
    match: m.match ? localToSendableMatch(m.match) : undefined,
    failedMatches: m.failedMatches,
    created: m.created,
  };
}

export function sendableToLocalMatchRequest(
  m: SendableMatchRequest,
  constants: Constants
): Request {
  return new Request(
    m.id,
    m.match ? sendableToLocalMatch(m.match, constants) : null,
    m.failedMatches,
    m.created
  );
}

export function localToSendableStudentRequest(
  m: StudentRequest
): SendableStudentRequest {
  return {
    id: m.id,
    subject: m.subject,
    match: m.match ? localToSendableMatch(m.match) : undefined,
    failedMatches: m.failedMatches,
    created: m.created,
  };
}

export function sendableToLocalStudentRequest(
  m: SendableStudentRequest,
  constants: Constants
): StudentRequest {
  return new StudentRequest(
    m.subject,
    m.id,
    m.match ? sendableToLocalMatch(m.match, constants) : null,
    m.failedMatches,
    m.created
  );
}

export function sendableToLocalMatchAnswer(
  m: SendableMatchAnswer
): MatchAnswer {
  return new MatchAnswer(m.agree);
}

export function localToSendableMatchAnswer(
  m: MatchAnswer
): SendableMatchAnswer {
  return {
    agree: m.agree,
  };
}
