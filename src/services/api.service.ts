import { BASE_URL } from "@constants";

export class ApiService {
  static getPosition(nodeId: string): Promise<{ x: number; y: number }> {
    return fetch(`${BASE_URL.positions}/${nodeId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    }).then((res) => res.json());
  }

  /* ---------------------------------------------------------------------------------------------- */

  static updatePosition(nodeId: string, body: { x: number; y: number }): Promise<{ x: number; y: number }> {
    return fetch(`${BASE_URL.positions}/${nodeId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }).then((res) => res.json());
  }
}
