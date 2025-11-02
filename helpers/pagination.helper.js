const paginationHelper= (query)=>{
    const paginationObj={
    currentPage:1,
    limit:5,
    offset:0
    }

    if (query.page){
        let page= parseInt(query.page);
        if (!isNaN(page) && page>0)
            paginationObj.currentPage=page;
    }
        
   
    if (query.limit){
        let limit= parseInt(query.limit);
        if (!isNaN(limit) && limit>0)
            paginationObj.limit=limit;
    }
        

    paginationObj.offset= (paginationObj.currentPage-1)*paginationObj.limit;

    return paginationObj;
}

module.exports = paginationHelper