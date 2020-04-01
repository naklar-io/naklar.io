export class State {
  constructor(
    public id: number = -1,
    public name: string = "",
    public shortcode: string = ""
  ) {}
}

export class Subject {
  constructor(public id: number = -1, public name: string = "") {}
}
export class SchoolType {
  constructor(public id: number = -1, public name: string = "") {}
}

export class SchoolData {
  constructor(
    public id: number = -1,
    public school_type: number = -1,
    public grade: number = -1
  ) {}
}

export class StudentData {
  constructor(public schoolData: SchoolData = new SchoolData()) {}
}

export class TutorData {
  constructor(
    public schoolData: SchoolData[] = [new SchoolData()],
    public subjects: Subject[] = [new Subject()]
  ) {}
}

export class User {
  constructor(
    public email: string = "",
    public password: string = "",
    public first_name: string = "",
    public last_name: string = "",
    public state: State = new State(),
    public studentdata: StudentData = new StudentData(),
    public tutordata: TutorData = new TutorData()
  ) {}
}

export const sendable = (obj: any, clone = true) => {
  if (!(typeof obj === "object")) {
    return obj;
  } else if (obj instanceof Array) {
    return obj.map(x => sendable(x));
  } else if (obj instanceof SchoolData) {
    return obj.id;
  } else if (obj instanceof Subject) {
    return obj.id;
  } else if (obj instanceof State) {
    return obj.id;
  }
  let res = clone ? {} : obj;
  // recurse
  for (let [key, value] of Object.entries(obj)) {
    res[key] = sendable(value);
  }
  return res;
};
export const states: State[] = [
  {
    id: 1,
    name: "Baden-Württemberg",
    shortcode: "BW"
  },
  {
    id: 2,
    name: "Bayern",
    shortcode: "BY"
  },
  {
    id: 3,
    name: "Berlin",
    shortcode: "BE"
  },
  {
    id: 4,
    name: "Brandenburg",
    shortcode: "BB"
  },
  {
    id: 5,
    name: "Hamburg",
    shortcode: "HH"
  },
  {
    id: 6,
    name: "Hessen",
    shortcode: "HE"
  },
  {
    id: 7,
    name: "Mecklenburg-Vorpommern",
    shortcode: "MV"
  },
  {
    id: 8,
    name: "Niedersachsen",
    shortcode: "NI"
  },
  {
    id: 9,
    name: "Nordrhein-Westfalen",
    shortcode: "NW"
  },
  {
    id: 10,
    name: "Rheinland-Pfalz",
    shortcode: "RP"
  },
  {
    id: 11,
    name: "Saarland",
    shortcode: "SL"
  },
  {
    id: 12,
    name: "Sachsen",
    shortcode: "SN"
  },
  {
    id: 13,
    name: "Sachsen-Anhalt",
    shortcode: "ST"
  },
  {
    id: 14,
    name: "Schleswig-Holstein",
    shortcode: "SH"
  },
  {
    id: 15,
    name: "Thüringen",
    shortcode: "TH"
  }
];

export const subjects: Subject[] = [
  {
    id: 14,
    name: "Deutsch"
  },
  {
    id: 15,
    name: "Mathematik"
  },
  {
    id: 16,
    name: "Englisch"
  },
  {
    id: 17,
    name: "Französisch"
  },
  {
    id: 18,
    name: "Latein"
  },
  {
    id: 19,
    name: "Physik"
  },
  {
    id: 20,
    name: "Chemie"
  },
  {
    id: 21,
    name: "Biologie"
  },
  {
    id: 22,
    name: "Musik"
  },
  {
    id: 23,
    name: "Geschichte"
  },
  {
    id: 24,
    name: "Geographie"
  },
  {
    id: 25,
    name: "Wirtschaft/Recht"
  },
  {
    id: 26,
    name: "Informatik"
  }
];

export const schoolTypes: SchoolType[] = [
  {
    id: 1,
    name: "Gymnasium"
  },
  {
    id: 2,
    name: "Realschule"
  },
  {
    id: 3,
    name: "Mittelschule"
  },
  {
    id: 4,
    name: "FOS/BOS"
  }
];

export const schoolData: SchoolData[] = [
  {
    id: 1,
    grade: 5,
    school_type: 1
  },
  {
    id: 2,
    grade: 6,
    school_type: 1
  },
  {
    id: 3,
    grade: 7,
    school_type: 1
  },
  {
    id: 4,
    grade: 8,
    school_type: 1
  },
  {
    id: 5,
    grade: 9,
    school_type: 1
  },
  {
    id: 6,
    grade: 10,
    school_type: 1
  },
  {
    id: 7,
    grade: 11,
    school_type: 1
  },
  {
    id: 8,
    grade: 12,
    school_type: 1
  },
  {
    id: 9,
    grade: 13,
    school_type: 1
  },
  {
    id: 10,
    grade: 5,
    school_type: 2
  },
  {
    id: 11,
    grade: 6,
    school_type: 2
  },
  {
    id: 12,
    grade: 7,
    school_type: 2
  },
  {
    id: 13,
    grade: 8,
    school_type: 2
  },
  {
    id: 14,
    grade: 9,
    school_type: 2
  },
  {
    id: 15,
    grade: 10,
    school_type: 2
  },
  {
    id: 16,
    grade: 5,
    school_type: 3
  },
  {
    id: 17,
    grade: 6,
    school_type: 3
  },
  {
    id: 18,
    grade: 7,
    school_type: 3
  },
  {
    id: 19,
    grade: 8,
    school_type: 3
  },
  {
    id: 20,
    grade: 9,
    school_type: 3
  },
  {
    id: 21,
    grade: 10,
    school_type: 3
  },
  {
    id: 22,
    grade: 5,
    school_type: 4
  },
  {
    id: 23,
    grade: 6,
    school_type: 4
  },
  {
    id: 24,
    grade: 7,
    school_type: 4
  },
  {
    id: 25,
    grade: 8,
    school_type: 4
  },
  {
    id: 26,
    grade: 9,
    school_type: 4
  },
  {
    id: 27,
    grade: 10,
    school_type: 4
  },
  {
    id: 28,
    grade: 11,
    school_type: 4
  },
  {
    id: 29,
    grade: 12,
    school_type: 4
  },
  {
    id: 30,
    grade: 13,
    school_type: 4
  }
];
