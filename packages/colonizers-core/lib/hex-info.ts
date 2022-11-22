export default class HexInfo {
  circumradius: number = 100;

  get apothem() {
    return Math.sqrt(
      Math.pow(this.circumradius, 2) - Math.pow(this.circumradius / 2, 2)
    );
  }
}
