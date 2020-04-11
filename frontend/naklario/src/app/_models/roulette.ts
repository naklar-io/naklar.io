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
  subject: string;
}

export interface MatchRequest {
  match?: Match;
  failed_matches?: number[];
  created?: string;
}

export interface StudentRequest extends MatchRequest {
  subject: number;
}

export interface MatchAnswer {
  agree: boolean;
}
