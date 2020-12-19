export function deserializeDuration(duration: string): Duration {
    const split = duration.split(':').reverse();
    const result: Duration = {};
    for (let index = 0; index < split.length; index++) {
        const element = split[index];
        switch (index) {
            case 0:
                result.seconds = parseInt(element, 10);
                break;
            case 1:
                result.minutes = parseInt(element, 10);
                break;
            case 2:
                result.hours = parseInt(element, 10);
                break;
            default:
                break;
        }
    }
    return result;
}

function zeroFill(num, width) {
    width -= num.toString().length;
    if (width > 0) {
        return new Array(width + (/\./.test(num) ? 2 : 1)).join('0') + num;
    }
    return num + ''; // always return a string
}

export function serializeDuration(duration: Duration): string {
    let result = '';
    if (duration.seconds) {
        result = `${zeroFill(duration.seconds, 2)}${result}`;
    } else {
        result = `00`;
    }
    if (duration.minutes) {
        result = `${zeroFill(duration.minutes, 2)}:${result}`;
    } else {
        result = `00:${result}`;
    }
    if (duration.hours) {
        result = `${zeroFill(duration.hours, 2)}:${result}`;
    } else {
        result = `00:${result}`;
    }

    return result;
}
