export enum Team {
  Machines,
  Humans,
}

export class Player {
  constructor(
    public name: string,
    public team: Team,
  ) {}
}
