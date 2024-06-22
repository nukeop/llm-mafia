export enum Team {
  Machines = 'Machines',
  Humans = 'Humans',
}

export class Player {
  constructor(
    public name: string,
    public team: Team,
  ) {}
}
