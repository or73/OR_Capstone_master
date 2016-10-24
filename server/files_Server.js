/**
  SERVER
*/

Meteor.startup(function() 
              {
                // code to run on server at startup
                console.log('* * * * * * * * * * * * * * * *');
                console.log('*   Server is Up & Running    *');
                console.log('* * * * * * * * * * * * * * * *');                              
              });


Meteor.publish('allData', 
                function(clientUserId) 
                {
                  if (this.userId === clientUserId) 
                  {
                    //console.log('server:', myData.find());
                    return myData.find({
                                          $or: [
                                                  {'metadata._Resumable': {
                                                                            $exists: false
                                                                          },
                                                  'metadata._auth.owner': this.userId//,
                                                  /*'metadata.private':   false{
                                                                            $private: false
                                                                        }*/
                                                  },
                                                  { 'metadata.private': { $ne: true}}
                                                ]
                                        });
                  } else {
                    return [];
                  }
                });

myData.allow({
                insert: function(userId, file) 
                        {
                          var ref;
                          file.metadata = (ref = file.metadata) != null ? ref : {};
                          file.metadata._auth = {
                                                  owner: userId
                                                };
                          return true;
                        },
                remove: function(userId, file) 
                        {
                          var ref, ref1;
                          if (((ref = file.metadata) != null ? (ref1 = ref._auth) != null ? ref1.owner : void 0 : void 0) && userId !== file.metadata._auth.owner) 
                          {
                            return false;
                          }
                          return true;
                        },
                read: function(userId, file) 
                      {                       
                        console.log('file.metadata: ', file.metadata);
                        console.log('file.metadata.private: ', file.metadata.private);
                        console.log('file.metadata.owner: ', file.metadata._auth.owner); 
                        console.log('userId: ', userId);
                        return (userId === file.metadata._auth.owner || !file.metadata.private);
                      },
                write: function(userId, file, fields) 
                        {
                          var ref, ref1;
                          if (((ref = file.metadata) != null ? (ref1 = ref._auth) != null ? ref1.owner : void 0 : void 0) && userId !== file.metadata._auth.owner) 
                          {
                            return false;
                          }
                          return true;
                        }
              });



Meteor.methods({
                  fileOwner: function(fileId)
                            {
                              console.log("fileId: ", fileId);
                              console.log("fileId_str: ", fileId._str);
                              var file = myData.findOne({_id: fileId});
                              var userId = file.metadata._auth.owner;
                              console.log("file: ", file);
                              console.log("\n\nuserId: ", userId);
                              console.log("this.userId: ", this.userId);
                              console.log("file.metadata: ", file.metadata);
                              var userName = Meteor.users.findOne(userId).username;
                              console.log("user: ", userName);

                              //myData.update({_id: fileId}, {$set: {ownerName: userName}});
                              //myData.update({_id: fileId}, {$set: {ownerId: this.userId}});

                              return userName;
                            },

                  setPrivateMyData: function(file)
                                    {
                                      console.log("file: ", file);
                                      console.log("file private status: ", file.metadata.private);

                                      myData.update({_id: file._id}, {$set: {'metadata.private': !file.metadata.private}});
                                      console.log("file private status updated to: ", !file.metadata.private);
                                      return;
                                    },
                                    
                  private: function(file)
                            {
                                console.log("file: ", file);
                                console.log("file private status: ", file.metadata.private);

                                return file.metadata.private;
                            }
              });
             


