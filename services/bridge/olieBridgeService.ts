import { dataService } from '../dataService';

export const getData = (table: string, join?: string) => {
    return dataService.getCollection(table, join);
}
