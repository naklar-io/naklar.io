import {
  SendableUser,
  User,
  localToSendableUser,
  sendableToLocalUser,
  Constants,
} from "./database";

export interface SendableMatch {
  uuid: string;
  student_agree: boolean;
  tutor_agree: boolean;
  tutor: SendableUser;
  student: SendableUser;
  failed_matches: number[];
  created: string;
  user: string;
  subject: string;
}

export interface SendableMatchRequest {
  match?: SendableMatch;
  failed_matches?: number[];
  created?: string;
}

export interface SendableStudentRequest extends SendableMatchRequest {
  subject: number;
}

export interface SendableMatchAnswer {
  agree: boolean;
}

export class Match {
  constructor(
    public uuid: string,
    public student_agree: boolean,
    public tutor_agree: boolean,
    public tutor: User,
    public student: User,
    public failed_matches: number[],
    public created: string,
    public user: string,
    public subject: string
  ) {}
}

export class MatchRequest {
  constructor(
    public match?: Match,
    public failed_matches?: number[],
    public created?: string
  ) {}
}

export class StudentRequest extends MatchRequest {
  constructor(
    public subject: number,
    public match?: Match,
    public failed_matches?: number[],
    public created?: string
  ) {
    super(match, failed_matches, created);
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
    student_agree: m.student_agree,
    tutor_agree: m.tutor_agree,
    tutor: m.tutor ? localToSendableUser(m.tutor) : undefined,
    student: m.student ? localToSendableUser(m.student) : undefined,
    failed_matches: m.failed_matches,
    created: m.created,
    user: m.user,
    subject: m.subject,
  };
}

export function sendableToLocalMatch(
  m: SendableMatch,
  constants: Constants
): Match {
  return new Match(
    m.uuid,
    m.student_agree,
    m.tutor_agree,
    m.tutor ? sendableToLocalUser(m.tutor, constants) : null,
    m.student ? sendableToLocalUser(m.student, constants) : null,
    m.failed_matches,
    m.created,
    m.user,
    m.subject
  );
}

export function localToSendableMatchRequest(
  m: MatchRequest
): SendableMatchRequest {
  return {
    match: m.match ? localToSendableMatch(m.match) : undefined,
    failed_matches: m.failed_matches,
    created: m.created,
  };
}

export function sendableToLocalMatchRequest(
  m: SendableMatchRequest,
  constants: Constants
): MatchRequest {
  return new MatchRequest(
    m.match ? sendableToLocalMatch(m.match, constants) : null,
    m.failed_matches,
    m.created
  );
}

export function localToSendableStudentRequest(
  m: StudentRequest
): SendableStudentRequest {
  return {
    subject: m.subject,
    match: m.match ? localToSendableMatch(m.match) : undefined,
    failed_matches: m.failed_matches,
    created: m.created,
  };
}

export function sendableToLocalStudentRequest(
  m: SendableStudentRequest,
  constants: Constants
): StudentRequest {
  return new StudentRequest(
    m.subject,
    m.match ? sendableToLocalMatch(m.match, constants) : null,
    m.failed_matches,
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
