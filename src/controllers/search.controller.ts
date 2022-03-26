import { NextFunction, Request, Response } from 'express';
import cache from "@utils/Cache";
import { FindServerCommentsDataList, FindServerData } from '@interfaces/servers.interface';
import searchService from '@services/search.service';
import { SearchResult, SearchResultReturn } from '@/interfaces/search.interface';

class SearchController {
  public searchService = new searchService();

  public searchByQuery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // @ts-ignore
      if(!req.query.page) req.query.page = 1;
      let cacheData = cache.get(`search_${req.query.query}_${req.query.page}`);
      if(cacheData) {
        res.status(200).json({ status: 200, data: cacheData, message: '요청을 성공적으로 실행했습니다.' });
      } else {
        const searchResult: SearchResultReturn = await this.searchService.SearchByQuery(req.query.query as string, Number(req.query.page));
        res.status(200).json({ status: 200, message: '요청을 성공적으로 실행했습니다.', data: searchResult });
        cache.set(`search_${req.query.query}_${req.query.page}`, searchResult, 60 * 30);
      }
    } catch (error) {
      next(error);
    }
  };
}

export default SearchController;
