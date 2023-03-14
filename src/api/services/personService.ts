import { api } from '..';

export namespace PersonService {
  export async function fetchPerson(id: number) {
    const { data } = await api.get<any>(`/person/${id}`);
    return data;
  }
}
