import { backendApi } from '..';

import { ListMapper } from '../mappers/list.mapper';

import { ListDto } from '../dtos/list.dto';

import { TokenService } from './tokenService';

export namespace ListService {
  export const getLists = async() => {
        const { data } = await backendApi.get<readonly ListDto[]>('/list', {
            headers: { 'x-access-token': TokenService.get() as string },
        });
        const result = data.map(list => ListMapper.fromDto(list));
        return result;
    };
}
