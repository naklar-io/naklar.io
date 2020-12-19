import { getLocaleDateTimeFormat } from '@angular/common';
import * as timedate from 'date-fns';
import { MergedSlot, Slot } from 'src/app/_models/scheduling';

export function endTime(slot: Slot) {
    return timedate.add(slot.startTime, slot.duration);
}

export function compareAsc(slotA: Slot, slotB: Slot) {
    return timedate.compareAsc(slotA.startTime, slotB.startTime);
}

export function mergeOverlappingSlots<T extends Slot>(slots: T[]): MergedSlot<T>[] {
    const result: MergedSlot<T>[] = [];
    const mergedSlots: Slot[] = [];
    const workSlots = slots.sort(compareAsc);
    workSlots.forEach((element) => {
        if (!mergedSlots.includes(element)) {
            const newSlot = new MergedSlot({
                startTime: element.startTime,
                duration: element.duration,
                children: [element]
            });
            let currentInterval = {
                start: newSlot.startTime,
                end: endTime(newSlot),
            } as Interval;
            let overlappingSlots = workSlots.filter(
                (x) =>
                    !newSlot.children.includes(x) &&
                    timedate.areIntervalsOverlapping(
                        currentInterval,
                        { start: x.startTime, end: endTime(x) },
                        { inclusive: true }
                    )
            );
            while (overlappingSlots.length > 0) {
                const maxEnd = timedate.max([...overlappingSlots.map(endTime), endTime(element)]);
                const minStart = timedate.min([
                    ...overlappingSlots.map((o) => o.startTime),
                    element.startTime,
                ]);
                newSlot.startTime = minStart;
                newSlot.duration = timedate.intervalToDuration({start: minStart, end: maxEnd});
                newSlot.children.push(...overlappingSlots);
                mergedSlots.push(...overlappingSlots);

                currentInterval = {
                    start: newSlot.startTime,
                    end: endTime(newSlot),
                } as Interval;
                overlappingSlots = workSlots.filter(
                    (x) =>
                        !newSlot.children.includes(x) &&
                        timedate.areIntervalsOverlapping(
                            currentInterval,
                            { start: x.startTime, end: endTime(x) },
                            { inclusive: true }
                        )
                );
            }
            result.push(newSlot);
        }
    });

    return result;
}


export function getStartTimes(slot: Slot): Date[] {
    const result: Set<Date> = new Set();
    let start = slot.startTime;
    const end = endTime(slot);
    while (start.getTime() < end.getTime()) {
        result.add(start);
        start = timedate.add(start, {minutes: 30});
    }
    return [...result];
}
