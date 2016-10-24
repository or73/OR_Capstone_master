/**
  CLIENT
*/
var shorten, truncateId;
var counter = 0;

Meteor.subscribe('allData');

import { Template } from'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import './templates.html';

Meteor.startup(function() 
              {
                myData.resumable
                  .on('fileAdded', 
                      function(file) 
                      {
                        Session.set(file.uniqueIdentifier, 0);
                        console.log("Meteor.startup: ADDING TO Documents");
                        console.log("* * * * * * * * * ");
                        console.log("* * * * * * * * * ");
                        console.log("Meteor.userId(): ", Meteor.userId());
                        console.log("Meteor.userId().username: ", Meteor.user({'_id': Meteor.userId()}).username);
                        console.log("this._id: ", this._id);
                        console.log("this:", this);
                        console.log("this.metadata:", this.metadata);
                        console.log("file: ", file);
                        console.log("* * * * * * * * * ");
                        console.log("* * * * * * * * * ");
                        
                        return myData.insert({
                                              _id: file.uniqueIdentifier,
                                              filename: file.fileName,
                                              contentType: file.file.type,                                              
                                              metadata: {
                                                            ownerId: Meteor.userId(),
                                                            ownerName: Meteor.user({'_id': Meteor.userId()}),
                                                            private: false
                                                        }
                                              /*
                                              myData.update({_id: fileId}, {$set: {ownerName: userName}});
                                              myData.update({_id: fileId}, {$set: {ownerId: this.userId}});
                                              */
                                            }, 
                                            function(err, _id) 
                                            {
                                              if (err) 
                                              {
                                                console.warn("(myData-insert) File creation failed!", err);
                                                return;
                                              }
                                              return myData.resumable.upload();
                                            });
                      });

                myData.resumable
                  .on('fileProgress', 
                      function(file) 
                      {
                        return Session.set(file.uniqueIdentifier, Math.floor(100 * file.progress()));
                      });

                myData.resumable
                  .on('fileSuccess', 
                      function(file) 
                      {
                        return Session.set(file.uniqueIdentifier, void 0);
                      });

                return myData.resumable
                        .on('fileError', 
                            function(file) 
                            {
                              console.warn("Error uploading", file.uniqueIdentifier);
                              return Session.set(file.uniqueIdentifier, void 0);
                            });
              });

Tracker.autorun(function() 
                {
                  var userId;
                  userId = Meteor.userId();
                  Meteor.subscribe('allData', userId);
                  return $.cookie('X-Auth-Token', 
                                  Accounts._storedLoginToken(), 
                                  {
                                    path: '/'
                                  });
                });

shorten = function(name, w) 
          {
            if (w == null) 
            {
              w = 16;
            }
            w += w % 4;
            w = (w - 4) / 2;
            if (name.length > 2 * w) 
            {
              return name.slice(0, +w + 1 || 9e9) + '…' + name.slice(-w - 1);
            } else {
              return name;
            }
          };

truncateId = function(id, length) 
            {
              if (length == null) 
              {
                length = 6;
              }

              if (id) 
              {
                if (typeof id === 'object') 
                {
                  id = "" + (id.valueOf());
                }
                return (id.substr(0, 6)) + "…";
              } else {
                return "";
              }
            };

Template.registerHelper("truncateId", truncateId);



/* * * * * * * * * * * * * * * * * * * *
          TEMPLATE - filesList
 * * * * * * * * * * * * * * * * * * * */
Template.filesList
  .onRendered(function() 
              {
                myData.resumable.assignDrop($('.fileDrop'));
              });

Template.filesList
  .events({
            'click .del-file': function(event, template) 
                              {
                                if (Session.get("" + this._id)) 
                                {
                                  console.warn("Cancelling active upload to remove file! " + this._id);
                                  myData.resumable.removeFile(myData.resumable.getFromUniqueIdentifier("" + this._id));
                                }

                                console.log("click .del-file: this: ", this);
                                console.log("click .del-file: this._id: ", this._id._str); 

                                return myData.remove({
                                                      _id: this._id
                                                    });
                              },

            'change .toggle-checked': function(event, template)
                                      {
                                        // Meteor.call('updateResolution', this._id, !this.checked);                                        
                                        console.log("toggle-checked - event.id: ", event.currentTarget.id);
                                        console.log("toggle-checked - event.currentTarget.value: ", event.currentTarget.value);// public or private
                                        
                                        if (event.currentTarget.id == 'private')
                                        {
                                          console.log("private has been pressed!!!");
                                          Session.set('checked', event.currentTarget.id);
                                        } else if (event.currentTarget.id == 'public') {
                                          console.log("public has been pressed!!!");
                                          Session.set('checked', event.currentTarget.id);
                                        } else {
                                          console.log("all has been pressed!!!");
                                          Session.set('checked', event.currentTarget.id);
                                        }

                                      },

            'click .toggle-private': function(event, template)
                                      {
                                        console.log("filesList.events - toggle-private - event: ", event);
                                        console.log("filesList.events - toggle-private - template: ", template);

                                        console.log("filesList.events - toggle-private - this: ", this);
                                        var fileName =this.filename;

                                        console.log("filesList.events - toggle-private - fileName: ", fileName);
                                        
                                        var toReturnMyData = Meteor.call('setPrivateMyData', this);
                                        console.log("|--> toReturnMyData: ", toReturnMyData);

                                        var element = event.currentTarget.id;
                                        var innerText = event.currentTarget.innerText;
                                        var innerHTML = event.currentTarget.innerHTML;
                                        var currentId = "row" + String((parseInt(event.currentTarget.id) + 1));

                                        console.log("button + id: ", element);
                                        console.log("innerText: ", innerText);
                                        if (innerText == 'Public' || innerHTML == 'Public')
                                        {   
                                            console.log("-----> Modifying Public to Private: ", ("#" + currentId));
                                            event.currentTarget.innerText = 'Private';
                                            event.currentTarget.innerHTML = 'Private';
                                                                                        
                                            //$(this).closest('tr').removeClass('Public').addClass('Private');
                                            $(event.currentTarget).closest('tr').removeClass('Public').addClass('Private');
                                                                                        
                                            console.log("final innerText: ", event.currentTarget.innerText);
                                            return true;                                                         
                                        } else if (innerText == 'Private' || innerHTML == 'Private')
                                        {
                                            console.log("-----> Modifying Private to Public", ("#" + currentId));
                                            event.currentTarget.innerText = 'Public';
                                            event.currentTarget.innerHTML = 'Public';
                                            
                                            //$(this).closest('tr').removeClass("Private").addClass('Public');
                                            $(event.currentTarget).closest('tr').removeClass("Private").addClass('Public');
                                            console.log("final innerText: ", event.currentTarget.innerText);                                 
                                            return false;
                                        }

                                        return toReturnMyData;
                                      },
            'click .btn-default': function (event, template)
                                  {
                                    console.log("btn-default - event: ", event);
                                    console.log("btn-default - template: ", template);
                                    console.log("btn-default - this: ", this);
                                    $('tr').show();
                                    if (event.currentTarget.innerHTML == 'Public')
                                    {
                                      console.log("filtering by Public");
                                      $('.Private').hide();
                                      $('.Public').show();
                                    }
                                    else if (event.currentTarget.innerHTML == 'Private')
                                    {
                                      console.log("filetering by Private");
                                      $('.Public').hide();
                                      $('.Private').show();
                                    }
                                    else
                                    {
                                        console.log("showing all files");
                                        $('.Private').show();
                                        $('.Public').show();
                                    }
                                    
                                    //.show();
                                    //$('.' + event.currentTarget.innerHTML).hide();
                                  }
          });

Template.filesList
  .helpers({
              cssFile: function()
                      {
                        var FileExtension, css;

                        css = { 'css': true};
                        fileExtension = (this.filename).split('.').pop();

                        if (css[fileExtension])
                          return true;
                      },

              csvFile: function()
                      {
                        var FileExtension, csv;

                        csv = { 'csv': true};
                        fileExtension = (this.filename).split('.').pop();

                        if (csv[fileExtension])
                          return true;
                      },

              excelFile: function()
                      {
                        var fileExtension, excel;

                        
                        excel = { 'xlsx': true, 'xsl': true};
                        
                        fileExtension = (this.filename).split('.').pop();
                        
                        if (excel[fileExtension])
                          return true;
                      },

              dataEntries: function() 
                          {
                            console.log("fileList.helpers - dataEntries...");
                            return myData.find({});
                          },

              formattedLength: function() 
                              {
                                return numeral(this.length).format('0.0b');
                              },
              
              id: function() 
                  {
                    return "" + this._id;
                  },

              isImage: function() 
                      {
                        var types;
                        types = {
                                  'image/jpeg': true,
                                  'image/png': true,
                                  'image/gif': true,
                                  'image/tiff': true
                                };
                        return (types[this.contentType] != null) && this.md5 !== 'd41d8cd98f00b204e9800998ecf8427e';
                      },

              jsonFile: function()
                      {
                        var FileExtension, json;

                        json = { 'json': true};
                        fileExtension = (this.filename).split('.').pop();

                        if (json[fileExtension])
                          return true;
                      },

              link: function() 
                    {
                      return myData.baseURL + "/md5/" + this.md5;
                    },

              loginToken: function() 
                          {
                            Meteor.userId();
                            return Accounts._storedLoginToken();
                          },

              noneFile: function()
                      {
                        var fileExtension, types;

                        fileExtension = (this.filename).split('.').pop();

                        types = {                                    
                                  'css': true,
                                  'csv': true,
                                  'doc':true,
                                  'docx':true,
                                  'jpg': true,
                                  'jpeg': true,                                  
                                  'gif': true,                                                                    
                                  'pdf': true,
                                  'png': true,
                                  'pptx': true,
                                  'ppt': true,                                  
                                  'json': true,
                                  'tiff': true,
                                  'txt': true,
                                  'xlsx': true,
                                  'xsl': true
                                };

                        if (!types[fileExtension])
                          return true;
                        return false;
                      },

              owner: function() 
                    {
                      var ref, ref1;
                      console.log("owner: ", this.ownerName);
                      console.log("Meteor.user: ", Meteor.user().username);
                      if (Meteor.user().username === this.metadata.ownerName.username)
                      {
                        console.log("Same userId");
                        return true;
                      }
                      else
                        return false;
                    },

              ownerName: function()
                        {
                          console.log("ownerName - Meteor.user(): ", Meteor.user());
                          console.log("ownerName - Meteor.user().username: ", Meteor.user().username);
                          console.log("ownerName - this_id: ", this._id);
                          console.log("ownerName - this: ", this);                        
                        
                            console.log('this.ownerName: ', this.ownerName);

                            if (typeof(this.metadata.ownerName) == 'undefined')
                            {
                                return 'Not owner';
                            } else 
                            {
                                console.log("this.ownerName: ", this.metadata.ownerName.username);
                                return this.metadata.ownerName.username;
                            }
                            
                        },

              pdfFile: function()
                      {
                        var fileExtension, pdf;

                        pdf = { 'pdf': true };

                        fileExtension = (this.filename).split('.').pop();

                        if (pdf[fileExtension])
                          return true;
                      },

              ppointFile: function()
                      {
                        var fileExtension, ppoint;

                        ppoint = { 'pptx': true, 'ppt': true};
                        
                        fileExtension = (this.filename).split('.').pop();

                        if (ppoint[fileExtension])
                          return true;
                      },

              private: function()
                      {
                        console.log('|--> private option: ', this.metadata.private);
                        
                        return this.metadata.private;
                      },
                        
              shortFilename: function(w) 
                            {
                              var ref;
                              if (w == null) 
                              {
                                w = 16;
                              }

                              if ((ref = this.filename) != null ? ref.length : void 0) 
                              {
                                return shorten(this.filename, w);
                              } else {
                                return "(no filename)";
                              }
                            },

              timeFlag: function()
                        {
                          counter ++;
                          //Meteor.call('timeFlag', counter);
                          return counter;
                        },

              txtFile: function()
                      {
                        var FileExtension, txt;

                        txt = { 'txt': true};
                        fileExtension = (this.filename).split('.').pop();

                        if (txt[fileExtension])
                          return true;
                      },

              uploadStatus: function() 
                            {
                              var percent;
                              percent = Session.get("" + this._id);
                              if (percent == null) 
                              {
                                return "Processing...";
                              } else {
                                return "Uploading...";
                              }
                            },
              
              uploadProgress: function() 
                              {
                                var percent;
                                return percent = Session.get("" + this._id);
                              },

              userId: function() 
                      {
                        return Meteor.userId();
                      },

              wordFile: function()
                      {
                        var fileExtension, word;
                        
                        word = { 'doc': true, 'docx': true};

                        fileExtension = (this.filename).split('.').pop();

                        if (word[fileExtension])
                          return true;
                      }
            });



/* * * * * * * * * * * * * * * * * * * *
          Accounts Config
 * * * * * * * * * * * * * * * * * * * */

Accounts.ui.config({
                        passwordSignupFields: "USERNAME_AND_EMAIL"
                    });
