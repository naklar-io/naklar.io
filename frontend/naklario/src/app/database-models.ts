export class State {
  constructor(
    public id: number,
    public name: string,
    public shortcode: string
  ) {}
}

export class Subject {
  constructor(public id: number, public name: string) {}
}
export class SchoolType {
  constructor(public id: number, public name: string) {}
}

export class SchoolData {
  constructor(
    public id: number,
    public school_type: SchoolType,
    public grade: number
  ) {}
}


export class User {
  constructor(
    public email: string,
    public password: string,
    public first_name: string,
    public last_name: string,
    public state: number,
    public studentdata: number,
    public tutordata: number
  ) {}
}