import { forkJoin, of } from 'rxjs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Create } from '../_services/database/actions';
import { TransformationService } from '../_services/database/transformation.service';
import { User, Subject, Sendable, Serializable, Deserializable } from './database';

export class Slot implements Deserializable, Serializable {
    startTime: Date;
    duration: Duration;

    constructor(startTime?: Date, duration?: Duration) {
        this.startTime = startTime;
        this.duration = duration;
    }

    deserialize(object: Sendable<Slot>, transform: TransformationService): Observable<Slot> {
        this.duration = transform.deserializeDuration(object.duration);
        this.startTime = transform.deserializeDate(object.startTime);
        return of(this);
    }
    serialize(transform: TransformationService): Sendable<Slot> {
        return {
            startTime: transform.serializeDate(this.startTime),
            duration: transform.serializeDuration(this.duration)
        };
    }
}

export class MergedSlot<T extends Slot> {
    constructor(object: Partial<MergedSlot<T>>) {
        Object.assign(this, object);
    }

    startTime: Date;
    duration: Duration;
    children: T[];

    deserialize(object: Sendable<Slot>, transform: TransformationService): Observable<Slot> {
        throw new Error('Method not implemented.');
    }
    serialize(transform: TransformationService): Sendable<Slot> {
        throw new Error('Method not implemented.');
    }
}

export class TimeSlot extends Slot {
    id?: number;
    owner: User;
    weekly: boolean;
}

export class AvailableSlot extends Slot {
    owner?: User;
}

export class CreateAppointment extends Slot {
    subject: Subject;
    topic?: string;
    timeslot?: TimeSlot;

    constructor(startTime?: Date, duration?: Duration, subject?: Subject, topic?: string) {
        super(startTime, duration);
        this.subject = subject;
        this.topic = topic;
    }

    deserialize(object: Sendable<Slot>, transform: TransformationService): Observable<Slot> {
        throw new Error('Method not implemented.');
    }
    serialize(transform: TransformationService): Sendable<CreateAppointment> {
        const result = super.serialize(transform) as Sendable<CreateAppointment>;
        result.subject = this.subject.id.toString(10);
        result.topic = this.topic;
        result.timeslot = this.timeslot ? this.timeslot.id.toString(10) : null;
        return result;
    }
}

export class Appointment extends CreateAppointment {
    readonly id?: number;
    readonly owner: User;
    readonly invitee: User;
    readonly status: AppointmentStatus;

    deserialize(
        object: Sendable<Appointment>,
        transform: TransformationService
    ): Observable<Appointment> {
        const owner = transform.deserializeUser(object.owner);
        const invitee = transform.deserializeUser(object.invitee);
        const subject = transform.deserializeSubject(object.subject);
        const startTime = of(transform.deserializeDate(object.startTime));
        const duration = of(transform.deserializeDuration(object.duration));
        return forkJoin({
            owner,
            invitee,
            subject,
            startTime,
            duration,
        }).pipe(
            map((values) => {
                return Object.assign(this, object, values);
            })
        );
    }

    serialize(): Sendable<Appointment> {
        const x: Sendable<Appointment> = {
            subject: this.subject.id.toString(10),
            topic: this.topic,
        };
        return x;
    }
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
