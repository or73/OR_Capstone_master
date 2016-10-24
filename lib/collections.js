/**
    Both client and server
*/


/**
  Documents Collection
*/
//Documents = new Mongo.Collection('documents');



/**
  myData FileCollection
*/
//this.myData = new FileCollection({
myData = new FileCollection({
                              resumable: true,
                              resumableIndexName: 'test',
                              http: [
                                      {
                                        method: 'get',
                                        path: '/md5/:md5',
                                        lookup: function(params, query) 
                                                {
                                                  return {
                                                            md5: params.md5
                                                          };
                                                }
                                      }
                                    ]
                            });
