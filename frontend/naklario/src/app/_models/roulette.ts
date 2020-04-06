import { SendableUser } from "../_models";

export interface Match {
  uuid: string;
  student_agree: boolean;
  tutor_agree: boolean;
  tutor: SendableUser;
  student: SendableUser;
  failed_matches: number[];
  created: string;
  user: string;
}

export interface MatchRequest {
  subject: number;
  match: Match;
}

export interface MatchAnswer {
  agree: boolean;
}
