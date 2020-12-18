import { Create } from '../_services/database/actions';
import { User, Subject } from './database';

interface Slot {
    startTime: Date;
    duration: Duration;
}

export interface TimeSlot extends Slot {
    id?: number;
    owner: User;
    weekly: boolean;
}

export interface AvailableSlot extends Slot {
    owner?: User;
}

export interface CreateAppointment extends Slot {
    subject: Subject;
    topic?: string;
}

export interface Appointment extends CreateAppointment {
    id?: number;
    owner: User;
    invitee: User ;
    status: AppointmentStatus;
}

export enum AppointmentStatus {
    REQUESTED = 'REQUESTED',
    CONFIRMED = 'CONFIRMED',

    // rejection states,
    OWNER_REJECTED = 'OWNER_REJECTED',
    INVITEE_REJECTED = 'INVITEE_REJECTED',

    // meeting states
    OWNER_STARTED = 'OWNER_STARTED',
    INVITEE_STARTED = 'INVITEE_STARTED',
    BOTH_STARTED = 'BOTH_STARTED',
}
